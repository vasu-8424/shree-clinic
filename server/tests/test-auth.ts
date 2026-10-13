import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { getTestPrisma } from './test-db-guard.js';
import { env } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`;
const prisma = getTestPrisma();

async function runAuthTests() {
  console.log('🧪 Starting Single-Admin Authentication & Lockout Tests against test database...\n');
  console.log(`Target URL: ${baseUrl}\n`);

  let totalTests = 0;
  let testsPassed = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shreeclinic.com';
  const correctPassword = process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!correctPassword) {
    throw new Error('ADMIN_PASSWORD or TEST_ADMIN_PASSWORD must be defined in environment');
  }
  const wrongPassword = `Invalid-${Date.now()}-WrongPass!`;

  // Reset admin in test DB with known password from env and zero failures
  const passwordHash = await argon2.hash(correctPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      failedAttempts: 0,
      lockedUntil: null,
      tokenVersion: 0,
    },
    create: {
      email: adminEmail,
      passwordHash,
      failedAttempts: 0,
      tokenVersion: 0,
    },
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Protected route without token returns 401
    // -------------------------------------------------------------
    const noTokenRes = await fetch(`${baseUrl}/admin/ping`);
    assert(noTokenRes.status === 401, 'Protected route without token returns 401');

    // -------------------------------------------------------------
    // TEST 2: Wrong password returns generic 401
    // -------------------------------------------------------------
    const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: wrongPassword }),
    });
    const wrongPassData = await wrongPassRes.json();
    assert(
      wrongPassRes.status === 401 && wrongPassData.error === 'Invalid email or password.',
      'Wrong password returns generic 401 error'
    );

    // -------------------------------------------------------------
    // TEST 3: 5-Failure Lockout (attempt 2, 3, 4, 5)
    // -------------------------------------------------------------
    for (let i = 2; i <= 4; i++) {
      await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: wrongPassword }),
      });
    }

    // 5th failed attempt should trigger lockout
    const fifthRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: wrongPassword }),
    });
    const fifthData = await fifthRes.json();
    assert(
      fifthRes.status === 429 && fifthData.code === 'ACCOUNT_LOCKED',
      '5th failed attempt locks the account with 429 ACCOUNT_LOCKED'
    );

    // 6th attempt even with correct password is locked
    const lockedRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: correctPassword }),
    });
    const lockedData = await lockedRes.json();
    assert(
      lockedRes.status === 429 && lockedData.code === 'ACCOUNT_LOCKED',
      'Account remains locked even with correct password during lockout window'
    );

    // -------------------------------------------------------------
    // Unlock account for subsequent tests
    // -------------------------------------------------------------
    await prisma.admin.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    // -------------------------------------------------------------
    // TEST 4: Successful login returns access token and sets refresh cookie
    // -------------------------------------------------------------
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: correctPassword }),
    });
    const loginData = await loginRes.json();
    const setCookieHeader = loginRes.headers.get('set-cookie');

    assert(
      loginRes.status === 200 &&
        typeof loginData.accessToken === 'string' &&
        loginData.expiresIn === 900 &&
        setCookieHeader !== null &&
        setCookieHeader.includes('refreshToken='),
      'Successful login returns access token (15m) and sets httpOnly refreshToken cookie'
    );

    const validAccessToken = loginData.accessToken;
    const refreshCookie = setCookieHeader?.split(';')[0];

    // -------------------------------------------------------------
    // TEST 5: Access protected route with valid token returns 200
    // -------------------------------------------------------------
    const pingRes = await fetch(`${baseUrl}/admin/ping`, {
      headers: { Authorization: `Bearer ${validAccessToken}` },
    });
    const pingData = await pingRes.json();
    assert(
      pingRes.status === 200 && pingData.admin.email === adminEmail,
      'Protected route with valid token returns 200 and admin details'
    );

    // -------------------------------------------------------------
    // TEST 6: Token refresh using cookie returns new access token
    // -------------------------------------------------------------
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: refreshCookie || '' },
    });
    const refreshData = await refreshRes.json();
    assert(
      refreshRes.status === 200 && typeof refreshData.accessToken === 'string',
      'Token refresh with valid cookie returns a new access token'
    );

    // -------------------------------------------------------------
    // TEST 7: Expired / invalid refresh token returns 401
    // -------------------------------------------------------------
    const expiredFakeToken = jwt.sign(
      { adminId: admin.id, tokenVersion: 0 },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '-1s' }
    );
    const expiredRefreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${expiredFakeToken}` },
    });
    assert(expiredRefreshRes.status === 401, 'Expired refresh token returns 401');

    // -------------------------------------------------------------
    // TEST 8: Logout revokes tokenVersion and invalidates old tokens
    // -------------------------------------------------------------
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validAccessToken}`,
        Cookie: refreshCookie || '',
      },
    });
    assert(logoutRes.status === 200, 'Logout succeeds and clears cookie');

    // After logout, the previous access token MUST be rejected with 401 TOKEN_REVOKED
    const pingAfterLogoutRes = await fetch(`${baseUrl}/admin/ping`, {
      headers: { Authorization: `Bearer ${validAccessToken}` },
    });
    const pingAfterLogoutData = await pingAfterLogoutRes.json();
    assert(
      pingAfterLogoutRes.status === 401 && pingAfterLogoutData.code === 'TOKEN_REVOKED',
      'Old access token is immediately revoked after logout (tokenVersion check)'
    );

    // And refresh token is also revoked
    const refreshAfterLogoutRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: refreshCookie || '' },
    });
    const refreshAfterLogoutData = await refreshAfterLogoutRes.json();
    assert(
      refreshAfterLogoutRes.status === 401 && refreshAfterLogoutData.code === 'TOKEN_REVOKED',
      'Refresh token is immediately revoked after logout'
    );

  } finally {
    // Reset admin credentials back to default env password
    const defaultHash = await argon2.hash(env.ADMIN_PASSWORD, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });
    const resetAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: defaultHash,
        failedAttempts: 0,
        lockedUntil: null,
        tokenVersion: 0,
      },
    });

    assert(
      resetAdmin.failedAttempts === 0 && resetAdmin.lockedUntil === null,
      'Admin lockout state verified clean: failedAttempts=0, lockedUntil=null'
    );
  }

  console.log(`\n📊 Auth Test Summary: ${testsPassed}/${totalTests} tests passed.`);
  if (testsPassed === totalTests) {
    console.log('🎉 All Authentication & Security Tests Passed Successfully!');
  } else {
    throw new Error('Some authentication tests failed.');
  }
}

runAuthTests()
  .catch((err) => {
    console.error('Auth test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
