// DEPRECATED — Use @/lib/db/client instead.
// This module previously created a separate PrismaClient instance.
// All consumers have been migrated to import { prisma } from '@/lib/db/client'.
// Kept only for backward compatibility; will be removed in a future cleanup.

import { prisma } from '@/lib/db/client'

/** @deprecated Use `import { prisma } from '@/lib/db/client'` instead. */
export function getPrisma() {
  return prisma
}
