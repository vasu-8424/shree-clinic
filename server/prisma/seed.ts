import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SHREE Clinic Database Seeding...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shreeclinic.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be defined in .env');
  }

  const passwordHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  // 1. Idempotent Single Admin: update if exists, or create if none exists
  const existingAdmin = await prisma.admin.findFirst();

  if (existingAdmin) {
    const updated = await prisma.admin.update({
      where: { id: existingAdmin.id },
      data: {
        email: adminEmail,
        passwordHash,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
    console.log(`✅ Updated existing Admin account credentials (ID: ${updated.id}, Email: ${updated.email})`);
  } else {
    const created = await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
        tokenVersion: 0,
        failedAttempts: 0,
      },
    });
    console.log(`✅ Seeded Single Admin Account: ${created.email}`);
  }

  // 2. Seed Default Clinic Settings
  const existingSettings = await prisma.clinicSettings.findFirst();
  if (!existingSettings) {
    const settings = await prisma.clinicSettings.create({
      data: {
        clinicName: process.env.CLINIC_NAME || 'SHREE Multidisciplinary Healthcare',
        address:
          process.env.CLINIC_ADDRESS ||
          'SY.NO.196/P, GROUNDFLOOR, LLP, FREEDOM HOSPITALS, SUBISHI TOWN CENTER, Shankarpalli, Mokila, Hyderabad, Telangana 501203',
        phone: process.env.CLINIC_PHONE || '+91 79954 78069',
        whatsapp: process.env.CLINIC_WHATSAPP || '+91 79954 78069',
        gstin: process.env.CLINIC_GSTIN || '',
        rciNumber: process.env.CLINIC_RCI_NUMBER || '',
        invoiceFooter:
          'Thank you for choosing SHREE Multidisciplinary Healthcare. For clinical appointments and queries, contact: +91 79954 78069.',
      },
    });
    console.log(`✅ Seeded Clinic Settings: ${settings.clinicName}`);
  } else {
    console.log(`ℹ️ Clinic Settings already present: ${existingSettings.clinicName}`);
  }

  // 3. Seed Initial Sequence Counters
  const currentYear = new Date().getFullYear();
  const uhidKey = `patient_uhid_${currentYear}`;
  const invoicePrefix = process.env.INVOICE_PREFIX || 'SHREE/26-27/';
  const invoiceKey = `invoice_${invoicePrefix.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  await prisma.counter.upsert({
    where: { key: uhidKey },
    update: {},
    create: { key: uhidKey, value: 0 },
  });

  await prisma.counter.upsert({
    where: { key: invoiceKey },
    update: {},
    create: { key: invoiceKey, value: 0 },
  });

  console.log(`✅ Seeded Counters: ${uhidKey}, ${invoiceKey}`);

  // 4. Seed Hearing Aid Demo Stock ONLY when explicitly requested via SEED_SAMPLE_DATA=true
  if (process.env.SEED_SAMPLE_DATA === 'true') {
    const inventoryCount = await prisma.hearingAidInventory.count();
    if (inventoryCount === 0) {
      await prisma.hearingAidInventory.createMany({
        data: [
          {
            brand: 'Phonak',
            modelName: 'Audeo Lumity L90-R',
            style: 'RIC',
            serialNumber: 'PH-L90-2026-001',
            purchasePrice: 95000.0,
            mrp: 145000.0,
            status: 'IN_STOCK',
          },
          {
            brand: 'Signia',
            modelName: 'Pure Charge&Go 7AX',
            style: 'RIC',
            serialNumber: 'SIG-7AX-2026-002',
            purchasePrice: 88000.0,
            mrp: 135000.0,
            status: 'IN_STOCK',
          },
          {
            brand: 'Widex',
            modelName: 'Moment Sheer 440 sRIC',
            style: 'RIC',
            serialNumber: 'WDX-440-2026-003',
            purchasePrice: 98000.0,
            mrp: 150000.0,
            status: 'IN_STOCK',
          },
          {
            brand: 'Oticon',
            modelName: 'Real 1 miniRITE R',
            style: 'RIC',
            serialNumber: 'OTC-R1-2026-004',
            purchasePrice: 92000.0,
            mrp: 140000.0,
            status: 'IN_STOCK',
          },
        ],
      });
      console.log('✅ Seeded Sample Hearing Aid Demo Units (SEED_SAMPLE_DATA=true)');
    }
  } else {
    console.log('ℹ️ Skipping sample inventory seed (SEED_SAMPLE_DATA != true)');
  }

  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
