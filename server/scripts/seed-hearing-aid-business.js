import { PrismaClient, DepartmentType, EarSide, TrialOutcome, InventoryStatus, RepairStatus, InvoiceStatus } from '@prisma/client';
import { encryptField } from '../dist/utils/crypto.js';

const prisma = new PrismaClient();

async function seedBusinessData() {
  console.log('Seeding rich, realistic Hearing Aid business records...');

  // 1. Ensure Inventory Items Exist
  const devices = [
    {
      brand: 'Phonak',
      modelName: 'Audeo Lumity L90-R',
      style: 'RIC',
      serialNumber: 'PH-2026-L90-001',
      purchasePrice: 110000.0,
      mrp: 185000.0,
      status: InventoryStatus.SOLD,
    },
    {
      brand: 'Signia',
      modelName: 'Pure Charge&Go 7AX',
      style: 'RIC',
      serialNumber: 'SG-2026-7AX-882',
      purchasePrice: 95000.0,
      mrp: 165000.0,
      status: InventoryStatus.SOLD,
    },
    {
      brand: 'Widex',
      modelName: 'Moment Sheer 440',
      style: 'sRIC',
      serialNumber: 'WX-2026-MS44-109',
      purchasePrice: 115000.0,
      mrp: 195000.0,
      status: InventoryStatus.SOLD,
    },
    {
      brand: 'Oticon',
      modelName: 'Real 1 miniRITE T',
      style: 'RIC',
      serialNumber: 'OT-2026-RL1-404',
      purchasePrice: 105000.0,
      mrp: 175000.0,
      status: InventoryStatus.UNDER_REPAIR,
    },
    {
      brand: 'Phonak',
      modelName: 'Naida Paradise P70-UP',
      style: 'BTE SuperPower',
      serialNumber: 'PH-2026-NP70-911',
      purchasePrice: 75000.0,
      mrp: 125000.0,
      status: InventoryStatus.UNDER_REPAIR,
    },
    {
      brand: 'Starkey',
      modelName: 'Genesis AI 24 RT',
      style: 'RIC',
      serialNumber: 'ST-2026-GAI-330',
      purchasePrice: 120000.0,
      mrp: 210000.0,
      status: InventoryStatus.IN_STOCK,
    },
    {
      brand: 'Signia',
      modelName: 'Silk Charge&Go 5IX',
      style: 'CIC Instant-Fit',
      serialNumber: 'SG-2026-SK5-512',
      purchasePrice: 80000.0,
      mrp: 140000.0,
      status: InventoryStatus.IN_STOCK,
    },
  ];

  const invMap = {};
  for (const d of devices) {
    const existing = await prisma.hearingAidInventory.findUnique({
      where: { serialNumber: d.serialNumber },
    });
    if (!existing) {
      const created = await prisma.hearingAidInventory.create({ data: d });
      invMap[d.serialNumber] = created;
      console.log('✅ Created device:', d.brand, d.modelName);
    } else {
      const updated = await prisma.hearingAidInventory.update({
        where: { serialNumber: d.serialNumber },
        data: { status: d.status, mrp: d.mrp },
      });
      invMap[d.serialNumber] = updated;
    }
  }

  // 2. Ensure Patients Exist
  const samplePatients = [
    {
      uhid: 'SHREE-2026-0002',
      fullName: 'Kishore Reddy',
      phone: '+919876543212',
      email: 'kishore.reddy@example.com',
      age: 54,
      gender: 'Male',
      address: 'Villa 42, Subishi Town Center, Mokila, Hyderabad',
      chiefComplaint: 'Bilateral moderate sensorineural hearing loss, speech understanding difficulty in noise.',
    },
    {
      uhid: 'SHREE-2026-0003',
      fullName: 'Ramesh Chandra',
      phone: '+919876543213',
      email: 'ramesh.chandra@example.com',
      age: 62,
      gender: 'Male',
      address: 'Plot 15, Jubilee Hills Road No 36, Hyderabad',
      chiefComplaint: 'Bilateral high-frequency sloping hearing loss with tinnitus.',
    },
    {
      uhid: 'SHREE-2026-0004',
      fullName: 'Smt. Lakshmi Devi',
      phone: '+919876543214',
      email: 'lakshmi.devi@example.com',
      age: 68,
      gender: 'Female',
      address: 'Flat 302, Green Acres, Madhapur, Hyderabad',
      chiefComplaint: 'Difficulty following conversations in family gatherings and temple.',
    },
    {
      uhid: 'SHREE-2026-0005',
      fullName: 'Anand Kumar',
      phone: '+919876543215',
      email: 'anand.kumar@example.com',
      age: 48,
      gender: 'Male',
      address: 'House 88, Financial District, Gachibowli, Hyderabad',
      chiefComplaint: 'Severe mixed hearing loss, prior hearing aid user for 6 years.',
    },
  ];

  const patientMap = {};
  for (const p of samplePatients) {
    let pat = await prisma.patient.findFirst({
      where: {
        OR: [{ phone: p.phone }, { fullName: { equals: p.fullName, mode: 'insensitive' } }],
      },
    });
    if (!pat) {
      pat = await prisma.patient.create({
        data: {
          ...p,
          caseHistory: encryptField('Audiological clinical record seeded for clinic practice management.'),
        },
      });
      console.log('✅ Created patient:', p.fullName);
    }
    patientMap[p.fullName] = pat;
  }

  // 3. Seed Purchased / Dispensed Records
  const salesData = [
    {
      patient: patientMap['Kishore Reddy'],
      device: invMap['PH-2026-L90-001'],
      earSide: EarSide.BINAURAL,
      salePrice: 185000.0,
      warrantyYears: 2,
      daysAgo: 5,
    },
    {
      patient: patientMap['Ramesh Chandra'],
      device: invMap['SG-2026-7AX-882'],
      earSide: EarSide.BINAURAL,
      salePrice: 165000.0,
      warrantyYears: 4,
      daysAgo: 25,
    },
    {
      patient: patientMap['Smt. Lakshmi Devi'],
      device: invMap['OT-2026-RL1-404'],
      earSide: EarSide.RIGHT,
      salePrice: 87500.0,
      warrantyYears: 2,
      daysAgo: 60,
    },
  ];

  for (const s of salesData) {
    if (!s.patient || !s.device) continue;
    const existingSale = await prisma.hearingAidSale.findFirst({
      where: { patientId: s.patient.id, inventoryId: s.device.id },
    });
    if (!existingSale) {
      const startDate = new Date(Date.now() - s.daysAgo * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + s.warrantyYears);

      const invNumber = `SHREE-INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoice = await prisma.invoice.create({
        data: {
          patientId: s.patient.id,
          invoiceNumber: invNumber,
          subtotal: s.salePrice,
          discount: 0,
          totalAmount: s.salePrice,
          amountPaid: s.salePrice,
          balanceDue: 0,
          status: InvoiceStatus.PAID,
          notes: `Dispensed ${s.device.brand} ${s.device.modelName} (${s.earSide})`,
        },
      });

      await prisma.hearingAidSale.create({
        data: {
          patientId: s.patient.id,
          inventoryId: s.device.id,
          invoiceId: invoice.id,
          earSide: s.earSide,
          salePrice: s.salePrice,
          warrantyStartDate: startDate,
          warrantyEndDate: endDate,
          followUpReminderDate: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
      });
      console.log('✅ Created Sale for:', s.patient.fullName, s.device.modelName);
    }
  }

  // 4. Seed Service Complaints & Repairs
  const complaintsData = [
    {
      device: invMap['OT-2026-RL1-404'],
      issue: 'Right hearing aid whistling / acoustic feedback when chewing or smiling; dome fitting loose in canal',
      vendor: 'In-Clinic Service Lab',
      status: RepairStatus.IN_PROGRESS,
      repairCost: 0,
      notes: 'Cleaned microphone port, replaced with 8mm vented dome. Acoustic feedback cancellation recalibration in progress.',
    },
    {
      device: invMap['PH-2026-NP70-911'],
      issue: 'Completely dead unit, intermittent sound cut-off with moisture ingress. Red indicator flashing.',
      vendor: 'Phonak Tech Lab (Mumbai)',
      status: RepairStatus.SENT,
      repairCost: 4500,
      notes: 'Shipped via BlueDart AWB#88410291. Loaner unit provided: Phonak Bolero Marvel M50-PR.',
    },
  ];

  for (const c of complaintsData) {
    if (!c.device) continue;
    const existingRepair = await prisma.inventoryRepair.findFirst({
      where: { inventoryId: c.device.id },
    });
    if (!existingRepair) {
      await prisma.inventoryRepair.create({
        data: {
          inventoryId: c.device.id,
          issueDescription: c.issue,
          sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          vendor: c.vendor,
          status: c.status,
          repairCost: c.repairCost,
          notes: c.notes,
        },
      });
      console.log('✅ Created Repair ticket for:', c.device.modelName);
    }
  }

  // 5. Seed Fine-Tuning & Fitting Review Visit
  const kishore = patientMap['Kishore Reddy'];
  if (kishore) {
    const existingTuning = await prisma.visit.findFirst({
      where: {
        patientId: kishore.id,
        diagnosis: { contains: 'Fine-Tuning' },
      },
    });
    if (!existingTuning) {
      await prisma.visit.create({
        data: {
          patientId: kishore.id,
          visitDate: new Date('2026-10-28T11:00:00Z'),
          visitType: DepartmentType.AUDIOLOGY,
          diagnosis: 'Hearing Aid Fine-Tuning & Fitting Review (Day 7 Follow-up)',
          notes: encryptField('[Acclimatization Rating: 8.5/10]\nGain Adjustments: Boosted soft gain by +2dB at 2kHz and 4kHz in speech clarity program. AutoSense OS 5.0 noise canceller set to medium.\nPatient feedback: Very pleased with clarity during TV watching; family noticed volume is down to normal 18.'),
          plan: 'Schedule 30-day post-fitting review to check speech understanding in crowded restaurant.',
          nextAppointmentDate: new Date('2026-11-20T10:30:00Z'),
        },
      });
      console.log('✅ Added Fine-Tuning session for Kishore Reddy');
    }
  }

  console.log('🎉 Seeding completed successfully!');
  await prisma.$disconnect();
}

seedBusinessData().catch((err) => {
  console.error('Seeding error:', err);
  prisma.$disconnect();
});
