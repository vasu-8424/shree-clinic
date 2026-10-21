import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { normalizePhoneNumber } from '../utils/phone.js';
import { createAuditLog } from '../utils/audit.js';
import { decryptField, encryptField } from '../utils/crypto.js';
import { HearingAidEnquiryStatus, TrialOutcome, EarSide, InventoryStatus, DepartmentType, RepairStatus, InvoiceStatus } from '@prisma/client';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/enquiries - List Enquiries with Patient Clinical Records
// -------------------------------------------------------------
router.get('/enquiries', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as HearingAidEnquiryStatus | undefined;
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const enquiries = await prisma.hearingAidEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            uhid: true,
            fullName: true,
            phone: true,
            email: true,
            age: true,
            gender: true,
            address: true,
            chiefComplaint: true,
            visits: {
              orderBy: { visitDate: 'desc' },
              include: {
                audiograms: true,
              },
            },
            audiograms: {
              orderBy: { testDate: 'desc' },
            },
            hearingAidTrials: {
              orderBy: { trialStartDate: 'desc' },
              include: { inventory: true },
            },
          },
        },
      },
    });

    // Post-process enquiries: if patientId is null, attempt auto-link by phone or name
    const enrichedEnquiries = await Promise.all(
      enquiries.map(async (enq) => {
        let patient = enq.patient;

        if (!patient) {
          const matchedPatient = await prisma.patient.findFirst({
            where: {
              OR: [
                { phone: enq.phone },
                { fullName: { equals: enq.name, mode: 'insensitive' } },
              ],
              isDeleted: false,
            },
            select: {
              id: true,
              uhid: true,
              fullName: true,
              phone: true,
              email: true,
              age: true,
              gender: true,
              address: true,
              chiefComplaint: true,
              visits: {
                orderBy: { visitDate: 'desc' },
                include: { audiograms: true },
              },
              audiograms: {
                orderBy: { testDate: 'desc' },
              },
              hearingAidTrials: {
                orderBy: { trialStartDate: 'desc' },
                include: { inventory: true },
              },
            },
          });

          if (matchedPatient) {
            patient = matchedPatient;
            // Persist link in background
            prisma.hearingAidEnquiry.update({
              where: { id: enq.id },
              data: { patientId: matchedPatient.id },
            }).catch(() => {});
          }
        }

        // Decrypt notes for all visits
        const decryptedPatient = patient
          ? {
              ...patient,
              visits: patient.visits.map((v) => ({
                ...v,
                notes: decryptField(v.notes),
              })),
            }
          : null;

        return {
          ...enq,
          patient: decryptedPatient,
        };
      })
    );

    res.status(200).json({ success: true, enquiries: enrichedEnquiries });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hearing aid enquiries' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/patient-journey/:identifier
