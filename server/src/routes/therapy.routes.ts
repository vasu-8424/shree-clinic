import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { createAuditLog } from '../utils/audit.js';
import { decryptField, encryptField } from '../utils/crypto.js';
import { DepartmentType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const router = Router();
router.use(requireAuth);

// Ensure local uploads directory for clinical PDFs exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'clinical_pdfs');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// -------------------------------------------------------------
// GET /api/v1/therapy/sessions - List SOAP Notes & Therapy Encounters
// -------------------------------------------------------------
router.get('/sessions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const department = req.query.department as DepartmentType | undefined;
    const patientId = req.query.patientId as string | undefined;
    const search = (req.query.search as string)?.trim().toLowerCase();

    const where: any = {};
    if (department) where.department = department;
    if (patientId) where.patientId = patientId;

    const sessions = await prisma.therapySession.findMany({
      where,
      orderBy: { sessionDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            uhid: true,
            fullName: true,
            phone: true,
            age: true,
            gender: true,
            chiefComplaint: true,
          },
        },
        plan: true,
      },
    });

    // Decrypt subjective and objective fields
    const formatted = sessions.map((s) => ({
      id: s.id,
      patientId: s.patientId,
      patientName: s.patient?.fullName || 'Patient',
      patientUhid: s.patient?.uhid,
      patientPhone: s.patient?.phone,
      patientAge: s.patient?.age,
      patientGender: s.patient?.gender,
      department: s.department,
      sessionNumber: s.sessionNumber,
      sessionDate: s.sessionDate,
      subjective: decryptField(s.subjective),
      objective: decryptField(s.objective),
      assessment: s.assessment,
      planNext: s.planNext,
      vitalstimUsed: s.vitalstimUsed,
      homeProgramAssigned: s.homeProgramAssigned,
      planId: s.planId,
      planTitle: s.plan?.title || null,
      createdAt: s.createdAt,
    }));

    const filtered = search
      ? formatted.filter(
          (s) =>
            s.patientName.toLowerCase().includes(search) ||
            s.patientUhid?.toLowerCase().includes(search) ||
            s.assessment?.toLowerCase().includes(search) ||
            s.subjective?.toLowerCase().includes(search) ||
            s.objective?.toLowerCase().includes(search)
        )
      : formatted;

    res.status(200).json({ success: true, sessions: filtered });
  } catch (error) {
    console.error('Error fetching therapy sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch therapy sessions' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/therapy/sessions - Record New Patient SOAP Note
// -------------------------------------------------------------
const createSessionSchema = z.object({
  patientId: z.string().uuid('Valid patient required'),
  department: z.nativeEnum(DepartmentType),
  sessionNumber: z.coerce.number().int().min(1).default(1),
  sessionDate: z.string().optional(),
  subjective: z.string().trim().min(2, 'Subjective notes / complaint required'),
  objective: z.string().trim().min(2, 'Objective evaluation / measurements required'),
  assessment: z.string().trim().min(2, 'Clinical assessment / progress required'),
  planNext: z.string().trim().min(2, 'Treatment plan / next steps required'),
  vitalstimUsed: z.boolean().default(false),
  homeProgramAssigned: z.string().optional().nullable(),
  planId: z.string().uuid().optional().nullable(),
});

router.post('/sessions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createSessionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const {
      patientId,
      department,
      sessionNumber,
      sessionDate,
      subjective,
      objective,
      assessment,
      planNext,
      vitalstimUsed,
      homeProgramAssigned,
      planId,
    } = parse.data;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    const sDate = sessionDate ? new Date(sessionDate) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Therapy Session
      const session = await tx.therapySession.create({
        data: {
          patientId,
          department,
          sessionNumber,
          sessionDate: sDate,
          subjective: encryptField(subjective),
          objective: encryptField(objective),
          assessment,
          planNext,
          vitalstimUsed,
          homeProgramAssigned: homeProgramAssigned || null,
          planId: planId || null,
        },
        include: {
          patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
          plan: true,
        },
      });

      // 2. Also log unified hospital Visit entry
      const deptLabel = department === DepartmentType.SPEECH_THERAPY ? 'Speech Therapy' : 'Physiotherapy';
      await tx.visit.create({
        data: {
          patientId,
          visitDate: sDate,
          visitType: department,
          diagnosis: `${deptLabel} Clinical Session #${sessionNumber}`,
          notes: encryptField(`[SOAP Notes]\nS: ${subjective}\nO: ${objective}\nA: ${assessment}\nP: ${planNext}${homeProgramAssigned ? `\nHome Program: ${homeProgramAssigned}` : ''}`),
          plan: planNext,
          nextAppointmentDate: new Date(sDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return session;
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'TherapySession',
      entityId: result.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { patientId, department, sessionNumber },
    });

    res.status(201).json({
      success: true,
      session: {
        ...result,
        subjective,
        objective,
      },
    });
  } catch (error) {
    console.error('Error creating therapy session note:', error);
    res.status(500).json({ success: false, error: 'Failed to record session note' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/therapy/plans - List Therapy Treatment Plans
// -------------------------------------------------------------
router.get('/plans', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const department = req.query.department as DepartmentType | undefined;
    const patientId = req.query.patientId as string | undefined;

    const where: any = {};
    if (department) where.department = department;
    if (patientId) where.patientId = patientId;

    const plans = await prisma.therapyPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
        sessions: { select: { id: true, sessionNumber: true, sessionDate: true } },
      },
    });

    res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error('Error fetching therapy plans:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch therapy plans' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/therapy/plans - Create Therapy Plan
// -------------------------------------------------------------
const createPlanSchema = z.object({
  patientId: z.string().uuid('Valid patient required'),
  department: z.nativeEnum(DepartmentType),
  title: z.string().trim().min(3, 'Plan title required'),
  goals: z.string().trim().min(5, 'Clinical goals required'),
  homeProgram: z.string().optional().nullable(),
  startDate: z.string().optional(),
  targetDate: z.string().optional().nullable(),
});

router.post('/plans', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createPlanSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { patientId, department, title, goals, homeProgram, startDate, targetDate } = parse.data;

    const plan = await prisma.therapyPlan.create({
      data: {
        patientId,
        department,
        title,
        goals,
        homeProgram: homeProgram || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        targetDate: targetDate ? new Date(targetDate) : null,
        isActive: true,
      },
      include: {
        patient: { select: { id: true, uhid: true, fullName: true } },
      },
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'TherapyPlan',
      entityId: plan.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { patientId, department, title },
    });

    res.status(201).json({ success: true, plan });
  } catch (error) {
    console.error('Error creating therapy plan:', error);
    res.status(500).json({ success: false, error: 'Failed to create plan' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/therapy/attachments - Stored Clinical PDFs & Reports
// -------------------------------------------------------------
router.get('/attachments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.query.patientId as string | undefined;
    const category = req.query.category as string | undefined;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (category) where.category = { contains: category, mode: 'insensitive' };

    const attachments = await prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
      },
    });

    res.status(200).json({ success: true, attachments });
  } catch (error) {
    console.error('Error fetching clinical attachments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attachments' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/therapy/attachments - Upload & Store Clinical PDF
// -------------------------------------------------------------
const createAttachmentSchema = z.object({
  patientId: z.string().uuid('Valid patient required'),
  fileName: z.string().trim().min(3, 'File name required'),
  fileData: z.string().optional(), // Base64 data if uploaded directly
  category: z.string().default('Speech & Physio Report'),
  fileSize: z.coerce.number().default(245760),
});

router.post('/attachments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createAttachmentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { patientId, fileName, fileData, category, fileSize } = parse.data;

    // Generate safe local file key
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    if (fileData && fileData.startsWith('data:')) {
      // Decode and save base64 file to disk
      const base64Content = fileData.split(';base64,').pop() || '';
      fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));
    } else {
      // Create a dummy valid PDF content placeholder if sample
      const placeholder = `%PDF-1.4\n%SHREE CLINIC CLINICAL REPORT: ${fileName}\n%%EOF`;
      fs.writeFileSync(filePath, placeholder);
    }

    const fileKey = `/uploads/clinical_pdfs/${safeName}`;

    const attachment = await prisma.attachment.create({
      data: {
        patientId,
        fileName,
        fileKey,
        fileType: 'application/pdf',
        fileSize,
        category,
      },
      include: {
        patient: { select: { id: true, uhid: true, fullName: true } },
      },
    });

    res.status(201).json({ success: true, attachment });
  } catch (error) {
    console.error('Error storing clinical PDF:', error);
    res.status(500).json({ success: false, error: 'Failed to store attachment' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/therapy/progress-reports - Patient Progress & Milestones
// -------------------------------------------------------------
router.get('/progress-reports', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const department = req.query.department as DepartmentType | undefined;
    const patientId = req.query.patientId as string | undefined;

    const wherePatient: any = { isDeleted: false };
    if (patientId) wherePatient.id = patientId;

    const patients = await prisma.patient.findMany({
      where: wherePatient,
      include: {
        therapyPlans: {
          where: department ? { department } : {},
          include: { sessions: { orderBy: { sessionNumber: 'asc' } } },
        },
        therapySessions: {
          where: department ? { department } : {},
          orderBy: { sessionNumber: 'asc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Map into rich, formatted progress reports
    const progressReports = patients
      .filter((p) => p.therapySessions.length > 0 || p.therapyPlans.length > 0)
      .map((p) => {
        const totalSessions = p.therapySessions.length;
        const activePlan = p.therapyPlans[0] || null;
        const targetSessions = activePlan ? 10 : 8;
        const completionRate = Math.min(100, Math.round((totalSessions / targetSessions) * 100));

        // Decrypt latest session notes
        const latestSession = p.therapySessions[p.therapySessions.length - 1];
        const firstSession = p.therapySessions[0];

        return {
          patientId: p.id,
          patientName: p.fullName,
          patientUhid: p.uhid,
          phone: p.phone,
          age: p.age,
          gender: p.gender,
          department: department || activePlan?.department || p.therapySessions[0]?.department || DepartmentType.SPEECH_THERAPY,
          planTitle: activePlan?.title || 'Comprehensive Functional Rehabilitation',
          planGoals: activePlan?.goals || p.chiefComplaint,
          homeProgram: activePlan?.homeProgram || latestSession?.homeProgramAssigned || 'Daily prescribed home regimen',
          totalSessions,
          targetSessions,
          completionRate,
          firstEncounterDate: firstSession?.sessionDate || p.createdAt,
          lastEncounterDate: latestSession?.sessionDate || p.updatedAt,
          latestAssessment: latestSession?.assessment || 'Active therapy in progress.',
          latestPlanNext: latestSession?.planNext || 'Continue next scheduled milestone.',
          attachments: p.attachments,
          sessionsHistory: p.therapySessions.map((s) => ({
            id: s.id,
            sessionNumber: s.sessionNumber,
            sessionDate: s.sessionDate,
            subjective: decryptField(s.subjective),
            objective: decryptField(s.objective),
            assessment: s.assessment,
            planNext: s.planNext,
            vitalstimUsed: s.vitalstimUsed,
          })),
        };
      });

    res.status(200).json({ success: true, progressReports });
  } catch (error) {
    console.error('Error fetching progress reports:', error);
    res.status(500).json({ success: false, error: 'Failed to generate progress reports' });
  }
});

export default router;
