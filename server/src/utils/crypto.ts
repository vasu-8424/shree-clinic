import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

// Converts 64-char hex string to 32-byte Buffer
function getKey(): Buffer {
  return Buffer.from(env.DATA_ENCRYPTION_KEY, 'hex');
}

/**
 * Encrypts a string using AES-256-GCM.
 * Output format: "enc:iv_hex:authTag_hex:ciphertext_hex"
 */
export function encryptField(plainText: string | null | undefined): string | null {
  if (!plainText) return null;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Field encryption failed:', error);
    throw new Error('Encryption error');
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Returns the decrypted string or the original text if not encrypted.
 */
export function decryptField(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;

  if (!encryptedText.startsWith('enc:')) {
    // Unencrypted legacy fallback
    return encryptedText;
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 4) return encryptedText;

    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const cipherText = parts[3];

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Field decryption failed:', error);
    return '[Decryption Error]';
  }
}
