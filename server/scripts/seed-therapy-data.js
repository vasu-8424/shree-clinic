import { PrismaClient, DepartmentType } from '@prisma/client';
import { encryptField } from '../dist/utils/crypto.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'clinical_pdfs');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function createDummyPdf(filename, title) {
  const filePath = path.join(UPLOADS_DIR, filename);
  const content = `%PDF-1.4\n%SHREE MULTIDISCIPLINARY CLINIC\n%Report: ${title}\n%Freedom Hospitals, Mokila, Hyderabad\n%%EOF`;
  fs.writeFileSync(filePath, content);
  return `/uploads/clinical_pdfs/${filename}`;
}

async function seedTherapyData() {
  console.log('Seeding Speech Therapy & Physiotherapy comprehensive cases...');

  // 1. Speech Therapy Patient 1: Master Aarav Sharma (Pediatric Speech Delay)
  let aarav = await prisma.patient.findFirst({
    where: { fullName: { contains: 'Aarav Sharma', mode: 'insensitive' } },
  });
  if (!aarav) {
    aarav = await prisma.patient.create({
      data: {
        uhid: 'SHREE-2026-0006',
        fullName: 'Master Aarav Sharma',
        phone: '+919876543220',
        age: 4,
        gender: 'Male',
        address: 'Villa 12, Subishi Town Center, Mokila, Hyderabad',
        chiefComplaint: 'Speech and language delay, vocabulary limited to 15 single words, articulation errors with /k/, /g/, /r/ sounds.',
        caseHistory: encryptField('Full term normal delivery, milestones delayed. Hearing evaluation normal bilateral. No neurological deficit. Diagnosis: Receptive-Expressive Language Disorder with Phonological Delay.'),
      },
    });
    console.log('✅ Created patient: Master Aarav Sharma');
  }

  // Plan for Aarav
  let aaravPlan = await prisma.therapyPlan.findFirst({
    where: { patientId: aarav.id, department: DepartmentType.SPEECH_THERAPY },
  });
  if (!aaravPlan) {
    aaravPlan = await prisma.therapyPlan.create({
      data: {
        patientId: aarav.id,
        department: DepartmentType.SPEECH_THERAPY,
        title: 'Pediatric Language Stimulation & Articulation Program (12 Sessions)',
        goals: 'Expand expressive vocabulary to 100+ words, produce 2-word grammatically appropriate phrases, eliminate phonological fronting of velar sounds /k/ and /g/.',
        homeProgram: 'Daily 15-minute picture card naming, prompt-based communicative requesting during playtime.',
        startDate: new Date('2026-10-01'),
        targetDate: new Date('2026-11-15'),
        isActive: true,
      },
    });
  }

  // 4 Sessions for Aarav
  const aaravSessions = [
    {
      sessionNumber: 1,
      date: new Date('2026-10-02T10:00:00Z'),
      s: 'Mother reports child gets frustrated when unable to express needs, gestures frequently.',
      o: 'Baseline Assessment: Receptive age ~3.2 yrs, Expressive age ~2.1 yrs. Velar sounds /k/ and /g/ substituted with /t/ and /d/.',
      a: 'Moderate expressive language delay with phonological process of fronting.',
      p: 'Focus on oral-motor stimulation, tactile phonetic cueing for tongue retraction.',
      vitalstim: false,
      home: 'Blow bubbles and oral muscle stimulation.',
    },
    {
      sessionNumber: 2,
      date: new Date('2026-10-06T10:00:00Z'),
      s: 'Child was more cooperative today; attempted saying "car" with tactile cue.',
      o: 'Velar /k/ produced in isolation with 60% accuracy using mirror visual biofeedback.',
      a: 'Positive response to tactile cueing; child imitating oral motor movements accurately.',
      p: 'Introduce /k/ in initial word positions (cup, car, cat).',
      vitalstim: false,
      home: 'Practice "c-c-cat" picture flashcards 2x daily.',
    },
    {
      sessionNumber: 3,
      date: new Date('2026-10-10T10:00:00Z'),
      s: 'Parents observed 5 new spontaneous words used at home during meal times.',
      o: 'Produced /k/ in CVC monosyllabic words with 75% accuracy; 2-word phrase combinations ("more milk", "go car") elicited.',
      a: 'Rapid progress in vocabulary expansion; phonological fronting decreasing.',
      p: 'Begin targeting velar /g/ sounds and expressive multi-word syntactic frames.',
      vitalstim: true,
      home: 'Interactive storytelling with targeted phrase repetitions.',
    },
    {
      sessionNumber: 4,
      date: new Date('2026-10-15T10:00:00Z'),
      s: 'Mother excited that preschool teacher reported child is speaking in short sentences with peers.',
      o: 'Vocabulary expanded to ~65 words. Intelligibility in familiar context reached 75%.',
      a: 'Excellent milestone achievement; ready for conversational pragmatic training.',
      p: 'Advance to Session 5: Social communication dialogues and complex consonant blends.',
      vitalstim: true,
      home: 'Preschool peer interaction practice and bedtime storytelling.',
    },
  ];

  for (const s of aaravSessions) {
    const exists = await prisma.therapySession.findFirst({
      where: { patientId: aarav.id, sessionNumber: s.sessionNumber, department: DepartmentType.SPEECH_THERAPY },
    });
    if (!exists) {
      await prisma.therapySession.create({
        data: {
          patientId: aarav.id,
          planId: aaravPlan.id,
          department: DepartmentType.SPEECH_THERAPY,
          sessionNumber: s.sessionNumber,
          sessionDate: s.date,
          subjective: encryptField(s.s),
          objective: encryptField(s.o),
          assessment: s.a,
          planNext: s.p,
          vitalstimUsed: s.vitalstim,
          homeProgramAssigned: s.home,
        },
      });
    }
  }

  // Store PDF for Aarav
  const aaravPdfKey = createDummyPdf('Aarav_Sharma_Speech_Evaluation_Report.pdf', 'Pediatric Speech & Language Diagnostic Assessment');
  const existingAaravPdf = await prisma.attachment.findFirst({ where: { patientId: aarav.id } });
  if (!existingAaravPdf) {
    await prisma.attachment.create({
      data: {
        patientId: aarav.id,
        fileName: 'Aarav_Sharma_Speech_Evaluation_Report.pdf',
        fileKey: aaravPdfKey,
        fileType: 'application/pdf',
        fileSize: 345000,
        category: 'Speech Therapy Assessment PDF',
      },
    });
    console.log('✅ Stored PDF report for Aarav');
  }

  // 2. Physiotherapy Patient 1: Mr. Rajesh Varma (Cervical Radiculopathy & Trapezius Spasm)
  let rajesh = await prisma.patient.findFirst({
    where: { fullName: { contains: 'Rajesh Varma', mode: 'insensitive' } },
  });
  if (!rajesh) {
    rajesh = await prisma.patient.create({
      data: {
        uhid: 'SHREE-2026-0007',
        fullName: 'Rajesh Varma',
        phone: '+919876543221',
        age: 46,
        gender: 'Male',
        address: 'Tower 4, My Home Bhooja, Hitec City, Hyderabad',
        chiefComplaint: 'Severe neck stiffness, radiating pain to right shoulder and arm, tingling in right index finger for past 3 weeks. Desk job 10+ hours daily.',
        caseHistory: encryptField('MRI Cervical Spine indicates C5-C6 disc bulge with right neural foraminal narrowing. Spurling test positive. Pain Visual Analog Scale (VAS): 8/10 on presentation.'),
      },
    });
    console.log('✅ Created patient: Rajesh Varma');
  }

  // Plan for Rajesh
  let rajeshPlan = await prisma.therapyPlan.findFirst({
    where: { patientId: rajesh.id, department: DepartmentType.PHYSIOTHERAPY },
  });
  if (!rajeshPlan) {
    rajeshPlan = await prisma.therapyPlan.create({
      data: {
        patientId: rajesh.id,
        department: DepartmentType.PHYSIOTHERAPY,
        title: 'Cervical Spine Decompression & Postural Ergonomic Rehabilitation (10 Sessions)',
        goals: 'Reduce neck pain from VAS 8/10 to < 2/10, eliminate right arm radicular paresthesia, restore cervical active range of motion to 75° bilateral rotation, strengthen deep neck flexors.',
        homeProgram: 'Chin tucks 10 reps x 3 sets, upper trapezius stretches, ergonomic lumbar roll while working.',
        startDate: new Date('2026-10-05'),
        targetDate: new Date('2026-10-30'),
        isActive: true,
      },
    });
  }

  // 5 Physio Sessions for Rajesh
  const rajeshSessions = [
    {
      sessionNumber: 1,
      date: new Date('2026-10-06T14:30:00Z'),
      s: 'Patient reports constant aching neck pain VAS 8/10, unable to turn head while driving.',
      o: 'Cervical ROM: Right rotation 30° (severely restricted), Extension 15° with pain. Palpable spasm in right upper trapezius and levator scapulae.',
      a: 'Acute C5-C6 radiculopathy with secondary myofascial spasm.',
      p: 'Administered intermittent cervical traction (8 kg), therapeutic ultrasound (1 MHz, 1.2 W/cm² pulsed), gentle isometric stabilization.',
      vitalstim: true,
      home: 'Cryotherapy 15 mins 3x/day, strict ergonomic posture adherence.',
    },
    {
      sessionNumber: 2,
      date: new Date('2026-10-08T14:30:00Z'),
      s: 'Pain reduced to VAS 6/10; radicular shooting pain into arm has centralized to shoulder only.',
      o: 'Right rotation improved to 45°. Muscle guarding reduced by 40%.',
      a: 'Good centralisation phenomenon observed, responding well to traction.',
      p: 'Cervical traction increased to 9 kg + TENS therapy + deep neck flexor activation.',
      vitalstim: true,
      home: 'Begin gentle active chin tucks in supine position.',
    },
    {
      sessionNumber: 3,
      date: new Date('2026-10-11T14:30:00Z'),
      s: 'Tingling sensation in index finger has completely resolved. Morning stiffness reduced.',
      o: 'Right rotation 60°, Extension 30°. Deep neck flexor endurance test: 18 seconds.',
      a: 'Paresthesia resolved; moving from acute pain relief phase to functional strengthening.',
      p: 'Theraband scapular retractions + thoracic spine mobility extensions.',
      vitalstim: false,
      home: 'Thoracic foam roller extensions, wall angels.',
    },
    {
      sessionNumber: 4,
      date: new Date('2026-10-14T14:30:00Z'),
      s: 'Pain down to VAS 3/10. Able to drive and work on computer without severe discomfort.',
      o: 'Right rotation 70° (almost full symmetry), Spurling test negative. Muscle power 5/5.',
      a: 'Substantial structural recovery; 70% of rehab goals achieved.',
      p: 'Progressive resistance training with yellow theraband + dynamic neck stabilization.',
      vitalstim: false,
      home: 'Maintain home exercises and posture breaks every 45 mins.',
    },
    {
      sessionNumber: 5,
      date: new Date('2026-10-18T14:30:00Z'),
      s: 'Patient reports VAS 1-2/10 only at end of long work days. Zero radiating pain.',
      o: 'Full active cervical ROM painless (Rotation 75° bilateral, Flexion 50°, Extension 45°).',
      a: 'Excellent functional recovery; preparing for discharge and maintenance phase.',
      p: 'Finalize core cervical posture home maintenance protocol. Review in 3 weeks.',
      vitalstim: false,
      home: 'Lifelong ergonomic desk setup and weekly theraband routine.',
    },
  ];

  for (const s of rajeshSessions) {
    const exists = await prisma.therapySession.findFirst({
      where: { patientId: rajesh.id, sessionNumber: s.sessionNumber, department: DepartmentType.PHYSIOTHERAPY },
    });
    if (!exists) {
      await prisma.therapySession.create({
        data: {
          patientId: rajesh.id,
          planId: rajeshPlan.id,
          department: DepartmentType.PHYSIOTHERAPY,
          sessionNumber: s.sessionNumber,
          sessionDate: s.date,
          subjective: encryptField(s.s),
          objective: encryptField(s.o),
          assessment: s.a,
          planNext: s.p,
          vitalstimUsed: s.vitalstim,
          homeProgramAssigned: s.home,
        },
      });
    }
  }

  // Store PDF for Rajesh
  const rajeshPdfKey = createDummyPdf('Rajesh_Varma_Physiotherapy_Clinical_Assessment.pdf', 'Physiotherapy Functional Range-of-Motion & Musculoskeletal Evaluation');
  const existingRajeshPdf = await prisma.attachment.findFirst({ where: { patientId: rajesh.id } });
  if (!existingRajeshPdf) {
    await prisma.attachment.create({
      data: {
        patientId: rajesh.id,
        fileName: 'Rajesh_Varma_Physiotherapy_Clinical_Assessment.pdf',
        fileKey: rajeshPdfKey,
        fileType: 'application/pdf',
        fileSize: 412000,
        category: 'Physiotherapy Assessment PDF',
      },
    });
    console.log('✅ Stored PDF report for Rajesh Varma');
  }

  console.log('🎉 Therapy sample data seeded successfully!');
  await prisma.$disconnect();
}

seedTherapyData().catch((err) => {
  console.error('Seeding error:', err);
  prisma.$disconnect();
});
