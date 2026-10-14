import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { createAuditLog } from '../utils/audit.js';
import { InventoryStatus, RepairStatus } from '@prisma/client';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/inventory - List Stock Units
// -------------------------------------------------------------
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as InventoryStatus | undefined;
    const brand = req.query.brand as string | undefined;
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (status) where.status = status;
    if (brand) where.brand = { equals: brand, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { modelName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.hearingAidInventory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        repairs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const summary = {
      total: items.length,
      inStock: items.filter((i) => i.status === InventoryStatus.IN_STOCK).length,
      onTrial: items.filter((i) => i.status === InventoryStatus.ON_TRIAL).length,
      sold: items.filter((i) => i.status === InventoryStatus.SOLD).length,
      underRepair: items.filter((i) => i.status === InventoryStatus.UNDER_REPAIR).length,
    };

    res.status(200).json({ success: true, items, summary });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/inventory - Add Stock Item
// -------------------------------------------------------------
const createStockSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required').max(80),
  modelName: z.string().trim().min(1, 'Model name is required').max(120),
  style: z.string().trim().min(1, 'Style is required').max(40), // RIC, BTE, CIC, ITC, ITE
  serialNumber: z.string().trim().min(1, 'Serial number is required').max(100),
  mrp: z.coerce.number().min(0, 'MRP must be positive'),
  purchasePrice: z.coerce.number().min(0).optional().nullable(),
  status: z.nativeEnum(InventoryStatus).default(InventoryStatus.IN_STOCK),
});

router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createStockSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const data = parse.data;

    // Check duplicate serial
    const existing = await prisma.hearingAidInventory.findUnique({
      where: { serialNumber: data.serialNumber },
    });
    if (existing) {
      res.status(400).json({ success: false, error: `Device with serial ${data.serialNumber} already exists` });
      return;
    }

    const item = await prisma.hearingAidInventory.create({
      data: {
        brand: data.brand,
        modelName: data.modelName,
        style: data.style,
        serialNumber: data.serialNumber,
        mrp: data.mrp,
        purchasePrice: data.purchasePrice ?? null,
        status: data.status,
      },
    });

    await createAuditLog({
      adminId: req.admin?.id || null,
      action: 'CREATE',
      entity: 'HearingAid',
      entityId: item.id,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      details: { brand: data.brand, model: data.modelName, serial: data.serialNumber },
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Error creating stock item:', error);
    res.status(500).json({ success: false, error: 'Failed to create inventory item' });
  }
});

// -------------------------------------------------------------
// PATCH /api/v1/inventory/:id - Update Stock Details or Status
// -------------------------------------------------------------
const updateStockSchema = z.object({
  brand: z.string().optional(),
  modelName: z.string().optional(),
  style: z.string().optional(),
  mrp: z.coerce.number().optional(),
  purchasePrice: z.coerce.number().optional().nullable(),
  status: z.nativeEnum(InventoryStatus).optional(),
});

router.patch('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = updateStockSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const updated = await prisma.hearingAidInventory.update({
      where: { id },
      data: parse.data,
    });

    res.status(200).json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating stock item:', error);
    res.status(500).json({ success: false, error: 'Failed to update inventory item' });
  }
});

// -------------------------------------------------------------
// DELETE /api/v1/inventory/:id - Delete Stock Item
// -------------------------------------------------------------
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.hearingAidInventory.findUnique({
      where: { id },
      include: { trials: { where: { outcome: 'ONGOING' } } },
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Item not found' });
      return;
    }

    if (item.trials.length > 0) {
      res.status(400).json({ success: false, error: 'Cannot delete unit currently in an ongoing patient trial' });
      return;
    }

    await prisma.hearingAidInventory.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Stock item deleted' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete inventory item' });
  }
});

// -------------------------------------------------------------
// POST /api/v1/inventory/:id/repair - Send to Repair
// -------------------------------------------------------------
const createRepairSchema = z.object({
  issueDescription: z.string().trim().min(3, 'Issue description required'),
  vendor: z.string().trim().max(120).optional().nullable(),
  repairCost: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.post('/:id/repair', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = createRepairSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { issueDescription, vendor, repairCost, notes } = parse.data;

    const result = await prisma.$transaction(async (tx) => {
      const repair = await tx.inventoryRepair.create({
        data: {
          inventoryId: id,
          issueDescription,
          sentDate: new Date(),
          vendor: vendor || null,
          repairCost: repairCost ?? null,
          notes: notes || null,
          status: RepairStatus.SENT,
        },
      });

      await tx.hearingAidInventory.update({
        where: { id },
        data: { status: InventoryStatus.UNDER_REPAIR },
      });

      return repair;
    });

    res.status(201).json({ success: true, repair: result });
  } catch (error) {
    console.error('Error recording repair:', error);
    res.status(500).json({ success: false, error: 'Failed to record repair' });
  }
});

// -------------------------------------------------------------
// PATCH /api/v1/inventory/repairs/:repairId - Return from Repair
// -------------------------------------------------------------
router.patch('/repairs/:repairId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { repairId } = req.params;
    const { status, returnedDate, notes } = req.body;

    const repair = await prisma.inventoryRepair.findUnique({ where: { id: repairId } });
    if (!repair) {
      res.status(404).json({ success: false, error: 'Repair log not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedRepair = await tx.inventoryRepair.update({
        where: { id: repairId },
        data: {
          status: status || RepairStatus.RETURNED,
          returnedDate: returnedDate ? new Date(returnedDate) : new Date(),
          notes: notes !== undefined ? notes : repair.notes,
        },
      });

      if (status === RepairStatus.RETURNED || !status) {
        await tx.hearingAidInventory.update({
          where: { id: repair.inventoryId },
          data: { status: InventoryStatus.IN_STOCK },
        });
      }

      return updatedRepair;
    });

    res.status(200).json({ success: true, repair: updated });
  } catch (error) {
    console.error('Error updating repair:', error);
    res.status(500).json({ success: false, error: 'Failed to update repair' });
  }
});

export default router;
