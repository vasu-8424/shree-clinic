import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAccessToken, getAccessToken } from '../api/client';

export interface AdminUser {
  id: string;
  email: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    locked?: boolean;
    minutesRemaining?: number;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session: Try silent refresh using httpOnly cookie
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (res.ok && mounted) {
          const data = await res.json();
          setAccessToken(data.accessToken);

          // Fetch current admin profile
          const meRes = await apiFetch('/api/v1/auth/me');
          if (meRes.ok && mounted) {
            const meData = await meRes.json();
            setAdmin(meData.admin);
          }
        }
      } catch (err) {
        // No active session
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    checkSession();

    // Listen for global auth expired events from client.ts
    const handleExpired = () => {
      setAdmin(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => {
      mounted = false;
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 429) {
        return {
          success: false,
          error: data.error || 'Account is temporarily locked.',
          locked: true,
          minutesRemaining: data.minutesRemaining || 15,
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Invalid email or password.',
        };
      }

      setAccessToken(data.accessToken);
      setAdmin(data.admin);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Unable to reach clinical server. Check network connection.',
      };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
