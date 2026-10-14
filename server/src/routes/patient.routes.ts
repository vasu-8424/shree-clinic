import { Router, Request, Response } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import fs from 'fs';
import { DepartmentType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { normalizePhoneNumber } from '../utils/phone.js';
import { generateNextUHID } from '../utils/counter.js';
import { encryptField, decryptField } from '../utils/crypto.js';
import { createAuditLog } from '../utils/audit.js';
import { requireActiveConsent, ConsentError } from '../utils/consent.js';

export { requireActiveConsent, ConsentError };

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// VALIDATION SCHEMAS
// -------------------------------------------------------------

const createPatientSchema = z.object({
  fullName: z.string().trim().min(1, 'Patient full name is required').max(150),
  phone: z.string().trim().min(8, 'Valid phone number is required').max(20),
  alternatePhone: z.string().trim().max(20).optional().nullable(),
  email: z.string().trim().email('Invalid email address').max(120).optional().nullable().or(z.literal('')),
  age: z.coerce.number().int().min(0).max(130).optional().nullable(),
  gender: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  referralSource: z.string().trim().max(150).optional().nullable(),
  chiefComplaint: z.string().trim().min(1, 'Chief complaint is required').max(2000),
  caseHistory: z.string().trim().max(10000).optional().nullable(),
  // DPDP Act 2023: Explicit consent is mandatory
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Explicit patient consent is legally required under DPDP Act 2023.' }),
  }),
  consentVersion: z.string().trim().default('1.0'),
  consentNotes: z.string().trim().max(500).optional().nullable(),
  allowDuplicate: z.boolean().default(false),
});

const updatePatientSchema = z.object({
  fullName: z.string().trim().min(1).max(150).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
  alternatePhone: z.string().trim().max(20).optional().nullable(),
  email: z.string().trim().email().max(120).optional().nullable().or(z.literal('')),
  age: z.coerce.number().int().min(0).max(130).optional().nullable(),
  gender: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  referralSource: z.string().trim().max(150).optional().nullable(),
  chiefComplaint: z.string().trim().min(1).max(2000).optional(),
  caseHistory: z.string().trim().max(10000).optional().nullable(),
});

const erasePatientSchema = z.object({
  adminPassword: z.string().min(1, 'Admin password is required for permanent data erasure'),
  confirmationText: z.literal('PERMANENTLY ERASE', {
    errorMap: () => ({ message: 'Confirmation must exactly match "PERMANENTLY ERASE"' }),
  }),
});

const newConsentSchema = z.object({
  consentVersion: z.string().trim().default('1.0'),
  notes: z.string().trim().max(500).optional().nullable(),
});

// Helper: Check if active consent exists for a patient
export async function assertPatientHasActiveConsent(patientId: string): Promise<boolean> {
  await requireActiveConsent(patientId);
  return true;
}

