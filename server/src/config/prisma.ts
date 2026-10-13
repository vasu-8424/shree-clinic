import { PrismaClient } from '@prisma/client';

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Extended Prisma Client:
 * Automatically excludes soft-deleted patients (isDeleted: true) on:
 * - findUnique (converted to findFirst with isDeleted: false)
 * - findUniqueOrThrow
 * - findFirst
 * - findFirstOrThrow
 * - findMany
 * - count
 * - aggregate
 * - groupBy
 *
 * For relation includes (e.g. visit.findMany({ include: { patient: true } })),
 * we also intercept visit queries so soft-deleted patients are nullified.
 */
export const prisma = basePrisma.$extends({
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
        return basePrisma.patient.findFirst(queryArgs);
      },
      async findUniqueOrThrow({ args }) {
        const queryArgs: any = {
          ...args,
          where: {
            ...args.where,
            isDeleted: false,
          },
        };
        return basePrisma.patient.findFirstOrThrow(queryArgs);
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
      // When querying visits, ensure included patient is null if soft-deleted
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
});

export type ExtendedPrismaClient = typeof prisma;
