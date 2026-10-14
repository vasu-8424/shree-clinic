import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { normalizePhoneNumber } from '../utils/phone.js';
import { createAuditLog } from '../utils/audit.js';
import { HearingAidEnquiryStatus, TrialOutcome, EarSide, InventoryStatus } from '@prisma/client';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/hearing-aids/enquiries - List Enquiries
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
        patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
      },
    });

    res.status(200).json({ success: true, enquiries });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hearing aid enquiries' });
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

export default router;