// -------------------------------------------------------------
// 1. POST /api/v1/patients - Create Patient & Consent in 1 Transaction
// -------------------------------------------------------------
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createPatientSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid input',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const data = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(data.phone);
    const normalizedAltPhone = data.alternatePhone ? normalizePhoneNumber(data.alternatePhone) : null;
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;

    // Check duplicate name + phone
    const existingDuplicate = await prisma.patient.findFirst({
      where: {
        phone: normalizedPhone,
        fullName: { equals: data.fullName, mode: 'insensitive' },
        isDeleted: false,
      },
      select: { id: true, uhid: true, fullName: true, phone: true },
    });

    if (existingDuplicate && !data.allowDuplicate) {
      res.status(409).json({
        error: 'A patient with this phone number and name already exists. Family members sharing a phone can be added by enabling the duplicate override.',
        code: 'DUPLICATE_PATIENT',
        existingPatient: {
          id: existingDuplicate.id,
          uhid: existingDuplicate.uhid,
        },
      });
      return;
    }

    // Encrypt case history at rest
    const encryptedCaseHistory = encryptField(data.caseHistory);

    // Atomically create Patient and ConsentRecord with UHID in 1 transaction
    const result = await prisma.$transaction(async (tx) => {
      const uhid = await generateNextUHID(tx as any);

      const patient = await tx.patient.create({
        data: {
          uhid,
          fullName: data.fullName,
          phone: normalizedPhone,
          alternatePhone: normalizedAltPhone,
          email: data.email || null,
          age: data.age ?? null,
          gender: data.gender || null,
          address: data.address || null,
          referralSource: data.referralSource || null,
          chiefComplaint: data.chiefComplaint,
          caseHistory: encryptedCaseHistory,
        },
      });

      const consentRecord = await tx.consentRecord.create({
        data: {
          patientId: patient.id,
          consentVersion: data.consentVersion,
          consentGiven: true,
          consentDate: new Date(),
          withdrawn: false,
          ipAddress: clientIp,
          notes: data.consentNotes || 'Consent collected during patient registration',
        },
      });

      return { patient, consentRecord };
    });

    // Write audit log (Strict DPDP: IDs and UHID only, no names or clinical text)
    await createAuditLog({
      adminId: req.admin?.id,
      action: 'CREATE',
      entity: 'Patient',
      entityId: result.patient.id,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || null,
      details: { uhid: result.patient.uhid },
    });

    res.status(201).json({
      success: true,
      data: {
        ...result.patient,
        caseHistory: data.caseHistory, // Return cleartext for immediate display
        consent: {
          status: 'ACTIVE',
          version: result.consentRecord.consentVersion,
          date: result.consentRecord.consentDate,
        },
      },
    });
  } catch (error: any) {
    console.error('Create patient failed:', error);
    res.status(500).json({ error: 'Failed to create patient record.', message: error.message });
  }
});

// -------------------------------------------------------------
// 2. GET /api/v1/patients - Search, Filter, Sort, Paginate
// -------------------------------------------------------------
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim() || '';
    const gender = (req.query.gender as string)?.trim() || '';
    const minAge = req.query.minAge ? parseInt(req.query.minAge as string) : undefined;
    const maxAge = req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { uhid: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (gender) {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    if (minAge !== undefined || maxAge !== undefined) {
      where.age = {};
      if (minAge !== undefined) where.age.gte = minAge;
      if (maxAge !== undefined) where.age.lte = maxAge;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    const allowedSortFields: Record<string, string> = {
      createdAt: 'createdAt',
      fullName: 'fullName',
      uhid: 'uhid',
      age: 'age',
    };
    const orderField = allowedSortFields[sortBy] || 'createdAt';

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
        select: {
          id: true,
          uhid: true,
          fullName: true,
          phone: true,
          alternatePhone: true,
          email: true,
          age: true,
          gender: true,
          address: true,
          referralSource: true,
          chiefComplaint: true,
          createdAt: true,
          updatedAt: true,
          consentRecords: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              consentGiven: true,
              withdrawn: true,
              consentDate: true,
              consentVersion: true,
            },
          },
        },
      }),
    ]);

    const formattedPatients = patients.map((p) => {
      const latestConsent = p.consentRecords[0];
      const hasActiveConsent = !!latestConsent && latestConsent.consentGiven && !latestConsent.withdrawn;
      return {
        ...p,
        consentStatus: hasActiveConsent ? 'ACTIVE' : 'WITHDRAWN',
        consentRecords: undefined, // cleaner output
      };
    });

    res.status(200).json({
      data: formattedPatients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('List patients failed:', error);
    res.status(500).json({ error: 'Failed to retrieve patients.', message: error.message });
  }
});

