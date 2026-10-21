/**
 * Public API fetch utility
 * Resolves API URLs correctly for both dev (Vite proxy) and production (Cloudflare Pages → Render backend).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Prepends the backend base URL to any /api/... path.
 * In development: returns path as-is (Vite proxy handles it → localhost:5000)
 * In production: returns https://shree-clinic-api.onrender.com/api/...
 */
export function apiUrl(path: string): string {
  if (API_BASE && path.startsWith('/api')) {
    return `${API_BASE}${path}`;
  }
  return path;
}

/**
 * Fetch wrapper that uses the correct backend URL in all environments.
 */
export async function publicFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), options);
}
