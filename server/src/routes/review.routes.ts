import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Zod validation schema for public review submission
const createReviewSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  rating: z.coerce
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  department: z
    .string()
    .trim()
    .max(80)
    .optional()
    .default('General Care'),
  treatment: z
    .string()
    .trim()
    .max(150)
    .optional()
    .nullable(),
  comment: z
    .string()
    .trim()
    .min(10, 'Review comment must be at least 10 characters')
    .max(1200, 'Review comment cannot exceed 1200 characters'),
  city: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable(),
});

// Initial seed reviews if database table is empty
const INITIAL_REVIEWS = [
  {
    patientName: 'K. Sridhar Rao',
    rating: 5,
    department: 'Audiology',
    treatment: 'Digital Hearing Aid Fitting',
    city: 'Mokila, Hyderabad',
    comment:
      'The audiologist took thorough time during the pure tone audiometry and speech discrimination testing. The trial of digital hearing aids helped me understand conversations with family clearly again. Highly recommend Shree Clinic.',
    isPublished: true,
  },
  {
    patientName: 'Ananya & Venkatesh (Parents of Aarav)',
    rating: 5,
    department: 'Speech Therapy',
    treatment: 'Pediatric Speech & Language Therapy',
    city: 'Shankarpalli',
    comment:
      'Our 3.5-year-old son was struggling with words and sentence formation. Within four months of structured, playful speech sessions, his vocabulary and sentence clarity improved dramatically. The therapist guides us with daily home activities too.',
    isPublished: true,
  },
  {
    patientName: 'Col. P. Ramachandran (Retd.)',
    rating: 5,
    department: 'Physiotherapy',
    treatment: 'Post-Stroke Mobility Rehabilitation',
    city: 'Gachibowli',
    comment:
      'Dedicated physiotherapy team with patience and structured exercise plans. From being wheelchair-dependent after a stroke to walking independently with a cane, the recovery has given me my confidence back.',
    isPublished: true,
  },
];

/**
 * Seed initial reviews if empty
 */
async function ensureInitialReviews() {
  try {
    const count = await prisma.review.count();
    if (count === 0) {
      for (const rev of INITIAL_REVIEWS) {
        await prisma.review.create({ data: rev });
      }
    }
  } catch (err) {
    console.warn('[REVIEWS] Seed initial reviews check skipped:', err);
  }
}

// ─── 1. PUBLIC ENDPOINTS ───────────────────────────────────────────────────────

/**
 * GET /api/v1/public/reviews
 * Returns all published reviews for display on the public website.
 */
router.get('/public', async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureInitialReviews();

    const reviews = await prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        patientName: true,
        rating: true,
        department: true,
        treatment: true,
        comment: true,
        city: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error: any) {
    console.error('[PUBLIC REVIEWS GET ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient reviews',
    });
  }
});

/**
 * POST /api/v1/public/reviews
 * Public submission of patient review.
 * Default isPublished = false so clinic admin can review & approve before displaying.
 */
router.post('/public', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid review data',
      });
      return;
    }

    const { patientName, rating, department, treatment, comment, city } = parseResult.data;

    const newReview = await prisma.review.create({
      data: {
        patientName,
        rating,
        department: department || 'General Care',
        treatment: treatment || null,
        comment,
        city: city || null,
        isPublished: false, // Pending admin approval
      },
    });

    res.status(201).json({
      success: true,
      message:
        'Thank you! Your review has been submitted successfully and will appear on the clinic website once approved by our team.',
      review: {
        id: newReview.id,
        patientName: newReview.patientName,
        rating: newReview.rating,
        department: newReview.department,
      },
    });
  } catch (error: any) {
    console.error('[PUBLIC REVIEW POST ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review. Please try again later.',
    });
  }
});

// ─── 2. PROTECTED ADMIN ENDPOINTS ─────────────────────────────────────────────

/**
 * GET /api/v1/reviews
 * Admin: list all reviews (both published and hidden) with summary statistics.
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await ensureInitialReviews();

    const { status, department } = req.query;

    const whereClause: any = {};
    if (status === 'published') {
      whereClause.isPublished = true;
    } else if (status === 'hidden') {
      whereClause.isPublished = false;
    }

    if (department && typeof department === 'string' && department !== 'all') {
      whereClause.department = { contains: department, mode: 'insensitive' };
    }

    const [reviews, totalCount, publishedCount, hiddenCount, aggregateRating] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count(),
      prisma.review.count({ where: { isPublished: true } }),
      prisma.review.count({ where: { isPublished: false } }),
      prisma.review.aggregate({
        _avg: { rating: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        published: publishedCount,
        hidden: hiddenCount,
        avgRating: Number((aggregateRating._avg.rating || 5).toFixed(1)),
      },
      reviews,
    });
  } catch (error: any) {
    console.error('[ADMIN REVIEWS GET ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
    });
  }
});

/**
 * PATCH /api/v1/reviews/:id/publish
 * Admin: toggle or set whether a review is displayed on the public website.
 */
router.patch('/:id/publish', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'isPublished must be a boolean (true or false)',
      });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isPublished },
    });

    res.status(200).json({
      success: true,
      message: isPublished
        ? 'Review is now published on the website.'
        : 'Review is now hidden from the website.',
      review: updated,
    });
  } catch (error: any) {
    console.error('[ADMIN REVIEW PUBLISH TOGGLE ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review visibility status',
    });
  }
});

/**
 * DELETE /api/v1/reviews/:id
 * Admin: delete a review entirely.
 */
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN REVIEW DELETE ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review',
    });
  }
});

export default router;
