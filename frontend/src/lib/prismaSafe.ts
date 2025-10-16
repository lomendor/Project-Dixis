import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  try {
    if (!prisma) {
      prisma = new PrismaClient();
    }
    return prisma;
  } catch {
    // Prisma may not be available in all environments
    return null;
  }
}
