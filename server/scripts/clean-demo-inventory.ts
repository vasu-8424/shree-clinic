import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function clean() {
  const result = await prisma.hearingAidInventory.deleteMany({});
  console.log(`✅ Successfully removed ${result.count} demo inventory unit(s) from Neon database.`);
}

clean()
  .catch((e) => {
    console.error('Failed to clean demo units:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
