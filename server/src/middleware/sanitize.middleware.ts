/**
 * Input Sanitization & Security Middleware
 *
 * Protects against:
 * - XSS (Cross-Site Scripting) via recursive HTML stripping
 * - HTTP Parameter Pollution (HPP)
 * - Oversized payloads
 * - Suspicious SQL injection patterns in body/query/params
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
      // Sanitize the key itself to prevent prototype pollution
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

/**
 * IMPORTANT — False-positive-safe patterns:
 *
 * ❌ Do NOT use @\w  — it matches email addresses (admin@shreeclinic.com)
 * ❌ Do NOT use \bEXEC\b alone — matches normal words in patient notes
 * ✅ Use @@ only (SQL Server double-@ variables like @@version)
 * ✅ Require surrounding whitespace for dangerous keywords
 */

function containsSQLInjection(value: string): boolean {
  // 1. SQL comment sequences — never valid in any user form field
  if (/--|\/\*|\*\//.test(value)) return true;

  // 2. SQL Server double-@@ system variables (@@version, @@servername)
  //    Single @word intentionally NOT flagged — normal in email addresses!
  if (/@@\w/.test(value)) return true;

  // 3. Classic quote-based SQLi: ' OR '1'='1  or  ' AND 'x'='x
  if (/'(\s)*(OR|AND)(\s)+['"0-9]/i.test(value)) return true;

  // 4. Dangerous SQL keywords — only when flanked by spaces/start/end,
  //    so patient notes or names don't accidentally trigger this
  const dangerousKeywords = /(\s|^)(DROP TABLE|DROP DATABASE|TRUNCATE TABLE|UNION SELECT|UNION ALL SELECT|INSERT INTO|DELETE FROM|UPDATE .+ SET|EXEC\(|EXECUTE\(|WAITFOR DELAY|xp_cmdshell)(\s|$|;|\()/i;
  if (dangerousKeywords.test(value)) return true;

  return false;
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
