import { prisma } from '../config/prisma.js';

export type AuditAction =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED';

export type AuditEntity =
  | 'Patient'
  | 'Visit'
  | 'Audiogram'
  | 'TherapyPlan'
  | 'TherapySession'
  | 'HearingAid'
  | 'Trial'
  | 'Sale'
  | 'Invoice'
  | 'Payment'
  | 'Appointment'
  | 'Settings';

export interface AuditLogOptions {
  adminId?: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  // Strict DPDP: Sanitized payload containing ONLY modified field names or non-PII flags
  details?: Record<string, any>;
}

const FORBIDDEN_KEYS = new Set([
  'name',
  'fullname',
  'patientname',
  'phone',
  'mobile',
  'email',
  'address',
  'casehistory',
  'notes',
  'diagnosis',
  'chiefcomplaint',
  'subjective',
  'objective',
  'feedback',
  'password',
  'passwordhash',
  'currentpassword',
  'newpassword',
  'token',
  'refreshtoken',
  'accesstoken',
]);

/**
 * Strips any sensitive health or personal data, leaving only safe metadata & field names.
 */
function sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined;

  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      sanitized[key] = sanitizeDetails(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Creates an audit log entry in compliance with India DPDP Act 2023.
 */
export async function createAuditLog(opts: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: opts.adminId,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId || null,
        ipAddress: opts.ipAddress || null,
        userAgent: opts.userAgent || null,
        details: sanitizeDetails(opts.details) ?? {},
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
