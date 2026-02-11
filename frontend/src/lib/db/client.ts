import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  });

// Cache singleton in ALL environments.
// Production standalone server is long-lived (not serverless),
// so reusing the client avoids connection churn with Neon.
globalForPrisma.prisma = prisma;
