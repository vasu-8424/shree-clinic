import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { createAuditLog } from '../utils/audit.js';
import { ensureDefaultWebsiteImages, INITIAL_WEBSITE_IMAGES } from '../utils/seedImages.js';
import {
  isCloudinaryConfigured,
  isDataUrl,
  parseDataUrl,
  toPublicUrl,
  uploadToCloudinary,
} from '../utils/imageStorage.js';

const router = Router();

// Max decoded size for an uploaded photo. The /edit page already shrinks photos
// in the browser, so real uploads are far below this.
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const updateImageSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Image URL or image data is required')
    .refine(
      (v) => v.startsWith('/') || /^https?:\/\//i.test(v) || isDataUrl(v),
      'Image must be an uploaded photo, an https:// link, or a /images/... path'
    ),
});

type WebsiteImageRow = Awaited<ReturnType<typeof prisma.websiteImage.findMany>>[number];

/** Strip raw photo data from a row so responses only ever carry links. */
function serializeImage(img: WebsiteImageRow) {
  const publicUrl = toPublicUrl(img.key, img.imageUrl, img.updatedAt);
  return {
    id: img.id,
    key: img.key,
    title: img.title,
    section: img.section,
    description: img.description,
    imageUrl: publicUrl,
    defaultUrl: img.defaultUrl,
    isCustom: img.imageUrl !== img.defaultUrl,
    updatedAt: img.updatedAt,
  };
}

/**
 * GET /api/v1/images
 * Public: key -> URL map used by the website, plus the list used by /edit.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    let images = await prisma.websiteImage.findMany({
      orderBy: [{ section: 'asc' }, { title: 'asc' }],
    });

    if (images.length < INITIAL_WEBSITE_IMAGES.length) {
      await ensureDefaultWebsiteImages();
      images = await prisma.websiteImage.findMany({
        orderBy: [{ section: 'asc' }, { title: 'asc' }],
      });
    }

    const serialized = images.map(serializeImage);
    const map: Record<string, string> = {};
    for (const img of serialized) {
      map[img.key] = img.imageUrl || img.defaultUrl;
    }

    res.set('Cache-Control', 'no-cache');
    res.status(200).json({ success: true, map, images: serialized });
  } catch (error) {
    console.error('Failed to fetch public images:', error);
    // Never break the website: fall back to the bundled default photos.
    const map: Record<string, string> = {};
    INITIAL_WEBSITE_IMAGES.forEach((item) => {
      map[item.key] = item.defaultUrl;
    });
    res.status(200).json({
      success: true,
      map,
      images: INITIAL_WEBSITE_IMAGES.map((img) => ({
        ...img,
        id: img.key,
        imageUrl: img.defaultUrl,
        isCustom: false,
        updatedAt: new Date(),
      })),
    });
  }
});

/**
 * GET /api/v1/images/file/:key
 * Public: serves a photo that is stored inside the database (used when
 * Cloudinary is not configured). External links are redirected.
 */
router.get('/file/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const img = await prisma.websiteImage.findUnique({ where: { key: req.params.key } });
    if (!img) {
      res.status(404).end();
      return;
    }

    const parsed = parseDataUrl(img.imageUrl);
    if (!parsed) {
      res.redirect(302, img.imageUrl || img.defaultUrl);
      return;
    }

    res.set('Content-Type', parsed.mimeType);
    res.set('Content-Length', String(parsed.buffer.length));
    // URL carries ?v=<updatedAt>, so a new upload always gets a new URL.
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(parsed.buffer);
  } catch (error) {
    console.error('Failed to serve website image file:', error);
    res.status(500).end();
  }
});

/**
 * GET /api/v1/images/admin
 * Protected: same list as the public endpoint, for the editor.
 */
router.get('/admin', requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await ensureDefaultWebsiteImages();
    const images = await prisma.websiteImage.findMany({
      orderBy: [{ section: 'asc' }, { title: 'asc' }],
    });
    res.status(200).json({ success: true, images: images.map(serializeImage) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve website images' });
  }
});

/**
 * PUT /api/v1/images/:key
 * Protected: replace a website image with an uploaded photo or a link.
 */
router.put('/:key', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const parseResult = updateImageSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.issues[0]?.message || 'A valid image is required.',
      });
      return;
    }

    let { imageUrl } = parseResult.data;

    const existing = await prisma.websiteImage.findUnique({ where: { key } });
    if (!existing) {
      res.status(404).json({ error: `Image "${key}" was not found.` });
      return;
    }

    let storage: 'cloudinary' | 'database' | 'link' = 'link';

    if (isDataUrl(imageUrl)) {
      const parsed = parseDataUrl(imageUrl);
      if (!parsed || parsed.buffer.length === 0) {
        res.status(400).json({ error: 'The uploaded photo could not be read. Please try another file.' });
        return;
      }
      if (parsed.buffer.length > MAX_UPLOAD_BYTES) {
        res.status(413).json({ error: 'Photo is too large. Please upload an image under 8 MB.' });
        return;
      }

      storage = 'database';
      if (isCloudinaryConfigured) {
        try {
          imageUrl = await uploadToCloudinary(key, imageUrl);
          storage = 'cloudinary';
        } catch (uploadError) {
          // Don't fail the save: keep the photo in the database instead.
          console.error('Cloudinary upload failed, storing image in database:', uploadError);
        }
      }
    }

    const updated = await prisma.websiteImage.update({
      where: { key },
      data: { imageUrl },
    });

    if (req.admin) {
      await createAuditLog({
        adminId: req.admin.id,
        action: 'UPDATE',
        entity: 'Settings',
        entityId: updated.key,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { action: 'website_image_updated', key: updated.key, storage },
      });
    }

    res.status(200).json({
      success: true,
      image: serializeImage(updated),
      storage,
      message: `Image "${updated.title}" updated.`,
    });
  } catch (error: any) {
    console.error('Failed to update website image:', error);
    res.status(500).json({ error: 'Could not save the image. Please try again.' });
  }
});

/**
 * POST /api/v1/images/:key/reset
 * Protected: restore the original bundled photo.
 */
router.post('/:key/reset', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const existing = await prisma.websiteImage.findUnique({ where: { key } });

    if (!existing) {
      res.status(404).json({ error: `Image "${key}" was not found.` });
      return;
    }

    const updated = await prisma.websiteImage.update({
      where: { key },
      data: { imageUrl: existing.defaultUrl },
    });

    if (req.admin) {
      await createAuditLog({
        adminId: req.admin.id,
        action: 'UPDATE',
        entity: 'Settings',
        entityId: updated.key,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { action: 'website_image_reset_to_default', key: updated.key },
      });
    }

    res.status(200).json({
      success: true,
      image: serializeImage(updated),
      message: `Image "${updated.title}" restored to the original photo.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Could not reset the image. Please try again.' });
  }
});

export default router;
