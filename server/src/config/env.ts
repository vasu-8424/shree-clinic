import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  ADMIN_EMAIL: z.string().email().default('admin@shreeclinic.com'),
  ADMIN_PASSWORD: z.string().min(8),

  JWT_SECRET: z.string().min(16).default('shree_clinic_jwt_super_secret_dev_key_32chars'),
  JWT_REFRESH_SECRET: z.string().min(16).default('shree_clinic_refresh_super_secret_dev_key_32'),

  // 32-byte hex string (64 characters) for AES-256-GCM
  DATA_ENCRYPTION_KEY: z
    .string()
    .length(64, 'DATA_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)')
    .default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),

  INVOICE_PREFIX: z.string().default('SHREE/26-27/'),
  CLINIC_NAME: z.string().default('SHREE Multidisciplinary Healthcare'),
  CLINIC_PHONE: z.string().default('+91 79954 78069'),
  CLINIC_WHATSAPP: z.string().default('+91 79954 78069'),
  CLINIC_ADDRESS: z
    .string()
    .default(
      'SY.NO.196/P, GROUNDFLOOR, LLP, FREEDOM HOSPITALS, SUBISHI TOWN CENTER, Shankarpalli, Mokila, Hyderabad, Telangana 501203'
    ),
  CLINIC_GSTIN: z.string().optional(),
  CLINIC_RCI_NUMBER: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid Server Environment Variables:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
