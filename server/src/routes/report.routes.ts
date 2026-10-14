import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/reports/summary - Clinic Operational Summary
// -------------------------------------------------------------
router.get('/summary', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [patientCount, appointmentCount, todaysVisits, stockCount, invoiceAggregate, trialCount] = await Promise.all([
      prisma.patient.count({ where: { isDeleted: false } }),
      prisma.appointment.count(),
      prisma.visit.count({
        where: { visitDate: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.hearingAidInventory.count({ where: { status: 'IN_STOCK' } }),
      prisma.invoice.aggregate({
        _sum: { totalAmount: true, amountPaid: true, balanceDue: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.hearingAidTrial.count({ where: { outcome: 'ONGOING' } }),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalPatients: patientCount,
        totalAppointments: appointmentCount,
        todaysVisits: todaysVisits,
        devicesInStock: stockCount,
        activeTrials: trialCount,
        totalBilled: Number(invoiceAggregate._sum.totalAmount || 0),
        totalCollected: Number(invoiceAggregate._sum.amountPaid || 0),
        pendingDues: Number(invoiceAggregate._sum.balanceDue || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching report summary:', error);
    res.status(500).json({ success: false, error: 'Failed to generate summary' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/reports/export/patients - CSV Export
// -------------------------------------------------------------
router.get('/export/patients', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patients = await prisma.patient.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      select: {
        uhid: true,
        fullName: true,
        phone: true,
        email: true,
        age: true,
        gender: true,
        referralSource: true,
        createdAt: true,
      },
    });

    const headers = ['UHID', 'Full Name', 'Phone', 'Email', 'Age', 'Gender', 'Referral Source', 'Registered Date'];
    const rows = patients.map((p) => [
      `"${p.uhid}"`,
      `"${p.fullName.replace(/"/g, '""')}"`,
      `"${p.phone}"`,
      `"${p.email || ''}"`,
      `"${p.age ?? ''}"`,
      `"${p.gender || ''}"`,
      `"${(p.referralSource || '').replace(/"/g, '""')}"`,
      `"${p.createdAt.toISOString().split('T')[0]}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'EXPORT',
      entity: 'Patient',
      entityId: 'ALL',
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { exportType: 'CSV', count: patients.length },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="shree-clinic-patients.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting patients CSV:', error);
    res.status(500).json({ success: false, error: 'Failed to export patients' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/reports/export/invoices - CSV Export
// -------------------------------------------------------------
router.get('/export/invoices', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { patient: { select: { uhid: true, fullName: true } } },
    });

    const headers = ['Invoice Number', 'Date', 'Patient UHID', 'Patient Name', 'Subtotal', 'CGST', 'SGST', 'Total Amount', 'Amount Paid', 'Balance Due', 'Status'];
    const rows = invoices.map((inv) => [
      `"${inv.invoiceNumber}"`,
      `"${inv.invoiceDate.toISOString().split('T')[0]}"`,
      `"${inv.patient.uhid}"`,
      `"${inv.patient.fullName.replace(/"/g, '""')}"`,
      inv.subtotal,
      inv.cgstAmount,
      inv.sgstAmount,
      inv.totalAmount,
      inv.amountPaid,
      inv.balanceDue,
      `"${inv.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'EXPORT',
      entity: 'Invoice',
      entityId: 'ALL',
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { exportType: 'CSV', count: invoices.length },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="shree-clinic-invoices.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting invoices CSV:', error);
    res.status(500).json({ success: false, error: 'Failed to export invoices' });
  }
});

export default router;
