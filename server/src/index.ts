import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import { requireAuth, AuthenticatedRequest } from './middleware/auth.middleware.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// Trust reverse proxy for real client IP (Cloudflare / Vercel / Render / Nginx)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Global standard rate limiter on all API routes
app.use('/api/', apiRateLimiter);

// 1. Health Check Endpoint (Public)
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
      error: error.message,
    });
  }
});

// 2. Auth Routes (/api/v1/auth/*)
app.use('/api/v1/auth', authRoutes);

// 3. Public Appointment Intake Route (/api/v1/public/appointments)
import appointmentRoutes from './routes/appointment.routes.js';
app.use('/api/v1/public/appointments', express.json({ limit: '10kb' }), appointmentRoutes);

// 4. Patient & Consent Routes (/api/v1/patients/*)
app.use('/api/v1/patients', patientRoutes);

// 5. Dynamic Website Image Routes (/api/v1/images/*)
import imageRoutes from './routes/image.routes.js';
import { ensureDefaultWebsiteImages } from './utils/seedImages.js';
app.use('/api/v1/images', imageRoutes);

// 6. Admin Appointments (/api/v1/appointments/*)
import appointmentAdminRoutes from './routes/appointment-admin.routes.js';
app.use('/api/v1/appointments', appointmentAdminRoutes);

// 7. Hearing Aid Enquiries & Trials (/api/v1/hearing-aids/*)
import hearingAidRoutes from './routes/hearing-aid.routes.js';
app.use('/api/v1/hearing-aids', hearingAidRoutes);

// 8. Hearing Aid Stock & Repairs Inventory (/api/v1/inventory/*)
import inventoryRoutes from './routes/inventory.routes.js';
app.use('/api/v1/inventory', inventoryRoutes);

// 9. Billing, GST Invoices & Payments (/api/v1/billing/*)
import billingRoutes from './routes/billing.routes.js';
app.use('/api/v1/billing', billingRoutes);

// 10. Reports & Data Exports (/api/v1/reports/*)
import reportRoutes from './routes/report.routes.js';
app.use('/api/v1/reports', reportRoutes);

// 11. DPDP Audit Logs (/api/v1/audit-logs/*)
import auditRoutes from './routes/audit.routes.js';
app.use('/api/v1/audit-logs', auditRoutes);

// 12. Clinic Settings & Password Management (/api/v1/settings/*)
import settingsRoutes from './routes/settings.routes.js';
app.use('/api/v1/settings', settingsRoutes);

// 13. Example Protected Route to verify requireAuth middleware
app.get('/api/v1/admin/ping', requireAuth, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    message: 'Authorized access to admin API.',
    admin: req.admin,
    timestamp: new Date().toISOString(),
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`🚀 SHREE Clinic Backend running on http://localhost:${env.PORT}`);
    console.log(`🏥 Clinic: ${env.CLINIC_NAME}`);
    console.log(`📊 Health check: http://localhost:${env.PORT}/api/v1/health`);
    // Seed and verify website images in database
    ensureDefaultWebsiteImages().catch(console.error);
  });
}

export default app;
