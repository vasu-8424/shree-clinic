import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTestPrisma } from './test-db-guard.js';
import { decryptField } from '../src/utils/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
const prisma = getTestPrisma();

async function runAppointmentTests() {
  console.log('🧪 Starting Step (d) Public Appointment Endpoint Verification Tests...\n');
  console.log(`Target URL: ${baseUrl}\n`);

  let totalTests = 0;
  let testsPassed = 0;

  function assert(condition: boolean, testName: string, detail = '') {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Endpoint works without auth token; protected routes return 401
    // -------------------------------------------------------------
    const resProtected = await fetch(`${baseUrl}/patients`);
    assert(
      resProtected.status === 401,
      '1a. Protected routes (/api/v1/patients) reject unauthenticated requests with 401'
    );

    const testUniquePhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
    const resValid = await fetch(`${baseUrl}/public/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suresh Reddy',
        phone: testUniquePhone,
        service: 'Audiology & Hearing Care',
        timeSlot: 'Morning (9:00 AM – 1:00 PM)',
        concern: 'Severe tinnitus and hearing loss in left ear',
      }),
    });
    const dataValid = await resValid.json();
    assert(
      resValid.status === 200 && dataValid.status === 'success' && !dataValid.id,
      '1b. Public appointment endpoint succeeds without auth token and returns opaque { status: "success" } only'
    );

    // -------------------------------------------------------------
    // TEST 2: Row created with status PENDING, appointmentDate null, and encrypted concern
    // -------------------------------------------------------------
    const createdAppointment = await prisma.appointment.findFirst({
      where: { phone: testUniquePhone },
    });
    const isEncryptedInDb = createdAppointment?.healthConcern?.startsWith('enc:') === true;
    const decryptedConcern = decryptField(createdAppointment?.healthConcern);

    assert(
      createdAppointment !== null &&
        createdAppointment.status === 'PENDING' &&
        createdAppointment.appointmentDate === null &&
        createdAppointment.source === 'website' &&
        createdAppointment.department === 'AUDIOLOGY' &&
        isEncryptedInDb &&
        decryptedConcern === 'Severe tinnitus and hearing loss in left ear',
      '2. Database row created with PENDING status, null date, source "website", mapped department, and AES-256-GCM encrypted healthConcern'
    );

    // -------------------------------------------------------------
    // TEST 3: Honeypot stores nothing
    // -------------------------------------------------------------
    const honeypotPhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
    const resHoneypot = await fetch(`${baseUrl}/public/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spam Bot',
        phone: honeypotPhone,
        service: 'Speech & Language Therapy',
        timeSlot: 'Evening (4:00 PM – 8:00 PM)',
        concern: 'Spam promotional content',
        hp: 'http://spam-link.ru', // honeypot populated
      }),
    });
    const dataHoneypot = await resHoneypot.json();
    const honeypotInDb = await prisma.appointment.findFirst({
      where: { phone: honeypotPhone },
    });
    assert(
      resHoneypot.status === 200 && dataHoneypot.status === 'success' && honeypotInDb === null,
      '3. Honeypot trap returns fake success response but stores NOTHING in the database'
    );

    // -------------------------------------------------------------
    // TEST 4: Invalid phone returns 400
    // -------------------------------------------------------------
    const resBadPhone = await fetch(`${baseUrl}/public/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Contact',
        phone: '123', // Invalid digits
        service: 'Physiotherapy & Mobility',
        timeSlot: 'Morning (9:00 AM – 1:00 PM)',
      }),
    });
    assert(
      resBadPhone.status === 400,
      '4. Invalid phone number rejected with HTTP 400'
    );

    // -------------------------------------------------------------
    // TEST 5: Invalid service returns 400
    // -------------------------------------------------------------
    const resBadService = await fetch(`${baseUrl}/public/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        phone: '9876543210',
        service: 'Cardiology Surgery', // Not a clinic service
        timeSlot: 'Morning (9:00 AM – 1:00 PM)',
      }),
    });
    assert(
      resBadService.status === 400,
      '5. Invalid service name rejected with HTTP 400'
    );

    // -------------------------------------------------------------
    // TEST 6: Deduplication within 30 minutes
    // -------------------------------------------------------------
    const dedupePhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
    const payloadDedupe = {
      name: 'Dedupe Test Patient',
      phone: dedupePhone,
      service: 'Speech & Language Therapy',
      timeSlot: 'Morning (9:00 AM – 1:00 PM)',
      concern: 'First submission',
    };

    // First submission
    const resDedupe1 = await fetch(`${baseUrl}/public/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadDedupe),
    });

    // Immediate second submission with same phone + service
    const resDedupe2 = await fetch(`${baseUrl}/public/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payloadDedupe,
        concern: 'Accidental double click repeat',
      }),
    });

    const dedupeRows = await prisma.appointment.findMany({
      where: { phone: dedupePhone },
    });

    assert(
      resDedupe1.status === 200 && resDedupe2.status === 200 && dedupeRows.length === 1,
      '6. Deduplication works: identical phone + service within 30 minutes returns success without duplicate row (1 row stored)'
    );

    // -------------------------------------------------------------
    // TEST 7: Rate Limit - 6th request within 10 minutes returns 429
    // -------------------------------------------------------------
    console.log('  ⏳ Testing rate limiter (5 req / 10 min window)...');
    let sawRateLimit = false;
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${baseUrl}/public/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Rate Patient ${i}`,
          phone: `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
          service: 'Physiotherapy & Mobility',
          timeSlot: 'Evening (4:00 PM – 8:00 PM)',
        }),
      });

      if (res.status === 429) {
        sawRateLimit = true;
        break;
      }
    }
    assert(
      sawRateLimit,
      '7. Rate limiter enforced: excess requests within 10-minute window return HTTP 429'
    );
  } finally {
    // Cleanup any test appointments created during this test
    await prisma.appointment.deleteMany({
      where: {
        source: 'website',
        patientName: { in: ['Suresh Reddy', 'Spam Bot', 'Dedupe Test Patient'] },
      },
    });
  }

  console.log(`\n📊 Public Appointment Test Summary: ${testsPassed}/${totalTests} tests passed.`);
  if (testsPassed === totalTests) {
    console.log('🎉 All Step (d) Public Appointment Tests Passed Successfully!');
  } else {
    throw new Error('Some public appointment tests failed.');
  }
}

runAppointmentTests()
  .catch((err) => {
    console.error('Appointment test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