// -------------------------------------------------------------
// 3. GET /api/v1/patients/:id - Full Profile + Decrypted Case History
// -------------------------------------------------------------
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id, isDeleted: false },
      include: {
        consentRecords: {
          orderBy: { createdAt: 'desc' },
        },
        visits: {
          orderBy: { visitDate: 'desc' },
        },
        audiograms: {
          orderBy: { testDate: 'desc' },
        },
        hearingAidTrials: {
          orderBy: { trialStartDate: 'desc' },
          include: { inventory: true },
        },
        therapyPlans: {
          orderBy: { createdAt: 'desc' },
          include: {
            sessions: { orderBy: { sessionNumber: 'asc' } },
          },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          include: { items: true, payments: true },
        },
        appointments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found.', code: 'NOT_FOUND' });
      return;
    }

    // Decrypt caseHistory here only
    const decryptedCaseHistory = decryptField(patient.caseHistory);

    const decryptedVisits = patient.visits.map((v) => ({
      ...v,
      notes: decryptField(v.notes),
    }));

    const decryptedTherapyPlans = patient.therapyPlans.map((tp) => ({
      ...tp,
      sessions: tp.sessions.map((s) => ({
        ...s,
        subjective: decryptField(s.subjective),
        objective: decryptField(s.objective),
      })),
    }));

    const latestConsent = patient.consentRecords[0];
    const hasActiveConsent = !!latestConsent && latestConsent.consentGiven && !latestConsent.withdrawn;

    // DPDP Act 2023: Write VIEW audit entry with patient ID only (no clinical text)
    await createAuditLog({
      adminId: req.admin?.id,
      action: 'VIEW',
      entity: 'Patient',
      entityId: patient.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { uhid: patient.uhid },
    });

    res.status(200).json({
      data: {
        ...patient,
        caseHistory: decryptedCaseHistory,
        visits: decryptedVisits,
        therapyPlans: decryptedTherapyPlans,
        hasActiveConsent,
        consentStatus: hasActiveConsent ? 'ACTIVE' : 'WITHDRAWN',
      },
    });
  } catch (error: any) {
    console.error('Get patient detail failed:', error);
    res.status(500).json({ error: 'Failed to retrieve patient profile.', message: error.message });
  }
});

// -------------------------------------------------------------
// 4. PATCH /api/v1/patients/:id - Update Fields & Re-encrypt
// -------------------------------------------------------------
router.patch('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const parseResult = updatePatientSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid input',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const updates = parseResult.data;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields provided for update.' });
      return;
    }

    const existingPatient = await prisma.patient.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingPatient) {
      res.status(404).json({ error: 'Patient not found.', code: 'NOT_FOUND' });
      return;
    }

    const dataToUpdate: any = {};
    const changedFieldNames: string[] = [];

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        changedFieldNames.push(key);
        if (key === 'phone' && typeof val === 'string') {
          dataToUpdate.phone = normalizePhoneNumber(val);
        } else if (key === 'alternatePhone' && typeof val === 'string') {
          dataToUpdate.alternatePhone = normalizePhoneNumber(val);
        } else if (key === 'caseHistory') {
          dataToUpdate.caseHistory = encryptField(val as string | null);
        } else {
          dataToUpdate[key] = val;
        }
      }
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: dataToUpdate,
    });

    // DPDP Act 2023: Audit log records CHANGED FIELD NAMES only (no values or health details)
    await createAuditLog({
      adminId: req.admin?.id,
      action: 'UPDATE',
      entity: 'Patient',
      entityId: id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { changedFields: changedFieldNames },
    });

    res.status(200).json({
      success: true,
      data: {
        ...updated,
        caseHistory: decryptField(updated.caseHistory),
      },
    });
  } catch (error: any) {
    console.error('Update patient failed:', error);
    res.status(500).json({ error: 'Failed to update patient record.', message: error.message });
  }
});

