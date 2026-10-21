/**
 * In-Memory Access Token Store & Auto-Refreshing Fetch Client
 *
 * In production (Cloudflare Pages), API calls are proxied via VITE_API_BASE_URL
 * to the Render.com backend. In development, Vite proxy handles /api → localhost:5000.
 */

// In production, VITE_API_BASE_URL points to the Render backend (e.g. https://shree-clinic-api.onrender.com)
// In development, Vite proxy handles /api → localhost:5000, so BASE is empty string.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

let memoryAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  memoryAccessToken = token;
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Resolve a relative /api/... path to the full backend URL in production.
 */
function resolveUrl(endpoint: string): string {
  if (API_BASE && endpoint.startsWith('/api')) {
    return `${API_BASE}${endpoint}`;
  }
  return endpoint;
}

/**
 * Enhanced fetch client with:
 * - Automatic JWT bearer inclusion
 * - Silent 401 refresh retry
 * - Full backend URL resolution in production (Cloudflare Pages → Render)
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = resolveUrl(endpoint);
  const headers = new Headers(options.headers || {});

  // Attach access token if present
  if (memoryAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${memoryAccessToken}`);
  }

  // Ensure JSON content type if body is present and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensures httpOnly cookies (refreshToken) are sent
  };

  const response = await fetch(url, config);

  // If 401 Unauthorized and not on an auth endpoint, attempt silent token refresh once
  if (
    response.status === 401 &&
    !endpoint.includes('/api/v1/auth/login') &&
    !endpoint.includes('/api/v1/auth/refresh')
  ) {
    if (isRefreshing) {
      // Queue requests until refresh completes
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newToken: string) => {
            headers.set('Authorization', `Bearer ${newToken}`);
            resolve(fetch(url, { ...config, headers }));
          },
          reject: (err: any) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshUrl = resolveUrl('/api/v1/auth/refresh');
      const refreshResponse = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);

        // Retry original request with new token
        headers.set('Authorization', `Bearer ${data.accessToken}`);
        return fetch(url, { ...config, headers });
      } else {
        // Refresh token invalid or expired
        setAccessToken(null);
        processQueue(new Error('Session expired'), null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return response;
      }
    } catch (err) {
      setAccessToken(null);
      processQueue(err, null);
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}
