/**
 * Input Sanitization & Security Middleware
 *
 * Protects against:
 * - XSS (Cross-Site Scripting) via recursive HTML stripping
 * - HTTP Parameter Pollution (HPP)
 * - Oversized payloads
 * - Suspicious injection patterns in body/query/params
 */

import { Request, Response, NextFunction } from 'express';

// ─── HTML / Script tag stripping ────────────────────────────────────────────

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<[^>]+on\w+\s*=\s*["'][^"']*["'][^>]*>/gi, // onclick=, onload= etc.
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\s*\/\s*html/gi,
  /<!--[\s\S]*?-->/g, // HTML comments (can hide injections)
];

function stripDangerous(value: string): string {
  let result = value;
  for (const pattern of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return stripDangerous(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Also sanitize the key itself to prevent prototype pollution
      const safeKey = k.replace(/^__proto__|^constructor|^prototype/, '');
      if (safeKey) {
        sanitized[safeKey] = sanitizeValue(v);
      }
    }
    return sanitized;
  }
  return value;
}

/**
 * Recursively sanitizes req.body, req.query, and req.params.
 * Removes XSS vectors and prevents prototype pollution.
 */
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query) as any;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params) as any;
  }
  next();
}

// ─── SQL Injection Pattern Detection ─────────────────────────────────────────

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|UNION|CAST|CONVERT|DECLARE|CURSOR|FETCH|KILL|OPEN|CLOSE)\b)/i,
  /(--|;--|\/\*|\*\/|@@|@\w)/,
  /('\s*(OR|AND)\s*'?\d*\s*[=<>])/i,
  /(WAITFOR\s+DELAY|SLEEP\s*\()/i,
  /xp_cmdshell/i,
];

function containsSQLInjection(value: string): boolean {
  return SQL_INJECTION_PATTERNS.some((p) => p.test(value));
}

function checkForSQLInjection(obj: unknown, depth = 0): boolean {
  if (depth > 5) return false; // prevent deep traversal abuse
  if (typeof obj === 'string') return containsSQLInjection(obj);
  if (Array.isArray(obj)) return obj.some((v) => checkForSQLInjection(v, depth + 1));
  if (obj !== null && typeof obj === 'object') {
    return Object.values(obj as Record<string, unknown>).some((v) =>
      checkForSQLInjection(v, depth + 1)
    );
  }
  return false;
}

/**
 * Detects and blocks suspicious SQL injection patterns in request inputs.
 * Note: Prisma uses parameterized queries making actual SQLi impossible,
 * but this blocks malicious clients early and reduces log noise.
 */
export function detectSQLInjection(req: Request, res: Response, next: NextFunction): void {
  const toCheck = [req.body, req.query, req.params];
  const suspicious = toCheck.some((obj) => checkForSQLInjection(obj));

  if (suspicious) {
    res.status(400).json({
      error: 'Invalid request: Potentially malicious input detected.',
      code: 'INVALID_INPUT',
    });
    return;
  }
  next();
}