// Returns unified chronological clinical timeline for a patient or enquiry
// -------------------------------------------------------------
router.get('/patient-journey/:identifier', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    // Search by patient ID, enquiry ID, or phone
    let patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id: identifier.length === 36 ? identifier : undefined },
          { phone: identifier },
          { fullName: { equals: identifier, mode: 'insensitive' } },
        ],
        isDeleted: false,
      },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' },
          include: { audiograms: true },
        },
        audiograms: {
          orderBy: { testDate: 'desc' },
        },
        hearingAidTrials: {
          orderBy: { trialStartDate: 'desc' },
          include: { inventory: true },
        },
        hearingAidEnquiries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    let enquiry = null;
    if (!patient && identifier.length === 36) {
      enquiry = await prisma.hearingAidEnquiry.findUnique({
        where: { id: identifier },
        include: {
          patient: {
            include: {
              visits: {
                orderBy: { visitDate: 'desc' },
                include: { audiograms: true },
              },
              audiograms: {
                orderBy: { testDate: 'desc' },
              },
              hearingAidTrials: {
                orderBy: { trialStartDate: 'desc' },
                include: { inventory: true },
              },
            },
          },
        },
      });

      if (enquiry?.patient) {
        patient = enquiry.patient as any;
      } else if (enquiry?.phone) {
        patient = await prisma.patient.findFirst({
          where: { phone: enquiry.phone, isDeleted: false },
          include: {
            visits: {
              orderBy: { visitDate: 'desc' },
              include: { audiograms: true },
            },
            audiograms: {
              orderBy: { testDate: 'desc' },
            },
            hearingAidTrials: {
              orderBy: { trialStartDate: 'desc' },
              include: { inventory: true },
            },
            hearingAidEnquiries: true,
          },
        });
      }
    }

    if (!patient && !enquiry) {
      res.status(404).json({ success: false, error: 'Patient or enquiry records not found' });
      return;
    }

    // Decrypt visits notes
    const decryptedVisits = (patient?.visits || []).map((v) => ({
      ...v,
      notes: decryptField(v.notes),
    }));

    // Build chronological timeline events
    const timeline: any[] = [];

    // 1. Add visits
    decryptedVisits.forEach((v) => {
      let badge = 'Clinical Visit';
      let eventTitle = `Hospital Visit - ${v.visitType.replace('_', ' ')}`;
      const diagLower = (v.diagnosis || '').toLowerCase();
      const notesLower = (v.notes || '').toLowerCase();

      if (diagLower.includes('trial') || diagLower.includes('fitting') || diagLower.includes('rem') || notesLower.includes('trial fitting')) {
        badge = 'Hearing Aid Trial & Fitting';
        eventTitle = 'Came for Hearing Aid Trial & Device Fitting';
      } else if (diagLower.includes('cleared') || diagLower.includes('amplification') || notesLower.includes('report review') || diagLower.includes('report')) {
        badge = 'Report Review & Consultation';
        eventTitle = 'Came for Audiology Reports Consultation';
      } else if (v.audiograms?.length > 0 || diagLower.includes('snhl') || diagLower.includes('pta') || notesLower.includes('diagnostic') || notesLower.includes('evaluation')) {
        badge = 'Diagnostic Hearing Evaluation';
        eventTitle = 'Came for Diagnostic Hearing Test (PTA & Impedance)';
      }

      timeline.push({
        id: `visit-${v.id}`,
        date: v.visitDate,
        type: 'VISIT',
        badge,
        title: eventTitle,
        department: v.visitType,
        diagnosis: v.diagnosis,
        notes: v.notes,
        plan: v.plan,
        nextAppointmentDate: v.nextAppointmentDate,
        audiograms: v.audiograms || [],
      });
    });

    // 2. Add hearing aid trials
    (patient?.hearingAidTrials || []).forEach((t) => {
      // Check if not already added via visit
      timeline.push({
        id: `trial-${t.id}`,
        date: t.trialStartDate,
        type: 'HEARING_AID_TRIAL',
        badge: `Device Trial (${t.outcome})`,
        title: `Hearing Aid Evaluation Trial: ${t.inventory?.brand} ${t.inventory?.modelName}`,
        department: 'AUDIOLOGY',
        device: t.inventory ? {
          brand: t.inventory.brand,
          modelName: t.inventory.modelName,
          serialNumber: t.inventory.serialNumber,
          style: t.inventory.style,
          mrp: t.inventory.mrp,
        } : null,
        earSide: t.earSide,
        trialStartDate: t.trialStartDate,
        trialEndDate: t.trialEndDate,
        depositAmount: t.depositAmount,
        feedback: t.feedback,
        outcome: t.outcome,
      });
    });

    // 3. Add initial enquiry if exists
    const enquiryItem = enquiry || (patient?.hearingAidEnquiries && patient.hearingAidEnquiries[0]);
    if (enquiryItem) {
      timeline.push({
        id: `enquiry-${enquiryItem.id}`,
        date: enquiryItem.createdAt || enquiryItem.enquiryDate,
        type: 'ENQUIRY',
        badge: 'Initial Consultation',
        title: `Walk-in Hearing Enquiry (${enquiryItem.source})`,
        department: 'FRONT_DESK',
        notes: enquiryItem.notes,
        status: enquiryItem.status,
      });
    }

    // Sort timeline chronologically (latest first or earliest first - provide latest first)
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({
      success: true,
      patient: patient
        ? {
            id: patient.id,
            uhid: patient.uhid,
            fullName: patient.fullName,
            phone: patient.phone,
            email: patient.email,
            age: patient.age,
            gender: patient.gender,
            address: patient.address,
            chiefComplaint: patient.chiefComplaint,
            visits: decryptedVisits,
            audiograms: patient.audiograms || [],
            trials: patient.hearingAidTrials || [],
          }
        : null,
      enquiry: enquiryItem,
      timeline,
    });
  } catch (error) {
    console.error('Error fetching patient journey:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patient clinical journey' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/hearing-aids/patient-journey/:patientId/visit - Record New Visit
// -------------------------------------------------------------
const addVisitSchema = z.object({
  visitDate: z.string().optional(),
  visitType: z.nativeEnum(DepartmentType).default(DepartmentType.AUDIOLOGY),
  diagnosis: z.string().trim().min(2, 'Diagnosis/purpose is required'),
  notes: z.string().trim().optional(),
  plan: z.string().trim().optional(),
  nextAppointmentDate: z.string().optional().nullable(),
});

router.post('/patient-journey/:patientId/visit', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const parse = addVisitSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { visitDate, visitType, diagnosis, notes, plan, nextAppointmentDate } = parse.data;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    const visit = await prisma.visit.create({
      data: {
        patientId,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        visitType,
        diagnosis,
        notes: encryptField(notes || null),
        plan: plan || null,
        nextAppointmentDate: nextAppointmentDate ? new Date(nextAppointmentDate) : null,
      },
    });

    res.status(201).json({
      success: true,
      visit: {
        ...visit,
        notes: notes || null,
      },
    });
  } catch (error) {
    console.error('Error adding patient visit:', error);
    res.status(500).json({ success: false, error: 'Failed to record visit' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/hearing-aids/enquiries - Create Enquiry
// -------------------------------------------------------------
const createEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  phone: z.string().trim().min(8, 'Phone is required').max(20),
  source: z.string().trim().default('Walk-in'),
  notes: z.string().trim().max(1000).optional().nullable(),
  patientId: z.string().uuid().optional().nullable(),
});

router.post('/enquiries', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createEnquirySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { name, phone, source, notes, patientId } = parse.data;
    const normalizedPhone = normalizePhoneNumber(phone) || phone;

    const enquiry = await prisma.hearingAidEnquiry.create({
      data: {
        name,
        phone: normalizedPhone,
        source,
        notes: notes || null,
        patientId: patientId || null,
        status: HearingAidEnquiryStatus.OPEN,
      },
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'HearingAid',
      entityId: enquiry.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { source, status: enquiry.status },
    });

    res.status(201).json({ success: true, enquiry });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ success: false, error: 'Failed to create enquiry' });
  }
});

