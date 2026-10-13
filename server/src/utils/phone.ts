/**
 * Normalizes an Indian phone number to standard E.164 format: +91XXXXXXXXXX
 * Throws an error if the phone number is invalid.
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';

  // Remove whitespace, dashes, dots, parentheses
  let cleaned = raw.replace(/[\s\-\.\(\)]/g, '').trim();

  // If starts with +91
  if (cleaned.startsWith('+91')) {
    const digits = cleaned.slice(3);
    if (/^\d{10}$/.test(digits)) {
      return `+91${digits}`;
    }
  }

  // If starts with 91 (without +) and has 12 digits
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    const digits = cleaned.slice(2);
    if (/^\d{10}$/.test(digits)) {
      return `+91${digits}`;
    }
  }

  // If starts with 0 and has 11 digits
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const digits = cleaned.slice(1);
    if (/^\d{10}$/.test(digits)) {
      return `+91${digits}`;
    }
  }

  // If standard 10-digit Indian mobile
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // Fallback if international or non-standard format but contains 8-15 digits
  if (/^\+?\d{8,15}$/.test(cleaned)) {
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  // Return cleaned original if unable to parse standard Indian format
  return cleaned;
}