// -------------------------------------------------------------
// 5. POST /api/v1/patients/:id/consent/withdraw - Withdraw Consent
// -------------------------------------------------------------
router.post('/:id/consent/withdraw', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id, isDeleted: false },
      include: {
        consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found.', code: 'NOT_FOUND' });
      return;
    }

    const latestConsent = patient.consentRecords[0];
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;

    if (latestConsent && !latestConsent.withdrawn) {
      await prisma.consentRecord.update({
        where: { id: latestConsent.id },
        data: {
          withdrawn: true,
          withdrawnDate: new Date(),
        },
      });
    } else {
      // Create a withdrawn consent record
      await prisma.consentRecord.create({
        data: {
          patientId: id,
          consentGiven: false,
          withdrawn: true,
          withdrawnDate: new Date(),
          ipAddress: clientIp,
          notes: 'Consent explicitly withdrawn by patient request',
        },
      });
    }

    await createAuditLog({
      adminId: req.admin?.id,
      action: 'UPDATE',
      entity: 'Patient',
      entityId: id,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || null,
      details: { consentAction: 'WITHDRAWAL_RECORDED' },
    });

    res.status(200).json({
      success: true,
      message: 'Patient consent withdrawn successfully. New clinical records are blocked until renewed.',
    });
  } catch (error: any) {
    console.error('Withdraw consent failed:', error);
    res.status(500).json({ error: 'Failed to record consent withdrawal.', message: error.message });
  }
});

// -------------------------------------------------------------
// 6. POST /api/v1/patients/:id/consent - Record New Consent
// -------------------------------------------------------------
router.post('/:id/consent', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const parseResult = newConsentSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid consent details',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const patient = await prisma.patient.findFirst({
      where: { id, isDeleted: false },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found.', code: 'NOT_FOUND' });
      return;
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;

    const newRecord = await prisma.consentRecord.create({
      data: {
        patientId: id,
        consentVersion: parseResult.data.consentVersion,
        consentGiven: true,
        consentDate: new Date(),
        withdrawn: false,
        ipAddress: clientIp,
        notes: parseResult.data.notes || 'Consent renewed / re-confirmed by patient',
      },
    });

    await createAuditLog({
      adminId: req.admin?.id,
      action: 'UPDATE',
      entity: 'Patient',
      entityId: id,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || null,
      details: { consentAction: 'CONSENT_RENEWED', version: parseResult.data.consentVersion },
    });

    res.status(200).json({
      success: true,
      message: 'Consent successfully re-established.',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Record consent failed:', error);
    res.status(500).json({ error: 'Failed to record consent.', message: error.message });
  }
});

// -------------------------------------------------------------
// 7. DELETE /api/v1/patients/:id - Soft Delete
// -------------------------------------------------------------
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id, isDeleted: false },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found.', code: 'NOT_FOUND' });
      return;
    }

    await prisma.patient.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await createAuditLog({
      adminId: req.admin?.id,
      action: 'DELETE',
      entity: 'Patient',
      entityId: id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { type: 'soft_delete' },
    });

    res.status(200).json({
      success: true,
      message: 'Patient archived successfully.',
    });
  } catch (error: any) {
    console.error('Soft delete patient failed:', error);
    res.status(500).json({ error: 'Failed to archive patient.', message: error.message });
  }
});