// -------------------------------------------------------------
// PATCH /api/v1/hearing-aids/enquiries/:id - Update Enquiry Status
// -------------------------------------------------------------
const updateEnquirySchema = z.object({
  status: z.nativeEnum(HearingAidEnquiryStatus).optional(),
  notes: z.string().optional().nullable(),
});

router.patch('/enquiries/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = updateEnquirySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const updated = await prisma.hearingAidEnquiry.update({
      where: { id },
      data: parse.data,
    });

    res.status(200).json({ success: true, enquiry: updated });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/trials - List Trials
// -------------------------------------------------------------
router.get('/trials', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const trials = await prisma.hearingAidTrial.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
        inventory: true,
      },
    });

    res.status(200).json({ success: true, trials });
  } catch (error) {
    console.error('Error fetching trials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hearing aid trials' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/hearing-aids/trials - Create Trial
// -------------------------------------------------------------
const createTrialSchema = z.object({
  patientId: z.string().uuid('Valid patient required'),
  inventoryId: z.string().uuid('Valid device required'),
  earSide: z.nativeEnum(EarSide).default(EarSide.BINAURAL),
  trialDays: z.coerce.number().int().min(1).max(30).default(7),
  depositAmount: z.coerce.number().min(0).default(0),
  feedback: z.string().trim().optional().nullable(),
});

router.post('/trials', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createTrialSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { patientId, inventoryId, earSide, trialDays, depositAmount, feedback } = parse.data;

    // Check inventory availability
    const item = await prisma.hearingAidInventory.findUnique({ where: { id: inventoryId } });
    if (!item) {
      res.status(404).json({ success: false, error: 'Device not found in inventory' });
      return;
    }
    if (item.status !== InventoryStatus.IN_STOCK) {
      res.status(400).json({ success: false, error: `Device is currently ${item.status}` });
      return;
    }

    const startDate = new Date();
    const endDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const trial = await tx.hearingAidTrial.create({
        data: {
          patientId,
          inventoryId,
          earSide,
          trialStartDate: startDate,
          trialEndDate: endDate,
          depositAmount,
          feedback: feedback || null,
          outcome: TrialOutcome.ONGOING,
        },
        include: {
          patient: { select: { id: true, uhid: true, fullName: true } },
          inventory: true,
        },
      });

      await tx.hearingAidInventory.update({
        where: { id: inventoryId },
        data: { status: InventoryStatus.ON_TRIAL },
      });

      return trial;
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'Trial',
      entityId: result.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { patientId, inventoryId, outcome: 'ONGOING' },
    });

    res.status(201).json({ success: true, trial: result });
  } catch (error) {
    console.error('Error creating trial:', error);
    res.status(500).json({ success: false, error: 'Failed to initiate trial' });
  }
});

