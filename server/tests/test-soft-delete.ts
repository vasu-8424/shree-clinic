import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTestPrisma } from './test-db-guard.js';
import { DepartmentType } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = getTestPrisma();

async function runSoftDeleteTests() {
  console.log('🧪 Starting Soft-Delete Prisma Extension Verification Tests...\n');

  const testUhidActive = `TEST-ACT-${Date.now()}`;
  const testUhidDeleted = `TEST-DEL-${Date.now()}`;

  // 1. Setup: Create one active patient and one soft-deleted patient
  const activePatient = await prisma.patient.create({
    data: {
      uhid: testUhidActive,
      fullName: 'Active Test Patient',
      phone: '+919999900001',
      chiefComplaint: 'Hearing difficulty',
      isDeleted: false,
    },
  });

  const deletedPatient = await prisma.patient.create({
    data: {
      uhid: testUhidDeleted,
      fullName: 'Deleted Test Patient',
      phone: '+919999900002',
      chiefComplaint: 'Speech stutter',
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  // Attach a visit to both patients
  const activeVisit = await prisma.visit.create({
    data: {
      patientId: activePatient.id,
      visitType: DepartmentType.AUDIOLOGY,
      diagnosis: 'Bilateral mild sensorineural hearing loss',
    },
  });

  const deletedVisit = await prisma.visit.create({
    data: {
      patientId: deletedPatient.id,
      visitType: DepartmentType.SPEECH_THERAPY,
      diagnosis: 'Fluency disorder',
    },
  });

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  try {
    // TEST 1: findUnique on soft-deleted patient
    const uniqueResult = await prisma.patient.findUnique({
      where: { id: deletedPatient.id },
    });
    assert(uniqueResult === null, 'findUnique({ where: { id } }) returns null for soft-deleted patient');

    // TEST 2: findUnique on active patient
    const activeUnique = await prisma.patient.findUnique({
      where: { id: activePatient.id },
    });
    assert(activeUnique !== null && activeUnique.id === activePatient.id, 'findUnique returns active patient');

    // TEST 3: findFirst on soft-deleted patient phone
    const firstResult = await prisma.patient.findFirst({
      where: { phone: '+919999900002' },
    });
    assert(firstResult === null, 'findFirst({ where: { phone } }) returns null for soft-deleted patient');

    // TEST 4: findMany excludes soft-deleted
    const manyResult = await prisma.patient.findMany({
      where: { uhid: { in: [testUhidActive, testUhidDeleted] } },
    });
    assert(
      manyResult.length === 1 && manyResult[0].uhid === testUhidActive,
      'findMany excludes soft-deleted records'
    );

    // TEST 5: count excludes soft-deleted
    const countResult = await prisma.patient.count({
      where: { uhid: { in: [testUhidActive, testUhidDeleted] } },
    });
    assert(countResult === 1, 'count excludes soft-deleted records');

    // TEST 6: aggregate excludes soft-deleted
    const aggResult = await prisma.patient.aggregate({
      _count: { id: true },
      where: { uhid: { in: [testUhidActive, testUhidDeleted] } },
    });
    assert(aggResult._count.id === 1, 'aggregate excludes soft-deleted records');

    // TEST 7: Relation includes (visit -> patient)
    const visitWithPatient = await prisma.visit.findUnique({
      where: { id: deletedVisit.id },
      include: { patient: true },
    });
    assert(
      visitWithPatient?.patient === null,
      'visit.findUnique with include: { patient: true } returns null for soft-deleted patient'
    );

    const activeVisitWithPatient = await prisma.visit.findUnique({
      where: { id: activeVisit.id },
      include: { patient: true },
    });
    assert(
      activeVisitWithPatient?.patient !== null && activeVisitWithPatient?.patient?.id === activePatient.id,
      'visit.findUnique with include: { patient: true } returns active patient data'
    );

  } finally {
    // Cleanup test records
    await prisma.visit.deleteMany({
      where: { id: { in: [activeVisit.id, deletedVisit.id] } },
    });
    await (prisma as any).$primary?.patient?.deleteMany?.({
      where: { id: { in: [activePatient.id, deletedPatient.id] } },
    }).catch(async () => {
      // Direct raw query cleanup to ensure soft-deleted test row is also deleted from db
      await prisma.$executeRawUnsafe(
        `DELETE FROM patients WHERE id IN ('${activePatient.id}', '${deletedPatient.id}')`
      );
    });
  }

  console.log(`\n📊 Soft-Delete Test Summary: ${testsPassed}/${totalTests} tests passed.`);
  if (testsPassed === totalTests) {
    console.log('🎉 Soft-Delete Prisma Extension Verified Successfully!');
  } else {
    throw new Error('Some soft-delete tests failed.');
  }
}

runSoftDeleteTests()
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
