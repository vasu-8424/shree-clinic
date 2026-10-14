import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/v1/audit-logs - Query DPDP Audit Trail
// -------------------------------------------------------------
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const skip = (page - 1) * limit;

    const action = (req.query.action as string)?.trim().toUpperCase();
    const entity = (req.query.entity as string)?.trim();

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = { contains: entity, mode: 'insensitive' };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { email: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

export default router;