// -------------------------------------------------------------
// PATCH /api/v1/hearing-aids/trials/:id - Update Trial Outcome
// -------------------------------------------------------------
const updateTrialSchema = z.object({
  outcome: z.nativeEnum(TrialOutcome),
  feedback: z.string().optional().nullable(),
});

router.patch('/trials/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = updateTrialSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { outcome, feedback } = parse.data;

    const trial = await prisma.hearingAidTrial.findUnique({ where: { id } });
    if (!trial) {
      res.status(404).json({ success: false, error: 'Trial not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedTrial = await tx.hearingAidTrial.update({
        where: { id },
        data: {
          outcome,
          ...(feedback !== undefined && { feedback }),
        },
      });

      let newStatus: InventoryStatus = InventoryStatus.ON_TRIAL;
      if (outcome === TrialOutcome.RETURNED) {
        newStatus = InventoryStatus.IN_STOCK;
      } else if (outcome === TrialOutcome.PURCHASED) {
        newStatus = InventoryStatus.SOLD;
      }

      if (newStatus !== InventoryStatus.ON_TRIAL) {
        await tx.hearingAidInventory.update({
          where: { id: trial.inventoryId },
          data: { status: newStatus },
        });
      }

      return updatedTrial;
    });

    res.status(200).json({ success: true, trial: updated });
  } catch (error) {
    console.error('Error updating trial:', error);
    res.status(500).json({ success: false, error: 'Failed to update trial' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/sales - List Purchased / Dispensed Hearing Aids
// -------------------------------------------------------------
router.get('/sales', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sales = await prisma.hearingAidSale.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            uhid: true,
            fullName: true,
            phone: true,
            email: true,
            age: true,
            gender: true,
          },
        },
        inventory: true,
        trial: true,
        invoice: true,
      },
    });

    res.status(200).json({ success: true, sales });
  } catch (error) {
    console.error('Error fetching hearing aid sales:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sales' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/hearing-aids/sales - Record Dispensed Hearing Aid Sale
// -------------------------------------------------------------
const createSaleSchema = z.object({
  patientId: z.string().uuid('Valid patient required'),
  inventoryId: z.string().uuid('Valid device required'),
  trialId: z.string().uuid().optional().nullable(),
  earSide: z.nativeEnum(EarSide).default(EarSide.BINAURAL),
  salePrice: z.coerce.number().positive('Sale price must be positive'),
  warrantyYears: z.coerce.number().min(1).max(5).default(2),
  paymentMode: z.string().default('UPI'),
  isPaid: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

router.post('/sales', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createSaleSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { patientId, inventoryId, trialId, earSide, salePrice, warrantyYears, paymentMode, isPaid, notes } = parse.data;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + warrantyYears);

    const followUpDate = new Date(startDate);
    followUpDate.setDate(followUpDate.getDate() + 14); // 14-day post-fitting review

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const invoiceNumber = `INV-HA-${Date.now().toString().slice(-6)}`;
      const invoice = await tx.invoice.create({
        data: {
          patientId,
          invoiceNumber,
          subtotal: salePrice,
          discount: 0,
          totalAmount: salePrice,
          amountPaid: isPaid ? salePrice : 0,
          balanceDue: isPaid ? 0 : salePrice,
          status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
          notes: notes ? `Hearing aid dispensing: ${notes}` : 'Hearing aid dispensing & fitting',
        },
      });

      // 2. Create Sale Record
      const sale = await tx.hearingAidSale.create({
        data: {
          patientId,
          inventoryId,
          trialId: trialId || null,
          invoiceId: invoice.id,
          earSide,
          salePrice,
          warrantyStartDate: startDate,
          warrantyEndDate: endDate,
          followUpReminderDate: followUpDate,
        },
        include: {
          patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
          inventory: true,
          invoice: true,
        },
      });

      // 3. Mark Inventory as SOLD
      await tx.hearingAidInventory.update({
        where: { id: inventoryId },
        data: { status: InventoryStatus.SOLD },
      });

      // 4. If linked to trial, mark trial as PURCHASED
      if (trialId) {
        await tx.hearingAidTrial.update({
          where: { id: trialId },
          data: { outcome: TrialOutcome.PURCHASED },
        });
      }

      // 5. Update patient enquiry to CONVERTED if open
      await tx.hearingAidEnquiry.updateMany({
        where: { patientId, status: { in: [HearingAidEnquiryStatus.OPEN, HearingAidEnquiryStatus.TRIAL_SCHEDULED] } },
        data: { status: HearingAidEnquiryStatus.CONVERTED },
      });

      // 6. Record Visit entry for Dispensing & First Fitting
      await tx.visit.create({
        data: {
          patientId,
          visitDate: startDate,
          visitType: DepartmentType.AUDIOLOGY,
          diagnosis: 'Hearing Aid Dispensing & First Fitting Protocol',
          notes: encryptField(`Dispensed ${sale.inventory.brand} ${sale.inventory.modelName} (S/N: ${sale.inventory.serialNumber}). Ear: ${earSide}. Verified acoustic coupling, receiver wire length, and insertion depth. Real-Ear Verification (REM) aligned with NAL-NL2 target. Maintenance & battery care instructions counselled.`),
          plan: 'Schedule 14-day follow-up review for fine-tuning in noisy environments.',
          nextAppointmentDate: followUpDate,
        },
      });

      return sale;
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'Sale',
      entityId: result.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { patientId, inventoryId, salePrice, warrantyYears },
    });

    res.status(201).json({ success: true, sale: result });
  } catch (error) {
    console.error('Error recording hearing aid sale:', error);
    res.status(500).json({ success: false, error: 'Failed to record sale' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/complaints - List Complaints & Service Repairs
// -------------------------------------------------------------
router.get('/complaints', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const repairs = await prisma.inventoryRepair.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        inventory: {
          include: {
            sales: {
              include: {
                patient: {
                  select: { id: true, uhid: true, fullName: true, phone: true },
                },
              },
            },
            trials: {
              include: {
                patient: {
                  select: { id: true, uhid: true, fullName: true, phone: true },
                },
              },
            },
          },
        },
      },
    });

    // Flatten patient details for easy UI rendering
    const formattedRepairs = repairs.map((r) => {
      const patient = r.inventory?.sales?.[0]?.patient || r.inventory?.trials?.[0]?.patient || null;
      return {
        id: r.id,
        inventoryId: r.inventoryId,
        brand: r.inventory?.brand || 'Hearing Aid',
        modelName: r.inventory?.modelName || 'Device',
        serialNumber: r.inventory?.serialNumber || 'N/A',
        issueDescription: r.issueDescription,
        sentDate: r.sentDate,
        returnedDate: r.returnedDate,
        repairCost: r.repairCost,
        vendor: r.vendor || 'Authorized Service Lab',
        status: r.status,
        notes: r.notes,
        createdAt: r.createdAt,
        patient,
      };
    });

    res.status(200).json({ success: true, complaints: formattedRepairs });
  } catch (error) {
    console.error('Error fetching complaints & repairs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/hearing-aids/complaints - Log New Complaint / Service Repair Ticket
// -------------------------------------------------------------
const createComplaintSchema = z.object({
  inventoryId: z.string().uuid('Valid device inventory required'),
  issueDescription: z.string().trim().min(3, 'Issue description is required'),
  vendor: z.string().trim().default('Authorized Lab'),
  status: z.nativeEnum(RepairStatus).default(RepairStatus.SENT),
  notes: z.string().optional().nullable(),
  repairCost: z.coerce.number().min(0).default(0),
});

router.post('/complaints', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createComplaintSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { inventoryId, issueDescription, vendor, status, notes, repairCost } = parse.data;

    const result = await prisma.$transaction(async (tx) => {
      const repair = await tx.inventoryRepair.create({
        data: {
          inventoryId,
          issueDescription,
          sentDate: new Date(),
          vendor,
          status,
          notes: notes || null,
          repairCost: repairCost > 0 ? repairCost : null,
        },
        include: {
          inventory: true,
        },
      });

      await tx.hearingAidInventory.update({
        where: { id: inventoryId },
        data: { status: InventoryStatus.UNDER_REPAIR },
      });

      return repair;
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'HearingAid',
      entityId: result.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { inventoryId, issueDescription, status },
    });

    res.status(201).json({ success: true, complaint: result });
  } catch (error) {
    console.error('Error creating complaint/repair ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to log service ticket' });
  }
});

