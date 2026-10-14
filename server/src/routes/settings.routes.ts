import { Router, Response } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/settings - Get Clinic Settings
// -------------------------------------------------------------
router.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let settings = await prisma.clinicSettings.findFirst();
    if (!settings) {
      settings = await prisma.clinicSettings.create({
        data: {
          clinicName: 'SHREE Multidisciplinary Healthcare',
          address: 'SY.NO.196/P, GROUNDFLOOR, LLP, FREEDOM HOSPITALS, SUBISHI TOWN CENTER, Shankarpalli, Mokila, Hyderabad, Telangana 501203',
          phone: '+91 79954 78069',
          whatsapp: '+91 79954 78069',
          invoiceFooter: 'Thank you for choosing SHREE Multidisciplinary Healthcare. For clinical appointments and queries, contact: +91 79954 78069.',
        },
      });
    }

    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// -------------------------------------------------------------
// PUT /api/v1/settings - Update Clinic Settings
// -------------------------------------------------------------
const updateSettingsSchema = z.object({
  clinicName: z.string().trim().min(2).max(150),
  address: z.string().trim().min(5),
  phone: z.string().trim().min(8).max(20),
  whatsapp: z.string().trim().min(8).max(20),
  gstin: z.string().trim().max(30).optional().nullable(),
  rciNumber: z.string().trim().max(50).optional().nullable(),
  invoiceFooter: z.string().trim().max(500).optional().nullable(),
});

router.put('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = updateSettingsSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const data = parse.data;
    const existing = await prisma.clinicSettings.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.clinicSettings.update({
        where: { id: existing.id },
        data: {
          clinicName: data.clinicName,
          address: data.address,
          phone: data.phone,
          whatsapp: data.whatsapp,
          gstin: data.gstin || null,
          rciNumber: data.rciNumber || null,
          invoiceFooter: data.invoiceFooter || null,
        },
      });
    } else {
      updated = await prisma.clinicSettings.create({
        data: {
          clinicName: data.clinicName,
          address: data.address,
          phone: data.phone,
          whatsapp: data.whatsapp,
          gstin: data.gstin || null,
          rciNumber: data.rciNumber || null,
          invoiceFooter: data.invoiceFooter || null,
        },
      });
    }

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'UPDATE',
      entity: 'Settings',
      entityId: updated.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { clinicName: data.clinicName },
    });

    res.status(200).json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/settings/change-password - Change Admin Password
// -------------------------------------------------------------
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.post('/change-password', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = changePasswordSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { currentPassword, newPassword } = parse.data;
    const adminId = req.admin?.id;

    if (!adminId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      res.status(404).json({ success: false, error: 'Admin account not found' });
      return;
    }

    const isCurrentValid = await argon2.verify(admin.passwordHash, currentPassword);
    if (!isCurrentValid) {
      res.status(400).json({ success: false, error: 'Current password does not match' });
      return;
    }

    const newHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    await prisma.admin.update({
      where: { id: adminId },
      data: {
        passwordHash: newHash,
        tokenVersion: { increment: 1 }, // Invalidates older refresh tokens
      },
    });

    await createAuditLog({
      adminId,
      action: 'UPDATE',
      entity: 'Settings',
      entityId: adminId,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { action: 'PASSWORD_CHANGED' },
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

export default router;
