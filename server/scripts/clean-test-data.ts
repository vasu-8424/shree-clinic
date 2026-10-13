import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function cleanMainDatabase() {
  console.log('🧹 Cleaning all test patients and test audit rows from main database...');

  // 1. Fetch all patients
  const patients = await prisma.patient.findMany({ select: { id: true, uhid: true, fullName: true } });
  console.log(`Found ${patients.length} patient(s) in database.`);

  for (const p of patients) {
    const id = p.id;
    console.log(`Deleting patient: ${p.fullName} (${p.uhid}, ID: ${id})`);
    await prisma.$transaction([
      prisma.reminderLog.deleteMany({ where: { patientId: id } }),
      prisma.payment.deleteMany({ where: { patientId: id } }),
      prisma.invoiceItem.deleteMany({ where: { invoice: { patientId: id } } }),
      prisma.invoice.deleteMany({ where: { patientId: id } }),
      prisma.hearingAidSale.deleteMany({ where: { patientId: id } }),
      prisma.hearingAidTrial.deleteMany({ where: { patientId: id } }),
      prisma.hearingAidEnquiry.deleteMany({ where: { patientId: id } }),
      prisma.therapySession.deleteMany({ where: { patientId: id } }),
      prisma.therapyPlan.deleteMany({ where: { patientId: id } }),
      prisma.audiogram.deleteMany({ where: { patientId: id } }),
      prisma.attachment.deleteMany({ where: { patientId: id } }),
      prisma.visit.deleteMany({ where: { patientId: id } }),
      prisma.appointment.deleteMany({ where: { patientId: id } }),
      prisma.consentRecord.deleteMany({ where: { patientId: id } }),
      prisma.patient.delete({ where: { id } }),
    ]);
  }

  // 2. Delete test audit rows (Patient audit logs)
  const deletedAudit = await prisma.auditLog.deleteMany({
    where: {
      entity: 'Patient',
    },
  });
  console.log(`Deleted ${deletedAudit.count} Patient audit log row(s).`);

  // 3. Reset Counter for patient_uhid_2026 to 0
  const currentYear = new Date().getFullYear();
  const counterKey = `patient_uhid_${currentYear}`;
  const counter = await prisma.counter.upsert({
    where: { key: counterKey },
    update: { value: 0 },
    create: { key: counterKey, value: 0 },
  });
  console.log(`Reset Counter '${counterKey}' to value: ${counter.value}`);

  // Confirm state
  const remainingPatients = await prisma.patient.count();
  const counterAfter = await prisma.counter.findUnique({ where: { key: counterKey } });
  console.log(`\nVerification:`);
  console.log(`Remaining patients: ${remainingPatients}`);
  console.log(`Counter ${counterKey}: ${counterAfter?.value}`);

  await prisma.$disconnect();
}

cleanMainDatabase().catch((err) => {
  console.error('Clean failed:', err);
  process.exit(1);
});
