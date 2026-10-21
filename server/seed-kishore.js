import { PrismaClient, DepartmentType, EarSide, TrialOutcome, InventoryStatus } from '@prisma/client';
import { encryptField } from './dist/utils/crypto.js';

const prisma = new PrismaClient();

async function seedKishoreReddy() {
  console.log('Seeding Kishore Reddy comprehensive hospital visits...');

  // 1. Check or find enquiry
  let enquiry = await prisma.hearingAidEnquiry.findFirst({
    where: {
      OR: [
        { name: { contains: 'Kishore', mode: 'insensitive' } },
        { phone: '+919876543212' },
      ],
    },
  });

  // 2. Check if Patient exists
  let patient = await prisma.patient.findFirst({
    where: {
      OR: [
        { fullName: { contains: 'Kishore Reddy', mode: 'insensitive' } },
        { phone: '+919876543212' },
      ],
    },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        uhid: 'SHREE-2026-0002',
        fullName: 'Kishore Reddy',
        phone: '+919876543212',
        email: 'kishore.reddy@example.com',
        age: 54,
        gender: 'Male',
        address: 'Villa 42, Subishi Town Center, Mokila, Hyderabad',
        referralSource: 'Direct Walk-in',
        chiefComplaint: 'Bilateral gradual hearing loss, difficulty understanding speech in family gatherings and meetings, TV volume high for past 2 years.',
        caseHistory: encryptField('Patient reports gradual onset of hearing loss over the past 2 years. History of working in industrial manufacturing. Mild bilateral high-frequency tinnitus present, no vertigo or otalgia. No past ear surgery. General health good, hypertensive on medication.'),
      },
    });
    console.log('✅ Created patient Kishore Reddy:', patient.id, patient.uhid);

    // Create consent record
    await prisma.consentRecord.create({
      data: {
        patientId: patient.id,
        consentVersion: '1.0',
        consentGiven: true,
        consentDate: new Date('2026-10-14T09:00:00Z'),
        ipAddress: '127.0.0.1',
        notes: 'Informed consent for diagnostic audiology, trial fitting, and clinical record keeping.',
      },
    });
  } else {
    console.log('ℹ️ Patient Kishore Reddy already exists:', patient.id);
  }

  // Link enquiry to patient
  if (enquiry) {
    await prisma.hearingAidEnquiry.update({
      where: { id: enquiry.id },
      data: {
        patientId: patient.id,
        status: 'TRIAL_SCHEDULED',
      },
    });
    console.log('✅ Linked enquiry to patient:', enquiry.id);
  }

  // 3. Ensure Phonak inventory item exists
  let inventory = await prisma.hearingAidInventory.findFirst({
    where: { brand: 'Phonak' },
  });

  if (!inventory) {
    inventory = await prisma.hearingAidInventory.create({
      data: {
        brand: 'Phonak',
        modelName: 'Audeo Lumity L90-R',
        style: 'RIC',
        serialNumber: 'PH-2026-L90-001',
        purchasePrice: 110000.0,
        mrp: 185000.0,
        status: InventoryStatus.ON_TRIAL,
      },
    });
    console.log('✅ Created Phonak inventory item:', inventory.id);
  } else {
    await prisma.hearingAidInventory.update({
      where: { id: inventory.id },
      data: { status: InventoryStatus.ON_TRIAL },
    });
  }

  // 4. Clean up any previous test visits for Kishore Reddy to make idempotent
  await prisma.visit.deleteMany({
    where: { patientId: patient.id },
  });
  await prisma.audiogram.deleteMany({
    where: { patientId: patient.id },
  });
  await prisma.hearingAidTrial.deleteMany({
    where: { patientId: patient.id },
  });

  // VISIT 1: 20 Oct 2026 - Came for test
  const visit1 = await prisma.visit.create({
    data: {
      patientId: patient.id,
      visitDate: new Date('2026-10-20T10:30:00Z'),
      visitType: DepartmentType.AUDIOLOGY,
      diagnosis: 'Bilateral Moderate Sensorineural Hearing Loss (SNHL) sloping at high frequencies',
      notes: encryptField('Patient came for diagnostic hearing evaluation. Otoscopy revealed normal bilateral canal and intact tympanic membranes. Conducted Pure Tone Audiometry (PTA) and Impedance Tympanometry. Both ears demonstrate moderate sensorineural loss above 2 kHz. Middle ear compliance normal (Type A). Patient advised to return for detailed report consultation and treatment planning.'),
      plan: 'Pure Tone Audiometry completed. Schedule report review & ENT consultation for 24 Oct 2026.',
      nextAppointmentDate: new Date('2026-10-24T00:00:00Z'),
    },
  });
  console.log('✅ Created Visit 1 (20 Oct - Diagnostic Test):', visit1.id);

  // Audiogram for Visit 1
  await prisma.audiogram.create({
    data: {
      patientId: patient.id,
      visitId: visit1.id,
      testDate: new Date('2026-10-20T00:00:00Z'),
      testType: 'Pure Tone Audiometry (PTA) & Impedance',
      frequencies: {
        right: { '250': 30, '500': 35, '1000': 40, '2000': 45, '4000': 55, '8000': 65 },
        left: { '250': 25, '500': 30, '1000': 35, '2000': 45, '4000': 50, '8000': 60 },
      },
      tympanometryLeft: 'Type A (Normal)',
      tympanometryRight: 'Type A (Normal)',
      interpretation: 'PTA Right: 46 dB HL (Moderate SNHL), PTA Left: 42 dB HL (Moderate SNHL). Speech Discrimination Score (SDS): 84% at 75 dB. Suitable candidate for bilateral digital hearing aid amplification with directional microphones.',
    },
  });

  // VISIT 2: 24 Oct 2026 - Came for reports
  const visit2 = await prisma.visit.create({
    data: {
      patientId: patient.id,
      visitDate: new Date('2026-10-24T11:15:00Z'),
      visitType: DepartmentType.AUDIOLOGY,
      diagnosis: 'Confirmed Bilateral SNHL - Cleared for Hearing Aid Amplification',
      notes: encryptField('Patient arrived for comprehensive audiology report review with family. Diagnostic PTA and tympanometry test results thoroughly explained. Patient counseled regarding bilateral sensorineural loss impact on speech discrimination in noise. Discussed amplification options. Patient selected premium rechargeable RIC hearing aid (Phonak Lumity). Medical clearance confirmed. Booked trial fitting session for 26 Oct 2026.'),
      plan: 'Initiate 7-day home evaluation trial with Phonak Audeo Lumity L90-R binaural units on 26 Oct 2026.',
      nextAppointmentDate: new Date('2026-10-26T00:00:00Z'),
    },
  });
  console.log('✅ Created Visit 2 (24 Oct - Report Review):', visit2.id);

  // VISIT 3: 26 Oct 2026 - Came for hearing aid trial
  const visit3 = await prisma.visit.create({
    data: {
      patientId: patient.id,
      visitDate: new Date('2026-10-26T14:00:00Z'),
      visitType: DepartmentType.AUDIOLOGY,
      diagnosis: 'Hearing Aid Trial Fitting & Real-Ear Verification (REM)',
      notes: encryptField('Patient visited for bilateral hearing aid trial fitting. Programmed Phonak Audeo Lumity L90-R rechargeable RIC hearing aids using Target 8.0 with NAL-NL2 fitting formula. Performed Real-Ear Measurement (REM) verification. Patient reported clear speech, natural environmental sounds, and excellent clarity in the clinic corridor and waiting area. Paired with patient smartphone (myPhonak app) and demonstrated volume and program controls. Security deposit of ₹15,000 received. Initiated 7-day home evaluation trial.'),
      plan: '7-Day home evaluation trial in progress. Mid-trial check-in phone call on 29 Oct. Follow-up clinic review on 02 Nov 2026 for final dispensing decision.',
      nextAppointmentDate: new Date('2026-11-02T00:00:00Z'),
    },
  });
  console.log('✅ Created Visit 3 (26 Oct - Hearing Aid Trial):', visit3.id);

  // Create Hearing Aid Trial Record
  const trial = await prisma.hearingAidTrial.create({
    data: {
      patientId: patient.id,
      inventoryId: inventory.id,
      earSide: EarSide.BINAURAL,
      trialStartDate: new Date('2026-10-26T00:00:00Z'),
      trialEndDate: new Date('2026-11-02T00:00:00Z'),
      depositAmount: 15000.0,
      feedback: 'Patient very satisfied with initial speech clarity and background noise suppression during in-clinic trial fitting. Smartphone app connected.',
      outcome: TrialOutcome.ONGOING,
    },
  });
  console.log('✅ Created Hearing Aid Trial Record:', trial.id);

  console.log('🎉 Successfully seeded Kishore Reddy with 20 Oct, 24 Oct, and 26 Oct hospital visits!');
}

seedKishoreReddy()
  .catch((e) => {
    console.error('Error seeding Kishore Reddy:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
