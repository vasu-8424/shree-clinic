import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../config/prisma.js';
import { normalizePhoneNumber } from '../utils/phone.js';
import { mapServiceToDepartment } from '../utils/department.js';
import { encryptField } from '../utils/crypto.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// -------------------------------------------------------------
// RATE LIMITING & SECURITY
// -------------------------------------------------------------

// Strict Rate Limiter: 5 requests per 10 minutes per IP
export const publicAppointmentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many appointment requests from this IP. Please try again after 10 minutes or call the clinic directly.',
  },
});

// -------------------------------------------------------------
// ZOD VALIDATION SCHEMA
// -------------------------------------------------------------

const VALID_SERVICES = [
  'Audiology & Hearing Care',
  'Speech & Language Therapy',
  'Physiotherapy & Mobility',
] as const;

const VALID_TIME_SLOTS = [
  'Morning (9:00 AM – 1:00 PM)',
  'Evening (4:00 PM – 8:00 PM)',
] as const;

const publicAppointmentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  phone: z.string().trim().min(8, 'Phone number must be at least 8 digits').max(20),
  service: z.enum(VALID_SERVICES, {
    errorMap: () => ({ message: 'Service must be one of the recognized clinic departments' }),
  }),
  timeSlot: z.enum(VALID_TIME_SLOTS, {
    errorMap: () => ({ message: 'Time slot must be a valid clinic consultation window' }),
  }),
  concern: z.string().trim().max(500, 'Health concern cannot exceed 500 characters').optional().nullable(),
  hp: z.string().optional().nullable(), // Honeypot trap for automated spam bots
});

// -------------------------------------------------------------
// POST /api/v1/public/appointments - Public Booking Intake
// -------------------------------------------------------------
router.post(
  '/',
  publicAppointmentLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = publicAppointmentSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ status: 'error' });
        return;
      }

      const { name, phone, service, timeSlot, concern, hp } = parseResult.data;

      // 1. Honeypot check: If non-empty, silently succeed without storing
      if (hp && hp.trim() !== '') {
        res.status(200).json({ status: 'success' });
        return;
      }

      // 2. Normalize and validate Indian / International mobile phone
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!normalizedPhone || !/^\+91\d{10}$/.test(normalizedPhone)) {
        res.status(400).json({ status: 'error' });
        return;
      }

      // 3. Department mapping via shared utility
      const department = mapServiceToDepartment(service);

      // 4. Deduplication: Same normalized phone + department within past 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const existingRecent = await prisma.appointment.findFirst({
        where: {
          phone: normalizedPhone,
          department,
          createdAt: { gte: thirtyMinutesAgo },
          source: 'website',
        },
        select: { id: true },
      });

      if (existingRecent) {
        // Return normal success without creating duplicate
        res.status(200).json({ status: 'success' });
        return;
      }

      // 5. Encrypt health concern at rest (publicly submitted medical info)
      const encryptedConcern = concern && concern.trim() ? encryptField(concern.trim()) : null;

      // 6. Create appointment row
      const appointment = await prisma.appointment.create({
        data: {
          patientName: name,
          phone: normalizedPhone,
          department,
          timeSlot,
          healthConcern: encryptedConcern,
          appointmentDate: null, // Initial web intake has null date; confirmed by clinic coordinator
          status: 'PENDING',
          source: 'website',
        },
      });

      // 7. Audit Log: Log appointment creation with ID only (NO name, phone, or concern)
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;
      await createAuditLog({
        adminId: null,
        action: 'CREATE',
        entity: 'Appointment',
        entityId: appointment.id,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || null,
        details: { source: 'website', status: 'PENDING' },
      });

      // 8. Opaque success response (No IDs or internal database info)
      res.status(200).json({ status: 'success' });
    } catch (error) {
      // Never log sensitive user data
      console.error('Public appointment processing failed');
      res.status(500).json({ status: 'error' });
    }
  }
);

export default router;
