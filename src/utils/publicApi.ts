/**
 * Public API fetch utility
 * Resolves API URLs correctly for both dev (Vite proxy) and production (Cloudflare Pages → Render backend).
 */

const DEFAULT_PROD_BACKEND = 'https://shree-clinic-pfjz.onrender.com';

function getApiBase(): string {
  // 1. Explicit env variable takes highest precedence
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 2. Browser check: If on localhost or 127.0.0.1, use relative paths (Vite dev proxy)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
    // Any production domain (shreespeechhearingandrehabilitation.com, pages.dev, workers.dev)
    return DEFAULT_PROD_BACKEND;
  }
  // 3. Fallback for production build
  return import.meta.env.PROD ? DEFAULT_PROD_BACKEND : '';
}

const API_BASE = getApiBase();

/**
 * Prepends the backend base URL to any /api/... path.
 * In development (localhost): returns path as-is (Vite proxy handles it → localhost:5000)
 * In production: returns https://shree-clinic-pfjz.onrender.com/api/...
 */
export function apiUrl(path: string): string {
  const base = getApiBase();
  if (base && path.startsWith('/api')) {
    return `${base.replace(/\/+$/, '')}${path}`;
  }
  return path;
}

/**
 * Fetch wrapper that uses the correct backend URL in all environments.
 */
export async function publicFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), options);
}
