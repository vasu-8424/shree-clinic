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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// 3. Example Protected Route to verify requireAuth middleware
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
  });
}

export default app;
