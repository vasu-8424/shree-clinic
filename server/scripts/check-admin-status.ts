import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function check() {
  const admin = await prisma.admin.findFirst();
  console.log('Admin Status in Database:', {
    id: admin?.id,
    email: admin?.email,
    failedAttempts: admin?.failedAttempts,
    lockedUntil: admin?.lockedUntil,
    tokenVersion: admin?.tokenVersion,
  });

  // Ensure clean unlocked state
  if (admin && (admin.failedAttempts > 0 || admin.lockedUntil !== null)) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
    console.log('✅ Admin account failedAttempts and lockedUntil have been reset.');
  } else {
    console.log('✅ Admin account is verified: 0 failed attempts and NOT locked.');
  }
}

check()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
