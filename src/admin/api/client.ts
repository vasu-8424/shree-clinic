/**
 * In-Memory Access Token Store & Auto-Refreshing Fetch Client
 */

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
 * Enhanced fetch client with automatic JWT bearer inclusion and silent 401 refresh retry.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
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

  const response = await fetch(endpoint, config);

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
            resolve(fetch(endpoint, { ...config, headers }));
          },
          reject: (err: any) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);

        // Retry original request with new token
        headers.set('Authorization', `Bearer ${data.accessToken}`);
        return fetch(endpoint, { ...config, headers });
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
