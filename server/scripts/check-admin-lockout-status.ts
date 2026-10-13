import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkAdminStatus() {
  const admin = await prisma.admin.findFirst();
  if (!admin) {
    console.log('No admin found.');
    return;
  }
  console.log(`Admin email: ${admin.email}`);
  console.log(`Failed attempts: ${admin.failedAttempts}`);
  console.log(`Locked until: ${admin.lockedUntil}`);
  console.log(`Token version: ${admin.tokenVersion}`);
  await prisma.$disconnect();
}

checkAdminStatus();
