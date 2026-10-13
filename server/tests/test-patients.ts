import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import argon2 from 'argon2';
import { getTestPrisma } from './test-db-guard.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { requireActiveConsent, ConsentError } from '../src/utils/consent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
const prisma = getTestPrisma();

async function runPatientTests() {
  console.log('🧪 Starting Step (c) DPDP Patients & Consent Verification Tests...\n');
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

  // Ensure test admin exists and obtain access token
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shreeclinic.com';
  const adminPassword = process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be configured');
  }

  let admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await argon2.hash(adminPassword, { type: argon2.argon2id });
    admin = await prisma.admin.create({
      data: { email: adminEmail, passwordHash, tokenVersion: 0 },
    });
  }

  const token = generateAccessToken({
    adminId: admin.id,
    email: admin.email,
    tokenVersion: admin.tokenVersion,
  });

  const authHeader = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // -------------------------------------------------------------
    // TEST 1: Consent Required under DPDP Act 2023
    // -------------------------------------------------------------
    const resNoConsent = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        fullName: 'Test Consent Denied',
        phone: '9876543210',
        chiefComplaint: 'Speech issues',
        consent: false,
      }),
    });
    const dataNoConsent = await resNoConsent.json();
    assert(
      resNoConsent.status === 400 && dataNoConsent.error.includes('DPDP Act 2023'),
      '1. Patient creation rejected when explicit consent=true is missing'
    );

    // -------------------------------------------------------------
    // TEST 2: Creation with Consent, Phone Normalization & UHID
    // -------------------------------------------------------------
    const resCreate = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        fullName: 'Kavitha Rao',
        phone: '09876543210', // 11 digits with leading 0 -> +919876543210
        email: 'kavitha@example.com',
        age: 34,
        gender: 'Female',
        chiefComplaint: 'Difficulty hearing in noisy environments',
        caseHistory: 'Patient reports progressive bilateral hearing loss over 2 years.',
        consent: true,
        consentVersion: '1.0',
        consentNotes: 'Signed digital consent in clinic',
      }),
    });
    const dataCreate = await resCreate.json();
    assert(
      resCreate.status === 201 &&
        dataCreate.data.phone === '+919876543210' &&
        dataCreate.data.uhid.startsWith('SHREE-') &&
        dataCreate.data.consent.status === 'ACTIVE',
      '2. Patient created in 1 transaction with normalized +91 phone, atomic UHID and Active Consent',
      dataCreate.data.uhid
    );
    const kavithaId = dataCreate.data.id;
    const kavithaUhid = dataCreate.data.uhid;

    // -------------------------------------------------------------
    // TEST 3: Encrypted caseHistory in DB vs Decrypted in API
    // -------------------------------------------------------------
    const rawPatientFromDb = await prisma.patient.findUnique({
      where: { id: kavithaId },
    });
    assert(
      rawPatientFromDb?.caseHistory?.startsWith('enc:') === true,
      '3a. caseHistory is stored strictly as ciphertext (enc:...) in the database'
    );

    const resGetPatient = await fetch(`${baseUrl}/patients/${kavithaId}`, {
      headers: authHeader,
    });
    const dataGetPatient = await resGetPatient.json();
    assert(
      dataGetPatient.data.caseHistory === 'Patient reports progressive bilateral hearing loss over 2 years.',
      '3b. API decrypts caseHistory on GET /patients/:id'
    );

    // -------------------------------------------------------------
    // TEST 4: List Endpoint NEVER Returns caseHistory
    // -------------------------------------------------------------
    const resList = await fetch(`${baseUrl}/patients`, { headers: authHeader });
    const dataList = await resList.json();
    const listContainsCaseHistory = dataList.data.some((p: any) => p.caseHistory !== undefined);
    assert(
      !listContainsCaseHistory,
      '4. List endpoint (GET /patients) NEVER returns caseHistory in payload'
    );

    // -------------------------------------------------------------
    // TEST 5: Duplicate Phone + Name Warning with Override
    // -------------------------------------------------------------
    const resDuplicateReject = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        fullName: 'Kavitha Rao',
        phone: '9876543210',
        chiefComplaint: 'Second registration attempt',
        consent: true,
        allowDuplicate: false,
      }),
    });
    const dataDuplicateReject = await resDuplicateReject.json();
    assert(
      resDuplicateReject.status === 409 && dataDuplicateReject.code === 'DUPLICATE_PATIENT',
      '5a. Duplicate patient (same name & phone) returns 409 Conflict with warning code DUPLICATE_PATIENT'
    );

    const resDuplicateAllowed = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        fullName: 'Kavitha Rao',
        phone: '9876543210',
        chiefComplaint: 'Family member sharing phone',
        consent: true,
        allowDuplicate: true, // override allowed
      }),
    });
    assert(
      resDuplicateAllowed.status === 201,
      '5b. Duplicate phone + name allowed when allowDuplicate=true (family members sharing a phone)'
    );

    // -------------------------------------------------------------
    // TEST 6: UHID Uniqueness Under 20 Parallel Creates
    // -------------------------------------------------------------
    console.log('  ⏳ Stress testing: creating 20 patients concurrently...');
    const parallelPromises = Array.from({ length: 20 }, (_, i) =>
      fetch(`${baseUrl}/patients`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          fullName: `Parallel Patient ${i + 1}`,
          phone: `+9198765${(20000 + i).toString().slice(1)}`,
          chiefComplaint: `Concurrent test case ${i + 1}`,
          consent: true,
        }),
      }).then((r) => r.json())
    );

    const parallelResults = await Promise.all(parallelPromises);
    const uhids = parallelResults.map((r) => r.data?.uhid).filter(Boolean);
    const uniqueUhids = new Set(uhids);

    assert(
      uhids.length === 20 && uniqueUhids.size === 20,
      '6. UHID uniqueness verified: all 20 parallel creates received unique sequence numbers',
      `${uniqueUhids.size}/20 unique`
    );

    // -------------------------------------------------------------
    // TEST 7: Search by Name, Phone, and UHID
    // -------------------------------------------------------------
    const resSearchUhid = await fetch(`${baseUrl}/patients?search=${kavithaUhid}`, {
      headers: authHeader,
    });
    const dataSearchUhid = await resSearchUhid.json();
    assert(
      dataSearchUhid.data.length >= 1 && dataSearchUhid.data[0].uhid === kavithaUhid,
      '7a. Search by UHID returns correct patient'
    );

    const resSearchPhone = await fetch(`${baseUrl}/patients?search=9876543210`, {
      headers: authHeader,
    });
    const dataSearchPhone = await resSearchPhone.json();
    assert(
      dataSearchPhone.data.length >= 1 && dataSearchPhone.data.some((p: any) => p.id === kavithaId),
      '7b. Search by phone returns matching patient'
    );

    // -------------------------------------------------------------
    // TEST 8: Withdrawn Consent Blocks New Clinical Records (requireActiveConsent helper)
    // -------------------------------------------------------------
    // Step 8a: Withdraw consent
    const resWithdraw = await fetch(`${baseUrl}/patients/${kavithaId}/consent/withdraw`, {
      method: 'POST',
      headers: authHeader,
    });
    assert(resWithdraw.status === 200, '8a. POST /patients/:id/consent/withdraw records withdrawal');

    // Step 8b: requireActiveConsent throws 403 ConsentError
    let consentBlocked = false;
    let consentErrorCode = '';
    let consentStatusCode = 0;
    try {
      await requireActiveConsent(kavithaId, prisma);
    } catch (err: any) {
      if (err instanceof ConsentError || err.code === 'CONSENT_WITHDRAWN') {
        consentBlocked = true;
        consentErrorCode = err.code;
        consentStatusCode = err.statusCode;
      }
    }
    assert(
      consentBlocked && consentStatusCode === 403 && consentErrorCode === 'CONSENT_WITHDRAWN',
      '8b. requireActiveConsent(patientId) throws ConsentError (HTTP 403) when consent is withdrawn'
    );

    // Step 8c: Re-establish consent
    const resRenewConsent = await fetch(`${baseUrl}/patients/${kavithaId}/consent`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ consentVersion: '2.0', notes: 'Re-consented' }),
    });
    assert(resRenewConsent.status === 200, '8c. POST /patients/:id/consent re-establishes active consent');

    // Step 8d: requireActiveConsent now passes
    let consentPassedAfterRenew = false;
    try {
      await requireActiveConsent(kavithaId, prisma);
      consentPassedAfterRenew = true;
    } catch (err) {
      consentPassedAfterRenew = false;
    }
    assert(consentPassedAfterRenew, '8d. requireActiveConsent passes after consent is renewed');

    // -------------------------------------------------------------
    // TEST 9: Soft-Deleted Patient Hidden
    // -------------------------------------------------------------
    const resSoftDelete = await fetch(`${baseUrl}/patients/${kavithaId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    assert(resSoftDelete.status === 200, '9a. DELETE /patients/:id soft deletes patient');

    const resGetAfterDelete = await fetch(`${baseUrl}/patients/${kavithaId}`, {
      headers: authHeader,
    });
    assert(
      resGetAfterDelete.status === 404,
      '9b. Soft-deleted patient is hidden from GET /patients/:id'
    );

    const resListAfterDelete = await fetch(`${baseUrl}/patients?search=${kavithaUhid}`, {
      headers: authHeader,
    });
    const dataListAfterDelete = await resListAfterDelete.json();
    assert(
      dataListAfterDelete.data.length === 0,
      '9c. Soft-deleted patient is excluded from GET /patients list'
    );

    // -------------------------------------------------------------
    // TEST 10: Permanent Erasure Removes Related Rows & Stored Files
    // -------------------------------------------------------------
    // Attach dummy clinical visit, invoice, and a stored local file attachment
    await prisma.visit.create({
      data: {
        patientId: kavithaId,
        visitType: 'AUDIOLOGY',
        diagnosis: 'Test bilateral sensorineural loss',
      },
    });

    const testFilePath = path.resolve(__dirname, `../temp-attachment-${kavithaId}.txt`);
    fs.writeFileSync(testFilePath, 'Clinical report file content');

    await prisma.attachment.create({
      data: {
        patientId: kavithaId,
        fileName: 'test-report.txt',
        fileKey: testFilePath,
        fileType: 'text/plain',
        fileSize: 30,
      },
    });

    // Erase with wrong password -> rejected
    const resEraseBadPassword = await fetch(`${baseUrl}/patients/${kavithaId}/erase`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        adminPassword: 'WrongPassword!',
        confirmationText: 'PERMANENTLY ERASE',
      }),
    });
    assert(
      resEraseBadPassword.status === 401,
      '10a. Permanent erasure rejected when admin password is incorrect'
    );

    // Erase with correct password
    const resErase = await fetch(`${baseUrl}/patients/${kavithaId}/erase`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        adminPassword: adminPassword,
        confirmationText: 'PERMANENTLY ERASE',
      }),
    });
    assert(
      resErase.status === 200,
      '10b. POST /patients/:id/erase permanently deletes patient with verified admin password'
    );

    const checkDbDeleted = await prisma.patient.findUnique({
      where: { id: kavithaId },
    });
    const checkVisitsDeleted = await prisma.visit.findMany({
      where: { patientId: kavithaId },
    });
    const checkAttachmentsDeleted = await prisma.attachment.findMany({
      where: { patientId: kavithaId },
    });
    const fileRemoved = !fs.existsSync(testFilePath);

    assert(
      !checkDbDeleted && checkVisitsDeleted.length === 0 && checkAttachmentsDeleted.length === 0 && fileRemoved,
      '10c. Permanent erase removed patient row, related visits, attachments, and stored files from disk'
    );

    // -------------------------------------------------------------
    // TEST 11: GET /patients/:id/data-export (DPDP Portability)
    // -------------------------------------------------------------
    const resExportCreate = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        fullName: 'Export Verification Patient',
        phone: '9988771122',
        chiefComplaint: 'Data export audit test',
        caseHistory: 'Sensitive medical history for export',
        consent: true,
      }),
    });
    const dataExportCreate = await resExportCreate.json();
    const exportPatientId = dataExportCreate.data.id;

    const resExport = await fetch(`${baseUrl}/patients/${exportPatientId}/data-export`, {
      headers: authHeader,
    });
    const dataExport = await resExport.json();
    assert(
      resExport.status === 200 &&
        dataExport.exportMetadata?.compliance?.includes('DPDP Act 2023') &&
        dataExport.patientProfile?.fullName === 'Export Verification Patient' &&
        dataExport.patientProfile?.caseHistory === 'Sensitive medical history for export',
      '11. GET /patients/:id/data-export returns complete DPDP Section 11 data portability JSON with decrypted health records'
    );
  } finally {
    // Confirm admin's failedAttempts and lockedUntil are clean
    const verifiedAdmin = await prisma.admin.findUnique({ where: { id: admin.id } });
    assert(
      verifiedAdmin?.failedAttempts === 0 && verifiedAdmin?.lockedUntil === null,
      'Admin lockout state verified clean: failedAttempts=0, lockedUntil=null'
    );
  }

  console.log(`\n📊 Patients DPDP Test Summary: ${testsPassed}/${totalTests} tests passed.`);
  if (testsPassed === totalTests) {
    console.log('🎉 All Step (c) Patient & Consent Tests Passed Successfully!');
  } else {
    throw new Error('Some patient tests failed.');
  }
}

runPatientTests()
  .catch((err) => {
    console.error('Patient test run error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
