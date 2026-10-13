import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export class ConsentError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message = 'Active patient consent is legally required under DPDP Act 2023. Patient consent has been withdrawn. New clinical records cannot be created until consent is renewed.',
    code = 'CONSENT_WITHDRAWN'
  ) {
    super(message);
    this.name = 'ConsentError';
    this.statusCode = 403;
    this.code = code;
  }
}

/**
 * Shared DPDP Act 2023 Enforcement Helper:
 * Every clinical module (Visits, Audiology, Hearing Aids, Therapy Plans/Sessions)
 * MUST call this helper before creating any clinical record for a patient.
 *
 * @throws ConsentError (HTTP 403 Forbidden) if patient consent is missing, withdrawn, or false.
 */
export async function requireActiveConsent(
  patientId: string,
  tx?: Prisma.TransactionClient | PrismaClient
): Promise<void> {
  const db = tx || prisma;

  const latestConsent = await db.consentRecord.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestConsent || !latestConsent.consentGiven || latestConsent.withdrawn) {
    throw new ConsentError();
  }
}