// -------------------------------------------------------------
// 8. POST /api/v1/patients/:id/erase - Permanent Erasure (DPDP Act 2023)
// -------------------------------------------------------------
router.post('/:id/erase', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const parseResult = erasePatientSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid erasure confirmation payload.',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { adminPassword } = parseResult.data;

    // Verify Admin Password
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin?.id },
    });

    if (!admin) {
      res.status(401).json({ error: 'Unauthorized admin account.' });
      return;
    }

    const passwordValid = await argon2.verify(admin.passwordHash, adminPassword);
    if (!passwordValid) {
      res.status(401).json({ error: 'Incorrect admin password. Permanent erasure aborted.', code: 'INVALID_CREDENTIALS' });
      return;
    }

    // Check if patient exists (even if previously soft deleted)
    const existing = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Patient not found.', code: 'NOT_FOUND' });
      return;
    }

    // Query and delete any stored physical files on disk
    const attachments = await prisma.attachment.findMany({ where: { patientId: id } });
    for (const att of attachments) {
      if (att.fileKey && fs.existsSync(att.fileKey)) {
        try {
          fs.unlinkSync(att.fileKey);
        } catch (e) {
          console.error('Failed to unlink stored file:', att.fileKey, e);
        }
      }
    }

    // Execute permanent deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete all cascading child tables explicitly or rely on FK cascade
      await tx.reminderLog.deleteMany({ where: { patientId: id } });
      await tx.payment.deleteMany({ where: { patientId: id } });
      await tx.invoiceItem.deleteMany({
        where: { invoice: { patientId: id } },
      });
      await tx.invoice.deleteMany({ where: { patientId: id } });
      await tx.hearingAidSale.deleteMany({ where: { patientId: id } });
      await tx.hearingAidTrial.deleteMany({ where: { patientId: id } });
      await tx.hearingAidEnquiry.deleteMany({ where: { patientId: id } });
      await tx.therapySession.deleteMany({ where: { patientId: id } });
      await tx.therapyPlan.deleteMany({ where: { patientId: id } });
      await tx.audiogram.deleteMany({ where: { patientId: id } });
      await tx.attachment.deleteMany({ where: { patientId: id } });
      await tx.visit.deleteMany({ where: { patientId: id } });
      await tx.appointment.deleteMany({ where: { patientId: id } });
      await tx.consentRecord.deleteMany({ where: { patientId: id } });

      // 2. Permanently delete the patient row
      await tx.patient.delete({ where: { id } });
    });

    // DPDP Act 2023: Permanent erasure audit record
    await createAuditLog({
      adminId: req.admin?.id,
      action: 'DELETE',
      entity: 'Patient',
      entityId: id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { type: 'permanent_erasure_dpdp' },
    });

    res.status(200).json({
      success: true,
      message: 'Patient and all associated records permanently erased from database.',
    });
  } catch (error: any) {
    console.error('Permanent erase failed:', error);
    res.status(500).json({ error: 'Failed to erase patient records.', message: error.message });
  }
});

