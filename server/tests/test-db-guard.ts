import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Enforces that test suites NEVER touch or mutate the main/production database.
 * Requires TEST_DATABASE_URL to be explicitly configured and distinct from DATABASE_URL.
 * Refuses to run if DATABASE_URL or NODE_ENV points to production.
 */
export function assertTestDatabaseSafety(): void {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  const mainDbUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    console.error('\n🚨 SAFETY ABORT: Tests are strictly prohibited from running with NODE_ENV=production.');
    throw new Error('Tests cannot run in production environment');
  }

  if (!testDbUrl || testDbUrl.trim() === '') {
    console.error('\n🚨 SAFETY ABORT: TEST_DATABASE_URL is not defined in server/.env.');
    console.error('Tests are prohibited from running against the main database.');
    console.error('Please configure a dedicated Neon test branch URL as TEST_DATABASE_URL in server/.env.\n');
    throw new Error('TEST_DATABASE_URL required');
  }

  if (testDbUrl.trim() === mainDbUrl?.trim()) {
    console.error('\n🚨 SAFETY ABORT: TEST_DATABASE_URL is identical to DATABASE_URL.');
    console.error('Tests must run against a distinct Neon branch or test database to protect clinic records.\n');
    throw new Error('TEST_DATABASE_URL cannot match DATABASE_URL');
  }

  // Refuse if DATABASE_URL or TEST_DATABASE_URL has production indicator
  if (mainDbUrl && (mainDbUrl.includes('prod') || mainDbUrl.includes('production'))) {
    console.error('\n🚨 SAFETY ABORT: DATABASE_URL appears to point to production.');
    throw new Error('DATABASE_URL points to production');
  }
}

export function getTestPrisma(): PrismaClient {
  assertTestDatabaseSafety();
  const testDbUrl = process.env.TEST_DATABASE_URL!;

  const baseTestPrisma = new PrismaClient({
    datasources: {
      db: {
        url: testDbUrl,
      },
    },
    log: ['error'],
  });

  // Apply soft-delete extension
  return baseTestPrisma.$extends({
    query: {
      patient: {
        async findUnique({ args }) {
          const queryArgs: any = {
            ...args,
            where: {
              ...args.where,
              isDeleted: false,
            },
          };
          return baseTestPrisma.patient.findFirst(queryArgs);
        },
        async findUniqueOrThrow({ args }) {
          const queryArgs: any = {
            ...args,
            where: {
              ...args.where,
              isDeleted: false,
            },
          };
          return baseTestPrisma.patient.findFirstOrThrow(queryArgs);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
        async findFirstOrThrow({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
        async findMany({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
        async aggregate({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
        async groupBy({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args as any);
        },
      },
      visit: {
        async findMany({ args, query }) {
          const results = await query(args);
          return results.map((v: any) => {
            if (v && v.patient && v.patient.isDeleted) {
              v.patient = null;
            }
            return v;
          });
        },
        async findFirst({ args, query }) {
          const result: any = await query(args);
          if (result && result.patient && result.patient.isDeleted) {
            result.patient = null;
          }
          return result;
        },
        async findUnique({ args, query }) {
          const result: any = await query(args);
          if (result && result.patient && result.patient.isDeleted) {
            result.patient = null;
          }
          return result;
        },
      },
    },
  }) as any;
}
