import { Prisma, PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

type TransactionClient = Prisma.TransactionClient;

/**
 * Returns current Indian financial year string (e.g., "26-27" if between April 2026 and March 2027).
 */
export function getCurrentFinancialYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (April is 3)

  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  const startShort = startYear.toString().slice(-2);
  const endShort = endYear.toString().slice(-2);

  return `${startShort}-${endShort}`;
}

/**
 * Atomically increments a counter key and returns the padded sequence.
 */
async function getNextSequence(tx: any, key: string): Promise<number> {
  const counter = await tx.counter.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });

  return counter.value;
}

/**
 * Generates the next Patient UHID: SHREE-YYYY-XXXX (e.g. SHREE-2026-0001)
 * Must be executed within a Prisma $transaction.
 */
export async function generateNextUHID(tx: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const key = `patient_uhid_${currentYear}`;
  const seq = await getNextSequence(tx, key);
  const paddedSeq = seq.toString().padStart(4, '0');

  return `SHREE-${currentYear}-${paddedSeq}`;
}

/**
 * Generates the next Invoice Number: {INVOICE_PREFIX}XXXX (e.g. SHREE/26-27/0001)
 * Automatically handles financial-year reset based on the current financial year.
 * Must be executed within a Prisma $transaction.
 */
export async function generateNextInvoiceNumber(tx: any): Promise<string> {
  const fy = getCurrentFinancialYear();
  const prefix = env.INVOICE_PREFIX.replace(/\d{2}-\d{2}/, fy); // Ensures prefix matches active FY
  const key = `invoice_${fy}`;
  const seq = await getNextSequence(tx, key);
  const paddedSeq = seq.toString().padStart(4, '0');

  return `${prefix}${paddedSeq}`;
}
