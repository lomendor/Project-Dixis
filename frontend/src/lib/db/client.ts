import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Append Neon-friendly pool params to DATABASE_URL when missing.
 *
 * Neon serverless endpoints benefit from:
 *  - connection_limit=5  — keep pool small (PM2 is a single long-lived process)
 *  - pool_timeout=10     — don't wait forever when Neon is waking up
 *  - connect_timeout=15  — allow up to 15s for cold-start wake-up
 *
 * These are safe no-ops if the URL already contains them or if the
 * provider is not Neon (e.g. local PostgreSQL).
 */
function withNeonParams(url: string | undefined): string | undefined {
  if (!url || !url.includes('neon.tech')) return url;
  const sep = url.includes('?') ? '&' : '?';
  const params: string[] = [];
  if (!url.includes('connection_limit')) params.push('connection_limit=5');
  if (!url.includes('pool_timeout')) params.push('pool_timeout=10');
  if (!url.includes('connect_timeout')) params.push('connect_timeout=15');
  return params.length > 0 ? `${url}${sep}${params.join('&')}` : url;
}

const datasourceUrl = withNeonParams(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  });

// Cache singleton in ALL environments.
// Production standalone server is long-lived (not serverless),
// so reusing the client avoids connection churn with Neon.
globalForPrisma.prisma = prisma;
