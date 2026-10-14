import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { generateNextInvoiceNumber } from '../utils/counter.js';
import { createAuditLog } from '../utils/audit.js';
import { PaymentMode, InvoiceStatus } from '@prisma/client';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/billing/stats - Summary Revenue Stats
// -------------------------------------------------------------
router.get('/stats', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      select: { totalAmount: true, amountPaid: true, balanceDue: true, status: true },
    });

    let totalBilled = 0;
    let totalCollected = 0;
    let totalDue = 0;

    for (const inv of invoices) {
      if (inv.status !== InvoiceStatus.CANCELLED) {
        totalBilled += Number(inv.totalAmount);
        totalCollected += Number(inv.amountPaid);
        totalDue += Number(inv.balanceDue);
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalBilled,
        totalCollected,
        totalDue,
        totalInvoices: invoices.length,
      },
    });
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate stats' });
  }
});

// -------------------------------------------------------------
// GET /api/v1/billing/invoices - List Invoices
// -------------------------------------------------------------
router.get('/invoices', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as InvoiceStatus | undefined;
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { patient: { fullName: { contains: search, mode: 'insensitive' } } },
        { patient: { phone: { contains: search } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, uhid: true, fullName: true, phone: true } },
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/billing/invoices - Create GST Invoice
// -------------------------------------------------------------
const createInvoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Item description required'),
  hsnSac: z.string().trim().optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0),
});

const createInvoiceSchema = z.object({
  patientId: z.string().uuid('Valid patient required'),
  items: z.array(createInvoiceItemSchema).min(1, 'At least one line item required'),
  discount: z.coerce.number().min(0).default(0),
  isGstApplied: z.boolean().default(false),
  cgstRate: z.coerce.number().min(0).default(9),
  sgstRate: z.coerce.number().min(0).default(9),
  notes: z.string().optional().nullable(),
  initialPayment: z.object({
    amount: z.coerce.number().min(0),
    mode: z.nativeEnum(PaymentMode).default(PaymentMode.UPI),
    transactionReference: z.string().optional().nullable(),
  }).optional(),
});

router.post('/invoices', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createInvoiceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const data = parse.data;

    // Check patient
    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    // Calculate subtotal
    let subtotal = 0;
    const itemsData = data.items.map((item) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      return {
        description: item.description,
        hsnSac: item.hsnSac || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      };
    });

    const discount = Math.min(subtotal, data.discount);
    const taxableAmount = subtotal - discount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    if (data.isGstApplied) {
      cgstAmount = (taxableAmount * data.cgstRate) / 100;
      sgstAmount = (taxableAmount * data.sgstRate) / 100;
    }

    const totalAmount = Math.round((taxableAmount + cgstAmount + sgstAmount) * 100) / 100;

    const initialPaid = data.initialPayment ? Math.min(totalAmount, data.initialPayment.amount) : 0;
    const balanceDue = totalAmount - initialPaid;

    let invoiceStatus: InvoiceStatus = InvoiceStatus.UNPAID;
    if (balanceDue <= 0) {
      invoiceStatus = InvoiceStatus.PAID;
    } else if (initialPaid > 0) {
      invoiceStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generateNextInvoiceNumber(tx);

      const created = await tx.invoice.create({
        data: {
          invoiceNumber,
          patientId: data.patientId,
          subtotal,
          discount,
          isGstApplied: data.isGstApplied,
          cgstRate: data.cgstRate,
          cgstAmount,
          sgstRate: data.sgstRate,
          sgstAmount,
          totalAmount,
          amountPaid: initialPaid,
          balanceDue,
          status: invoiceStatus,
          notes: data.notes || null,
          items: { create: itemsData },
        },
        include: { items: true, patient: true },
      });

      if (initialPaid > 0 && data.initialPayment) {
        await tx.payment.create({
          data: {
            invoiceId: created.id,
            patientId: data.patientId,
            amount: initialPaid,
            mode: data.initialPayment.mode,
            transactionReference: data.initialPayment.transactionReference || null,
            notes: 'Initial payment at invoice generation',
          },
        });
      }

      return created;
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'Invoice',
      entityId: invoice.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { invoiceNumber: invoice.invoiceNumber, totalAmount, status: invoiceStatus },
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to create invoice' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/billing/invoices/:id/payments - Record Payment
// -------------------------------------------------------------
const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be greater than 0'),
  mode: z.nativeEnum(PaymentMode).default(PaymentMode.UPI),
  transactionReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.post('/invoices/:id/payments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = recordPaymentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { amount, mode, transactionReference, notes } = parse.data;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      res.status(404).json({ success: false, error: 'Invoice not found' });
      return;
    }

    const currentPaid = Number(invoice.amountPaid);
    const total = Number(invoice.totalAmount);
    const newPaid = Math.min(total, currentPaid + amount);
    const newBalance = Math.max(0, total - newPaid);

    const newStatus = newBalance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    const payment = await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.create({
        data: {
          invoiceId: id,
          patientId: invoice.patientId,
          amount,
          mode,
          transactionReference: transactionReference || null,
          notes: notes || null,
        },
      });

      await tx.invoice.update({
        where: { id },
        data: {
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newStatus,
        },
      });

      return pay;
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'UPDATE',
      entity: 'Invoice',
      entityId: id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { amountPaid: amount, newStatus, mode },
    });

    res.status(201).json({ success: true, payment, newStatus, balanceDue: newBalance });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, error: 'Failed to record payment' });
  }
});

export default router;
