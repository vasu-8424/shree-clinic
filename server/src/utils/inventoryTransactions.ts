import { Prisma, InventoryStatus, TrialOutcome, EarSide } from '@prisma/client';

type TransactionClient = Prisma.TransactionClient;

/**
 * Creates a hearing aid trial and transitions device status to ON_TRIAL atomically.
 */
export async function assignHearingAidToTrial(
  tx: TransactionClient,
  params: {
    patientId: string;
    inventoryId: string;
    earSide: EarSide;
    trialStartDate: Date;
    trialEndDate: Date;
    depositAmount: number;
  }
) {
  const item = await tx.hearingAidInventory.findUnique({
    where: { id: params.inventoryId },
  });

  if (!item) throw new Error('Hearing aid unit not found');
  if (item.status !== InventoryStatus.IN_STOCK) {
    throw new Error(`Device is currently not in stock (current status: ${item.status})`);
  }

  // 1. Create Trial
  const trial = await tx.hearingAidTrial.create({
    data: {
      patientId: params.patientId,
      inventoryId: params.inventoryId,
      earSide: params.earSide,
      trialStartDate: params.trialStartDate,
      trialEndDate: params.trialEndDate,
      depositAmount: params.depositAmount,
      outcome: TrialOutcome.ONGOING,
    },
  });

  // 2. Mark Unit as ON_TRIAL
  await tx.hearingAidInventory.update({
    where: { id: params.inventoryId },
    data: { status: InventoryStatus.ON_TRIAL },
  });

  return trial;
}

/**
 * Completes or returns a trial and transitions device status back to IN_STOCK or SOLD.
 */
export async function resolveHearingAidTrial(
  tx: TransactionClient,
  params: {
    trialId: string;
    outcome: TrialOutcome;
    feedback?: string;
  }
) {
  const trial = await tx.hearingAidTrial.findUnique({
    where: { id: params.trialId },
  });

  if (!trial) throw new Error('Trial record not found');

  const updatedTrial = await tx.hearingAidTrial.update({
    where: { id: params.trialId },
    data: {
      outcome: params.outcome,
      feedback: params.feedback,
    },
  });

  // If returned, device goes back to IN_STOCK
  if (params.outcome === TrialOutcome.RETURNED) {
    await tx.hearingAidInventory.update({
      where: { id: trial.inventoryId },
      data: { status: InventoryStatus.IN_STOCK },
    });
  }

  return updatedTrial;
}

/**
 * Dispenses and sells a hearing aid unit, marking it SOLD atomically.
 */
export async function recordHearingAidSaleTransaction(
  tx: TransactionClient,
  params: {
    patientId: string;
    inventoryId: string;
    trialId?: string;
    invoiceId?: string;
    earSide: EarSide;
    salePrice: number;
    warrantyStartDate: Date;
    warrantyEndDate: Date;
    followUpReminderDate?: Date;
  }
) {
  const sale = await tx.hearingAidSale.create({
    data: {
      patientId: params.patientId,
      inventoryId: params.inventoryId,
      trialId: params.trialId,
      invoiceId: params.invoiceId,
      earSide: params.earSide,
      salePrice: params.salePrice,
      warrantyStartDate: params.warrantyStartDate,
      warrantyEndDate: params.warrantyEndDate,
      followUpReminderDate: params.followUpReminderDate,
    },
  });

  // Mark unit as SOLD
  await tx.hearingAidInventory.update({
    where: { id: params.inventoryId },
    data: { status: InventoryStatus.SOLD },
  });

  return sale;
}
