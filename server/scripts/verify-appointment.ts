import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../src/config/prisma.js';
import { decryptField } from '../src/utils/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
  const appt = await prisma.appointment.findFirst({
    where: { patientName: 'Rohit Sharma' },
  });
  if (!appt) {
    console.log('No appointment found.');
    return;
  }
  console.log({
    id: appt.id,
    status: appt.status,
    phone: appt.phone,
    department: appt.department,
    timeSlot: appt.timeSlot,
    date: appt.appointmentDate,
    source: appt.source,
    isEncrypted: appt.healthConcern ? appt.healthConcern.startsWith('enc:') : false,
    decryptedConcern: decryptField(appt.healthConcern),
  });

  // Cleanup
  await prisma.appointment.delete({ where: { id: appt.id } });
  await prisma.auditLog.deleteMany({ where: { entity: 'Appointment', entityId: appt.id } });
  await prisma.$disconnect();
}

verify();