// -------------------------------------------------------------
// 9. GET /api/v1/patients/:id/data-export - DPDP Data Portability Export
// -------------------------------------------------------------
router.get('/:id/data-export', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id, isDeleted: false },
      include: {
        consentRecords: { orderBy: { createdAt: 'desc' } },
        visits: { orderBy: { visitDate: 'desc' } },
        audiograms: { orderBy: { testDate: 'desc' } },
        therapyPlans: {
          include: { sessions: { orderBy: { sessionNumber: 'asc' } } },
        },
        hearingAidEnquiries: { orderBy: { enquiryDate: 'desc' } },
        hearingAidTrials: { orderBy: { trialStartDate: 'desc' } },
        hearingAidSales: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { createdAt: 'desc' } },
        invoices: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found.', code: 'NOT_FOUND' });
      return;
    }

    // Decrypt all sensitive clinical fields for the export
    const decryptedCaseHistory = decryptField(patient.caseHistory);

    const decryptedVisits = patient.visits.map((v) => ({
      ...v,
      notes: decryptField(v.notes),
    }));

    const decryptedTherapyPlans = patient.therapyPlans.map((plan) => ({
      ...plan,
      sessions: plan.sessions.map((s) => ({
        ...s,
        subjective: decryptField(s.subjective),
        objective: decryptField(s.objective),
      })),
    }));

    // DPDP Act 2023: Audit log of data export
    await createAuditLog({
      adminId: req.admin?.id,
      action: 'EXPORT',
      entity: 'Patient',
      entityId: id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { type: 'dpdp_data_portability_export' },
    });

    const exportData = {
      exportMetadata: {
        system: 'SHREE Multidisciplinary Healthcare PMS',
        compliance: 'Digital Personal Data Protection (DPDP) Act 2023, Section 11 Data Portability',
        exportedAt: new Date().toISOString(),
        uhid: patient.uhid,
      },
      patientProfile: {
        uhid: patient.uhid,
        fullName: patient.fullName,
        phone: patient.phone,
        alternatePhone: patient.alternatePhone,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
        referralSource: patient.referralSource,
        chiefComplaint: patient.chiefComplaint,
        caseHistory: decryptedCaseHistory,
        registeredAt: patient.createdAt,
      },
      consentHistory: patient.consentRecords,
      clinicalVisits: decryptedVisits,
      audiologyAssessments: patient.audiograms,
      therapyPlans: decryptedTherapyPlans,
      hearingAidTrials: patient.hearingAidTrials,
      hearingAidSales: patient.hearingAidSales,
      appointments: patient.appointments,
      invoicesAndBilling: patient.invoices,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="patient-export-${patient.uhid}.json"`);
    res.status(200).json(exportData);
  } catch (error: any) {
    console.error('Data export failed:', error);
    res.status(500).json({ error: 'Failed to export patient data.', message: error.message });
  }
});

// -------------------------------------------------------------
// 10. POST /api/v1/patients/:id/visits - Add Clinical Visit
// -------------------------------------------------------------
const createVisitSchema = z.object({
  visitType: z.nativeEnum(DepartmentType),
  visitDate: z.string().optional(),
  diagnosis: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  plan: z.string().trim().optional().nullable(),
  nextAppointmentDate: z.string().optional().nullable(),
});

router.post('/:id/visits', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await requireActiveConsent(id);

    const parse = createVisitSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid visit data' });
      return;
    }

    const { visitType, visitDate, diagnosis, notes, plan, nextAppointmentDate } = parse.data;

    const encryptedNotes = notes ? encryptField(notes) : null;
    const vDate = visitDate ? new Date(visitDate) : new Date();
    const nextDate = nextAppointmentDate ? new Date(nextAppointmentDate) : null;

    const visit = await prisma.visit.create({
      data: {
        patientId: id,
        visitType,
        visitDate: vDate,
        diagnosis: diagnosis || null,
        notes: encryptedNotes,
        plan: plan || null,
        nextAppointmentDate: nextDate,
      },
    });

    await createAuditLog({
      adminId: req.admin?.id,
      action: 'CREATE',
      entity: 'Visit',
      entityId: visit.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { visitType },
    });

    res.status(201).json({
      success: true,
      visit: {
        ...visit,
        notes: notes || null,
      },
    });
  } catch (error: any) {
    if (error instanceof ConsentError) {
      res.status(403).json({ error: error.message, code: error.code });
      return;
    }
    console.error('Create visit failed:', error);
    res.status(500).json({ error: 'Failed to record clinical visit' });
  }
});

// -------------------------------------------------------------
// 11. DELETE /api/v1/patients/:id/visits/:visitId - Delete Visit
// -------------------------------------------------------------
router.delete('/:id/visits/:visitId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { visitId } = req.params;
    await prisma.visit.delete({ where: { id: visitId } });
    res.status(200).json({ success: true, message: 'Visit deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete visit' });
  }
});

// -------------------------------------------------------------
// 12. POST /api/v1/patients/:id/audiograms - Add Audiogram Assessment
// -------------------------------------------------------------
const createAudiogramSchema = z.object({
  testDate: z.string().optional(),
  testType: z.string().default('Pure Tone Audiometry (PTA)'),
  frequencies: z.record(z.any()),
  tympanometryLeft: z.string().optional().nullable(),
  tympanometryRight: z.string().optional().nullable(),
  interpretation: z.string().optional().nullable(),
});

router.post('/:id/audiograms', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await requireActiveConsent(id);

    const parse = createAudiogramSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid audiogram data' });
      return;
    }

    const { testDate, testType, frequencies, tympanometryLeft, tympanometryRight, interpretation } = parse.data;

    const audiogram = await prisma.audiogram.create({
      data: {
        patientId: id,
        testDate: testDate ? new Date(testDate) : new Date(),
        testType,
        frequencies,
        tympanometryLeft: tympanometryLeft || null,
        tympanometryRight: tympanometryRight || null,
        interpretation: interpretation || null,
      },
    });

    await createAuditLog({
      adminId: req.admin?.id,
      action: 'CREATE',
      entity: 'Audiogram',
      entityId: audiogram.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { testType },
    });

    res.status(201).json({ success: true, audiogram });
  } catch (error: any) {
    if (error instanceof ConsentError) {
      res.status(403).json({ error: error.message, code: error.code });
      return;
    }
    console.error('Create audiogram failed:', error);
    res.status(500).json({ error: 'Failed to record audiogram assessment' });
  }
});

// -------------------------------------------------------------
// 13. DELETE /api/v1/patients/:id/audiograms/:audiogramId - Delete Audiogram
// -------------------------------------------------------------
router.delete('/:id/audiograms/:audiogramId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { audiogramId } = req.params;
    await prisma.audiogram.delete({ where: { id: audiogramId } });
    res.status(200).json({ success: true, message: 'Audiogram deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete audiogram' });
  }
});

// -------------------------------------------------------------
// 14. POST /api/v1/patients/:id/therapy-plans - Create Therapy Plan
// -------------------------------------------------------------
const createTherapyPlanSchema = z.object({
  department: z.nativeEnum(DepartmentType),
  title: z.string().trim().min(2, 'Title required'),
  goals: z.string().trim().min(2, 'Goals required'),
  homeProgram: z.string().trim().optional().nullable(),
  targetDate: z.string().optional().nullable(),
});

router.post('/:id/therapy-plans', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await requireActiveConsent(id);

    const parse = createTherapyPlanSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid plan data' });
      return;
    }

    const { department, title, goals, homeProgram, targetDate } = parse.data;

    const plan = await prisma.therapyPlan.create({
      data: {
        patientId: id,
        department,
        title,
        goals,
        homeProgram: homeProgram || null,
        startDate: new Date(),
        targetDate: targetDate ? new Date(targetDate) : null,
        isActive: true,
      },
      include: { sessions: true },
    });

    res.status(201).json({ success: true, plan });
  } catch (error: any) {
    if (error instanceof ConsentError) {
      res.status(403).json({ error: error.message, code: error.code });
      return;
    }
    console.error('Create therapy plan failed:', error);
    res.status(500).json({ error: 'Failed to create therapy plan' });
  }
});

// -------------------------------------------------------------
// 15. POST /api/v1/patients/:id/therapy-plans/:planId/sessions - Add SOAP Session
// -------------------------------------------------------------
const createSessionSchema = z.object({
  department: z.nativeEnum(DepartmentType),
  subjective: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  assessment: z.string().optional().nullable(),
  planNext: z.string().optional().nullable(),
  vitalstimUsed: z.boolean().default(false),
  homeProgramAssigned: z.string().optional().nullable(),
  sessionDate: z.string().optional(),
});

router.post('/:id/therapy-plans/:planId/sessions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, planId } = req.params;
    await requireActiveConsent(id);

    const parse = createSessionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid session data' });
      return;
    }

    const data = parse.data;

    // Count existing sessions in this plan
    const count = await prisma.therapySession.count({ where: { planId } });
    const sessionNumber = count + 1;

    const session = await prisma.therapySession.create({
      data: {
        planId,
        patientId: id,
        department: data.department,
        sessionNumber,
        sessionDate: data.sessionDate ? new Date(data.sessionDate) : new Date(),
        subjective: data.subjective ? encryptField(data.subjective) : null,
        objective: data.objective ? encryptField(data.objective) : null,
        assessment: data.assessment || null,
        planNext: data.planNext || null,
        vitalstimUsed: data.vitalstimUsed,
        homeProgramAssigned: data.homeProgramAssigned || null,
      },
    });

    res.status(201).json({
      success: true,
      session: {
        ...session,
        subjective: data.subjective || null,
        objective: data.objective || null,
      },
    });
  } catch (error: any) {
    if (error instanceof ConsentError) {
      res.status(403).json({ error: error.message, code: error.code });
      return;
    }
    console.error('Record therapy session failed:', error);
    res.status(500).json({ error: 'Failed to record session note' });
  }
});

export default router;
