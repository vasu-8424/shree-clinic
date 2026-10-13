import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

/**
 * Website image storage.
 *
 * - If CLOUDINARY_* env vars are set, uploaded photos (data URLs) are pushed to
 *   Cloudinary and only the returned https link is stored in the database.
 * - If Cloudinary is not configured, the data URL is kept in the database, but
 *   it is never sent inside list responses. Instead it is exposed through
 *   GET /api/v1/images/file/:key, so the public image map stays a few KB.
 */

export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s;

export function isDataUrl(value: string): boolean {
  return DATA_URL_PATTERN.test(value);
}

export function parseDataUrl(value: string): { mimeType: string; buffer: Buffer } | null {
  const match = value.match(DATA_URL_PATTERN);
  if (!match) return null;
  return { mimeType: match[1], buffer: Buffer.from(match[2], 'base64') };
}

/**
 * Upload a data URL to Cloudinary under a stable public id per image key.
 * Returns the versioned https URL (the version changes on every upload, which
 * busts browser/CDN caches automatically).
 */
export async function uploadToCloudinary(key: string, dataUrl: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: 'shree-clinic/website',
    public_id: key,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });
  return result.secure_url;
}

/**
 * Turn a stored imageUrl into the URL the browser should load.
 * Data URLs are replaced by the dedicated file endpoint (with a version query
 * so a new upload is never served from a stale cache).
 */
export function toPublicUrl(key: string, imageUrl: string, updatedAt: Date): string {
  if (isDataUrl(imageUrl)) {
    return `/api/v1/images/file/${encodeURIComponent(key)}?v=${updatedAt.getTime()}`;
  }
  return imageUrl;
}
