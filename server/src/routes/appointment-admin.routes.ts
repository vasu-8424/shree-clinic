import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { normalizePhoneNumber } from '../utils/phone.js';
import { encryptField, decryptField } from '../utils/crypto.js';
import { createAuditLog } from '../utils/audit.js';
import { DepartmentType, AppointmentStatus } from '@prisma/client';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/appointments - List Appointments (Admin)
// -------------------------------------------------------------
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const status = req.query.status as AppointmentStatus | undefined;
    const department = req.query.department as DepartmentType | undefined;
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { patientName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ appointmentDate: 'desc' }, { createdAt: 'desc' }],
        include: {
          patient: {
            select: { id: true, uhid: true, fullName: true, phone: true },
          },
        },
      }),
    ]);

    const formatted = appointments.map((apt) => ({
      ...apt,
      healthConcern: apt.healthConcern ? decryptField(apt.healthConcern) : null,
    }));

    res.status(200).json({
      success: true,
      appointments: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/appointments - Admin Create Appointment
// -------------------------------------------------------------
const createAptSchema = z.object({
  patientName: z.string().trim().min(2, 'Name is required').max(150),
  phone: z.string().trim().min(8, 'Valid phone is required').max(20),
  department: z.nativeEnum(DepartmentType),
  appointmentDate: z.string().optional().nullable(),
  timeSlot: z.string().trim().min(1, 'Time slot is required').max(60),
  healthConcern: z.string().trim().max(500).optional().nullable(),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.CONFIRMED),
  patientId: z.string().uuid().optional().nullable(),
});

router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createAptSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const data = parse.data;
    const normalizedPhone = normalizePhoneNumber(data.phone) || data.phone;
    const encryptedConcern = data.healthConcern ? encryptField(data.healthConcern) : null;

    const aptDate = data.appointmentDate ? new Date(data.appointmentDate) : new Date();

    const appointment = await prisma.appointment.create({
      data: {
        patientName: data.patientName,
        phone: normalizedPhone,
        department: data.department,
        appointmentDate: aptDate,
        timeSlot: data.timeSlot,
        healthConcern: encryptedConcern,
        status: data.status,
        source: 'walk_in',
        patientId: data.patientId || null,
      },
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { department: data.department, status: data.status },
    });

    res.status(201).json({
      success: true,
      appointment: {
        ...appointment,
        healthConcern: data.healthConcern || null,
      },
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
});

// -------------------------------------------------------------
// PATCH /api/v1/appointments/:id/status - Update Status & Date
// -------------------------------------------------------------
const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  appointmentDate: z.string().optional().nullable(),
  timeSlot: z.string().optional().nullable(),
});

router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = updateStatusSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { status, appointmentDate, timeSlot } = parse.data;
    const updateData: any = { status };
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (timeSlot) updateData.timeSlot = timeSlot;

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { newStatus: status },
    });

    res.status(200).json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, error: 'Failed to update appointment' });
  }
});

// -------------------------------------------------------------
// DELETE /api/v1/appointments/:id - Delete Appointment
// -------------------------------------------------------------
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'DELETE',
      entity: 'Appointment',
      entityId: id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { deleted: true },
    });

    res.status(200).json({ success: true, message: 'Appointment removed' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete appointment' });
  }
});

export default router;
