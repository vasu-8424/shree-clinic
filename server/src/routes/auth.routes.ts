import { Router, Request, Response } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { loginRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';

/**
 * POST /api/v1/auth/login
 * Single admin login with 5-failure lockout and Argon2 verification.
 */
router.post('/login', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Valid email and password are required.' });
    return;
  }

  const { email, password } = parseResult.data;
  const ipAddress = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const admin = await prisma.admin.findFirst();

  // Check if account is locked
  if (admin && admin.lockedUntil && admin.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / (60 * 1000));
    await createAuditLog({
      adminId: admin.id,
      action: 'LOGIN_FAILED',
      entity: 'Settings',
      ipAddress,
      userAgent,
      details: { reason: 'account_locked', minutesRemaining: minutesLeft },
    });

    res.status(429).json({
      error: `Account is locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      code: 'ACCOUNT_LOCKED',
      minutesRemaining: minutesLeft,
    });
    return;
  }

  // Generic failure response
  const genericAuthFailure = async () => {
    if (admin) {
      const nextFailCount = admin.failedAttempts + 1;
      const willLock = nextFailCount >= 5;
      const lockedUntil = willLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedAttempts: nextFailCount,
          lockedUntil,
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'LOGIN_FAILED',
        entity: 'Settings',
        ipAddress,
        userAgent,
        details: { failedAttempts: nextFailCount, locked: willLock },
      });

      if (willLock) {
        res.status(429).json({
          error: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.',
          code: 'ACCOUNT_LOCKED',
          minutesRemaining: 15,
        });
        return;
      }
    }

    res.status(401).json({
      error: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS',
    });
  };

  // If email mismatch or no admin registered
  if (!admin || admin.email.toLowerCase() !== email.toLowerCase().trim()) {
    await genericAuthFailure();
    return;
  }

  // Verify Argon2 password hash
  let passwordMatches = false;
  try {
    passwordMatches = await argon2.verify(admin.passwordHash, password);
  } catch (err) {
    passwordMatches = false;
  }

  if (!passwordMatches) {
    await genericAuthFailure();
    return;
  }

  // Success: Reset lockout & failed attempts
  const updatedAdmin = await prisma.admin.update({
    where: { id: admin.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  const accessToken = generateAccessToken({
    adminId: updatedAdmin.id,
    email: updatedAdmin.email,
    tokenVersion: updatedAdmin.tokenVersion,
  });

  const refreshToken = generateRefreshToken({
    adminId: updatedAdmin.id,
    tokenVersion: updatedAdmin.tokenVersion,
  });

  // Set httpOnly refresh cookie
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  await createAuditLog({
    adminId: updatedAdmin.id,
    action: 'LOGIN_SUCCESS',
    entity: 'Settings',
    ipAddress,
    userAgent,
    details: { outcome: 'success' },
  });

  res.status(200).json({
    accessToken,
    expiresIn: 900, // 15 minutes
    admin: {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      lastLoginAt: updatedAdmin.lastLoginAt,
    },
  });
});

/**
 * POST /api/v1/auth/refresh
 * Issues a new access token using httpOnly refreshToken cookie.
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies[REFRESH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: 'No refresh token provided.', code: 'NO_REFRESH_TOKEN' });
    return;
  }

  try {
    const payload = verifyRefreshToken(token);

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
    });

    if (!admin) {
      res.status(401).json({ error: 'Admin account not found.', code: 'USER_NOT_FOUND' });
      return;
    }

    if (admin.tokenVersion !== payload.tokenVersion) {
      res.status(401).json({ error: 'Refresh token revoked.', code: 'TOKEN_REVOKED' });
      return;
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      res.status(429).json({ error: 'Account is locked.', code: 'ACCOUNT_LOCKED' });
      return;
    }

    const newAccessToken = generateAccessToken({
      adminId: admin.id,
      email: admin.email,
      tokenVersion: admin.tokenVersion,
    });

    res.status(200).json({
      accessToken: newAccessToken,
      expiresIn: 900,
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token.', code: 'INVALID_REFRESH_TOKEN' });
  }
});

/**
 * POST /api/v1/auth/logout
 * Revokes current tokenVersion and clears the refresh cookie.
 */
router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.admin) {
    await prisma.admin.update({
      where: { id: req.admin.id },
      data: { tokenVersion: { increment: 1 } },
    });

    await createAuditLog({
      adminId: req.admin.id,
      action: 'LOGOUT',
      entity: 'Settings',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { outcome: 'success' },
    });
  }

  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: REFRESH_COOKIE_PATH,
    httpOnly: true,
    sameSite: 'lax',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/v1/auth/me
 * Returns current authenticated admin profile.
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.id },
    select: {
      id: true,
      email: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!admin) {
    res.status(404).json({ error: 'Admin not found.' });
    return;
  }

  res.status(200).json({ admin });
});

/**
 * POST /api/v1/auth/change-password
 * Updates password and revokes all active refresh tokens.
 */
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid password format.',
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { currentPassword, newPassword } = parseResult.data;

  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.id },
  });

  if (!admin) {
    res.status(404).json({ error: 'Admin not found.' });
    return;
  }

  const isCurrentValid = await argon2.verify(admin.passwordHash, currentPassword);
  if (!isCurrentValid) {
    res.status(400).json({
      error: 'Current password does not match.',
      code: 'PASSWORD_MISMATCH',
    });
    return;
  }

  const newHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      passwordHash: newHash,
      tokenVersion: { increment: 1 },
      failedAttempts: 0,
      lockedUntil: null,
    },
  });

  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: REFRESH_COOKIE_PATH,
    httpOnly: true,
    sameSite: 'lax',
  });

  await createAuditLog({
    adminId: admin.id,
    action: 'PASSWORD_CHANGED',
    entity: 'Settings',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: { outcome: 'password_updated' },
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again with your new password.',
  });
});

export default router;
