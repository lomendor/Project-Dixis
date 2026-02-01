#!/usr/bin/env npx tsx
/**
 * Pass FIX-ADMIN-WHITELIST-SYNC-01: Seed AdminUser table from ADMIN_PHONES env var
 *
 * This script ensures all phones in ADMIN_PHONES have corresponding AdminUser records.
 * It's idempotent - safe to run multiple times.
 *
 * Usage (from frontend directory):
 *   npx tsx scripts/ops/seed-admin-users.ts
 *
 * Or with environment file:
 *   source .env && npx tsx scripts/ops/seed-admin-users.ts
 *
 * Environment variables:
 *   ADMIN_PHONES - Comma-separated list of admin phone numbers
 *   DATABASE_URL - Prisma database connection string
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const raw = process.env.ADMIN_PHONES || '';
  const phones = raw.split(',').map(s => s.trim()).filter(Boolean);

  if (!phones.length) {
    console.error('❌ ADMIN_PHONES is empty or not set. No admin users to seed.');
    console.error('   Set ADMIN_PHONES=+30123456789,+30987654321 in your .env');
    process.exit(2);
  }

  console.log(`📋 Found ${phones.length} phone(s) in ADMIN_PHONES`);

  for (const phone of phones) {
    const maskedPhone = phone.replace(/(\+\d{2})\d+(\d{3})/, '$1******$2');

    const result = await prisma.adminUser.upsert({
      where: { phone },
      update: { isActive: true },
      create: { phone, role: 'admin', isActive: true }
    });

    console.log(`✅ Upserted admin: ${maskedPhone} (id: ${result.id})`);
  }

  // Show final count
  const count = await prisma.adminUser.count();
  console.log(`\n📊 Total AdminUser records: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
