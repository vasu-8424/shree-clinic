import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
    tokenVersion: number;
  };
}

/**
 * Authentication Middleware:
 * Verifies Bearer JWT access token from Authorization header.
 * Validates tokenVersion against the database to instantly invalidate revoked tokens.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. No token provided.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Verify admin exists and tokenVersion matches
    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
    });

    if (!admin) {
      res.status(401).json({
        error: 'Invalid session. Admin account not found.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    if (admin.tokenVersion !== payload.tokenVersion) {
      res.status(401).json({
        error: 'Session expired or invalidated. Please log in again.',
        code: 'TOKEN_REVOKED',
      });
      return;
    }

    // Attach verified admin to request
    req.admin = {
      id: admin.id,
      email: admin.email,
      tokenVersion: admin.tokenVersion,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Access token expired.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    res.status(401).json({
      error: 'Invalid access token.',
      code: 'INVALID_TOKEN',
    });
  }
}
