import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Login Route:
 * Max 10 requests per 15 minutes per IP address.
 * Prevents brute-force attacks on admin login.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    error: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Standard API Rate Limiter:
 * 200 requests per minute per IP (suitable for ~10k concurrent users via CDN/proxy).
 * Static image serving is skipped to avoid penalizing normal page loads.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Website images are CDN-cached and heavily loaded per page; don't penalize them
  skip: (req) => req.path.startsWith('/v1/images/file/'),
  message: {
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Strict Public Appointment Submission Limiter:
 * Max 5 appointment submissions per 10 minutes per IP.
 * Prevents form spam and booking flood attacks.
 */
export const appointmentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many appointment requests. Please try again after 10 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