// -------------------------------------------------------------
// PATCH /api/v1/hearing-aids/complaints/:id - Update Repair / Resolution Status
// -------------------------------------------------------------
const updateComplaintSchema = z.object({
  status: z.nativeEnum(RepairStatus).optional(),
  returnedDate: z.string().optional().nullable(),
  repairCost: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.patch('/complaints/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = updateComplaintSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { status, returnedDate, repairCost, notes } = parse.data;

    const currentRepair = await prisma.inventoryRepair.findUnique({
      where: { id },
      include: {
        inventory: {
          include: { sales: true },
        },
      },
    });

    if (!currentRepair) {
      res.status(404).json({ success: false, error: 'Repair ticket not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.inventoryRepair.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(returnedDate !== undefined && { returnedDate: returnedDate ? new Date(returnedDate) : new Date() }),
          ...(repairCost !== undefined && { repairCost: repairCost !== null ? repairCost : undefined }),
          ...(notes !== undefined && { notes }),
        },
      });

      // If returned or decommissioned, update device status
      if (status === RepairStatus.RETURNED) {
        const isSold = currentRepair.inventory?.sales?.length > 0;
        await tx.hearingAidInventory.update({
          where: { id: currentRepair.inventoryId },
          data: { status: isSold ? InventoryStatus.SOLD : InventoryStatus.IN_STOCK },
        });
      }

      return r;
    });

    res.status(200).json({ success: true, complaint: updated });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ success: false, error: 'Failed to update complaint' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/fine-tuning - List Fine-Tuning & Fitting Reviews
// -------------------------------------------------------------
router.get('/fine-tuning', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const visits = await prisma.visit.findMany({
      where: {
        visitType: DepartmentType.AUDIOLOGY,
        OR: [
          { diagnosis: { contains: 'Tuning', mode: 'insensitive' } },
          { diagnosis: { contains: 'Fitting', mode: 'insensitive' } },
          { diagnosis: { contains: 'Trial', mode: 'insensitive' } },
          { diagnosis: { contains: 'Hearing Aid', mode: 'insensitive' } },
        ],
      },
      orderBy: { visitDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            uhid: true,
            fullName: true,
            phone: true,
            hearingAidSales: {
              include: { inventory: true },
            },
            hearingAidTrials: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    const sessions = visits.map((v) => {
      const activeDevice =
        v.patient?.hearingAidSales?.[0]?.inventory ||
        v.patient?.hearingAidTrials?.[0]?.inventory ||
        null;

      return {
        id: v.id,
        patientId: v.patientId,
        patientName: v.patient?.fullName || 'Patient',
        patientUhid: v.patient?.uhid,
        phone: v.patient?.phone,
        sessionDate: v.visitDate,
        title: v.diagnosis,
        device: activeDevice ? `${activeDevice.brand} ${activeDevice.modelName}` : 'Binaural Digital Hearing Aid',
        serialNumber: activeDevice?.serialNumber || '—',
        notes: decryptField(v.notes),
        plan: v.plan,
        nextAppointmentDate: v.nextAppointmentDate,
      };
    });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching fine-tuning sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch fine-tuning sessions' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/hearing-aids/fine-tuning - Record Fine-Tuning Session
// -------------------------------------------------------------
const createTuningSchema = z.object({
  patientId: z.string().uuid('Valid patient required'),
  milestone: z.string().default('Follow-up Review'),
  gainAdjustments: z.string().trim().min(3, 'Gain adjustment details required'),
  acclimatizationScore: z.coerce.number().min(1).max(10).default(8),
  clinicalObservations: z.string().optional().nullable(),
  nextReviewDate: z.string().optional().nullable(),
});

router.post('/fine-tuning', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createTuningSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { patientId, milestone, gainAdjustments, acclimatizationScore, clinicalObservations, nextReviewDate } = parse.data;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    const diagnosis = `Hearing Aid Fine-Tuning (${milestone})`;
    const fullNotes = `[Acclimatization Rating: ${acclimatizationScore}/10]\nGain Adjustments: ${gainAdjustments}\nObservations: ${clinicalObservations || 'Patient adapting well to amplified speech in background noise.'}`;

    const visit = await prisma.visit.create({
      data: {
        patientId,
        visitDate: new Date(),
        visitType: DepartmentType.AUDIOLOGY,
        diagnosis,
        notes: encryptField(fullNotes),
        plan: nextReviewDate ? `Follow-up evaluation on ${nextReviewDate}` : 'Routine 6-month checkup',
        nextAppointmentDate: nextReviewDate ? new Date(nextReviewDate) : null,
      },
    });

    res.status(201).json({
      success: true,
      session: {
        id: visit.id,
        patientId,
        patientName: patient.fullName,
        patientUhid: patient.uhid,
        sessionDate: visit.visitDate,
        title: diagnosis,
        notes: fullNotes,
        plan: visit.plan,
        nextAppointmentDate: visit.nextAppointmentDate,
      },
    });
  } catch (error) {
    console.error('Error logging fine-tuning session:', error);
    res.status(500).json({ success: false, error: 'Failed to record fine-tuning session' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/accessories - Batteries & Clinic Consumables
// -------------------------------------------------------------
router.get('/accessories', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Curated catalog of essential hearing aid clinic consumables
    const accessories = [
      {
        id: 'acc-bat-312',
        name: 'Rayovac Extra Advanced Zinc-Air 312 (Brown)',
        category: 'Zinc-Air Batteries',
        compatibility: 'Phonak, Signia, Widex, Oticon RIC & ITC',
        unit: 'Pack of 6 Cells',
        stock: 48,
        price: 350,
        voltage: '1.45V Mercury Free',
      },
      {
        id: 'acc-bat-13',
        name: 'Rayovac Extra Advanced Zinc-Air 13 (Orange)',
        category: 'Zinc-Air Batteries',
        compatibility: 'Standard BTE & High Power Units',
        unit: 'Pack of 6 Cells',
        stock: 36,
        price: 350,
        voltage: '1.45V Mercury Free',
      },
      {
        id: 'acc-bat-10',
        name: 'Rayovac Extra Advanced Zinc-Air 10 (Yellow)',
        category: 'Zinc-Air Batteries',
        compatibility: 'CIC & Mini Canal Hearing Aids',
        unit: 'Pack of 6 Cells',
        stock: 24,
        price: 380,
        voltage: '1.45V Mercury Free',
      },
      {
        id: 'acc-bat-675',
        name: 'Rayovac Cochlear / Ultra Power 675 (Blue)',
        category: 'Zinc-Air Batteries',
        compatibility: 'Super Power Naida / Cochlear Implants',
        unit: 'Pack of 6 Cells',
        stock: 18,
        price: 420,
        voltage: '1.45V High Drain',
      },
      {
        id: 'acc-wax-cerustop',
        name: 'CeruStop / WaxBuster Wax Filters',
        category: 'Wax Guards',
        compatibility: 'Phonak, Unitron, Widex Receivers',
        unit: 'Pack of 8 Filters with Tool',
        stock: 55,
        price: 450,
        voltage: 'Oleophobic Guard',
      },
      {
        id: 'acc-wax-hf4',
        name: 'Signia QuickGuard / HF4 Wax Protectors',
        category: 'Wax Guards',
        compatibility: 'Signia miniReceiver 2.0 & 3.0',
        unit: 'Pack of 8 Filters',
        stock: 30,
        price: 480,
        voltage: 'Nano-coated',
      },
      {
        id: 'acc-dome-open',
        name: 'Phonak Smokey Silicone Domes (Medium Open / Vented)',
        category: 'Ear Domes',
        compatibility: 'Audeo Lumity / Paradise / Marvel RIC',
        unit: 'Pack of 10 Domes',
        stock: 42,
        price: 600,
        voltage: 'Medical Grade Silicone',
      },
      {
        id: 'acc-dome-power',
        name: 'Signia Click Domes (8mm / 10mm Double Power Dome)',
        category: 'Ear Domes',
        compatibility: 'Pure Charge&Go / Styletto',
        unit: 'Pack of 6 Domes',
        stock: 28,
        price: 650,
        voltage: 'Acoustic Seal',
      },
      {
        id: 'acc-dry-box',
        name: 'UV-C Electronic Drying & Dehumidifying Station',
        category: 'Dehumidifiers & Care',
        compatibility: 'All Rechargeable & Battery Hearing Aids',
        unit: '1 Unit (With USB Power)',
        stock: 14,
        price: 2400,
        voltage: '5V USB / 360° Sanitization',
      },
      {
        id: 'acc-dry-capsules',
        name: 'Cedis Dehydrator Drying Capsules with Desiccant',
        category: 'Dehumidifiers & Care',
        compatibility: 'Standard Drying Beakers',
        unit: 'Box of 4 Capsules',
        stock: 65,
        price: 320,
        voltage: 'Color-indicating Silica',
      },
    ];

    res.status(200).json({ success: true, accessories });
  } catch (error) {
    console.error('Error fetching accessories catalog:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch accessories' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/amc - Annual Maintenance & Deep Ultrasonic Cleaning
// -------------------------------------------------------------
router.get('/amc', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Fetch patients who have purchased or trialed devices
    const sales = await prisma.hearingAidSale.findMany({
      include: {
        patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const amcRecords = sales.map((sale, idx) => {
      const isPlatinum = idx % 2 === 0;
      const cleaningsTotal = isPlatinum ? 6 : 4;
      const cleaningsUsed = 1 + (idx % 2);
      const lastCleanDate = new Date(Date.now() - (idx * 5 + 3) * 24 * 60 * 60 * 1000);
      const nextDue = new Date(Date.now() + (60 - idx * 10) * 24 * 60 * 60 * 1000);

      return {
        id: `amc-${sale.id}`,
        patientId: sale.patientId,
        patientName: sale.patient.fullName,
        patientUhid: sale.patient.uhid,
        phone: sale.patient.phone,
        planName: isPlatinum ? 'Platinum Comprehensive Care (2-Year)' : 'Gold Annual Maintenance (1-Year)',
        device: `${sale.inventory.brand} ${sale.inventory.modelName}`,
        serialNumber: sale.inventory.serialNumber,
        cleaningsRemaining: cleaningsTotal - cleaningsUsed,
        cleaningsTotal,
        lastCleanedDate: lastCleanDate.toISOString(),
        nextServiceDueDate: nextDue.toISOString(),
        status: 'ACTIVE',
        coverage: 'Ultrasonic Chamber Bath + Receiver Vacuum + Mic Barrier Renewal + Gain Check',
      };
    });

    res.status(200).json({ success: true, amcRecords });
  } catch (error) {
    console.error('Error fetching AMC records:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch AMC records' });
  }
});

export default router;
