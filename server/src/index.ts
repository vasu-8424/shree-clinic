import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import { requireAuth, AuthenticatedRequest } from './middleware/auth.middleware.js';
import { apiRateLimiter, appointmentRateLimiter } from './middleware/rateLimiter.middleware.js';
import { sanitizeInputs, detectSQLInjection } from './middleware/sanitize.middleware.js';

const app = express();

// ─── Trust Reverse Proxy ─────────────────────────────────────────────────────
// Required for correct client IP when behind Nginx / Cloudflare / Render
app.set('trust proxy', 1);

// ─── Performance: Response Compression ───────────────────────────────────────
// Gzip/deflate all JSON + text responses. Critical for high-traffic (10k users).
app.use(
  compression({
    level: 6, // balanced CPU vs. compression ratio
    threshold: 1024, // only compress responses > 1KB
    filter: (req, res) => {
      // Never compress images/PDFs (already compressed)
      if (req.path.match(/\.(jpg|jpeg|png|gif|webp|pdf|ico)$/i)) return false;
      return compression.filter(req, res);
    },
  })
);

// ─── Security: Helmet (HTTP Headers) ────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // allow inline styles for PDF viewer
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", env.FRONTEND_URL],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // allow PDF embedding in iframes
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ─── Security: CORS ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 600, // Cache preflight for 10 minutes
  })
);

// ─── Security: HTTP Parameter Pollution Prevention ───────────────────────────
app.use(hpp());

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// ─── Security: Input Sanitization (XSS + SQLi detection) ────────────────────
app.use(sanitizeInputs);
app.use(detectSQLInjection);

// ─── Global API Rate Limiter ──────────────────────────────────────────────────
app.use('/api/', apiRateLimiter);

// ─── 1. Health Check Endpoint (Public) ───────────────────────────────────────
app.get('/api/v1/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      clinic: env.CLINIC_NAME,
      environment: env.NODE_ENV,
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: env.NODE_ENV === 'production' ? 'Database unavailable' : error.message,
    });
  }
});

// ─── 2. Auth Routes (/api/v1/auth/*) ─────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ─── 3. Public Appointment Intake (/api/v1/public/appointments) ──────────────
import appointmentRoutes from './routes/appointment.routes.js';
app.use(
  '/api/v1/public/appointments',
  express.json({ limit: '10kb' }),
  appointmentRateLimiter, // strict spam protection on form submissions
  appointmentRoutes
);

// ─── 4. Patient & Consent Routes (/api/v1/patients/*) ────────────────────────
app.use('/api/v1/patients', patientRoutes);

// ─── 5. Dynamic Website Image Routes (/api/v1/images/*) ──────────────────────
import imageRoutes from './routes/image.routes.js';
import { ensureDefaultWebsiteImages } from './utils/seedImages.js';
app.use('/api/v1/images', imageRoutes);

// ─── 6. Admin Appointments (/api/v1/appointments/*) ──────────────────────────
import appointmentAdminRoutes from './routes/appointment-admin.routes.js';
app.use('/api/v1/appointments', appointmentAdminRoutes);

// ─── 7. Hearing Aid Enquiries & Trials (/api/v1/hearing-aids/*) ──────────────
import hearingAidRoutes from './routes/hearing-aid.routes.js';
app.use('/api/v1/hearing-aids', hearingAidRoutes);

// ─── 8. Hearing Aid Stock & Repairs Inventory (/api/v1/inventory/*) ──────────
import inventoryRoutes from './routes/inventory.routes.js';
app.use('/api/v1/inventory', inventoryRoutes);

// ─── 9. Billing, GST Invoices & Payments (/api/v1/billing/*) ─────────────────
import billingRoutes from './routes/billing.routes.js';
app.use('/api/v1/billing', billingRoutes);

// ─── 10. Reports & Data Exports (/api/v1/reports/*) ──────────────────────────
import reportRoutes from './routes/report.routes.js';
app.use('/api/v1/reports', reportRoutes);

// ─── 11. DPDP Audit Logs (/api/v1/audit-logs/*) ──────────────────────────────
import auditRoutes from './routes/audit.routes.js';
app.use('/api/v1/audit-logs', auditRoutes);

// ─── 12. Clinic Settings & Password Management (/api/v1/settings/*) ──────────
import settingsRoutes from './routes/settings.routes.js';
app.use('/api/v1/settings', settingsRoutes);

// ─── 13. Speech Therapy & Physiotherapy Workspaces (/api/v1/therapy/*) ───────
import therapyRoutes from './routes/therapy.routes.js';
app.use('/api/v1/therapy', therapyRoutes);

// ─── 14. Patient Reviews & Testimonials (/api/v1/reviews/*) ───────────────────
import reviewRoutes from './routes/review.routes.js';
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/public/reviews', (req, _res, next) => {
  req.url = '/public' + (req.url === '/' ? '' : req.url);
  next();
}, reviewRoutes);

// ─── Static Uploads (Clinical PDFs) ──────────────────────────────────────────
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads'), {
    maxAge: '1d', // cache uploaded files for 1 day
    etag: true,
    lastModified: true,
  })
);

// ─── Protected Admin Ping ─────────────────────────────────────────────────────
app.get('/api/v1/admin/ping', requireAuth, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    message: 'Authorized access to admin API.',
    admin: req.admin,
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Don't leak stack traces in production
  const isDev = env.NODE_ENV !== 'production';
  console.error('[ERROR]', err?.message || err);
  res.status(err?.status || 500).json({
    error: err?.message || 'Internal server error',
    ...(isDev && { stack: err?.stack }),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`🚀 SHREE Clinic Backend running on http://localhost:${env.PORT}`);
    console.log(`🏥 Clinic: ${env.CLINIC_NAME}`);
    console.log(`📊 Health check: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`🔒 Security: Helmet + HPP + XSS sanitizer + SQL injection detector active`);
    console.log(`⚡ Performance: Gzip compression active`);
    // Seed and verify website images in database
    ensureDefaultWebsiteImages().catch(console.error);
  });

  // Graceful shutdown for high-concurrency deployments
  // Keeps existing connections alive while draining new ones
  const shutdown = (signal: string) => {
    console.log(`\n[${signal}] Gracefully shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Database disconnected. Server closed.');
      process.exit(0);
    });
    // Force shutdown after 30s if connections don't drain
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout.');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections — prevent server crash
  process.on('unhandledRejection', (reason: any) => {
    console.error('[UnhandledRejection]', reason?.message || reason);
  });
  process.on('uncaughtException', (err: Error) => {
    console.error('[UncaughtException]', err.message);
    // Don't exit — log and continue for resilience
  });
}

export default app;
