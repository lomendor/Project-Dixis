/**
 * One-time migration: Sync DB Category table with official 13 categories.
 *
 * What it does:
 * 1. Upserts the 13 official categories (from src/data/categories.ts)
 * 2. Deactivates any Category rows not in the official 13
 *
 * Usage:
 *   cd frontend && npx tsx scripts/ops/sync-categories.ts
 *
 * Safe to re-run (idempotent).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Official 13 categories — must match src/data/categories.ts
const OFFICIAL_CATEGORIES = [
  { slug: 'olive-oil-olives', name: 'Ελαιόλαδο & Ελιές', sortOrder: 1 },
  { slug: 'honey-bee', name: 'Μέλι & Κυψέλη', sortOrder: 2 },
  { slug: 'legumes', name: 'Όσπρια', sortOrder: 3 },
  { slug: 'grains-rice', name: 'Δημητριακά & Ρύζια', sortOrder: 4 },
  { slug: 'pasta', name: 'Ζυμαρικά', sortOrder: 5 },
  { slug: 'flours-bakery', name: 'Αλεύρια & Αρτοποιία', sortOrder: 6 },
  { slug: 'nuts-dried', name: 'Ξηροί Καρποί & Αποξηραμένα', sortOrder: 7 },
  { slug: 'herbs-spices', name: 'Βότανα & Μπαχαρικά', sortOrder: 8 },
  { slug: 'sweets-spreads', name: 'Γλυκά, Μαρμελάδες & Αλείμματα', sortOrder: 9 },
  { slug: 'sauces-preserves', name: 'Σάλτσες, Conserves & Τουρσιά', sortOrder: 10 },
  { slug: 'beverages', name: 'Ποτά & Αποστάγματα', sortOrder: 11 },
  { slug: 'dairy', name: 'Γαλακτοκομικά', sortOrder: 12 },
  { slug: 'fruits-vegetables', name: 'Φρούτα & Λαχανικά', sortOrder: 13 },
];

async function main() {
  console.log('🔄 Syncing categories to official 13...\n');

  const officialSlugs = OFFICIAL_CATEGORIES.map((c) => c.slug);

  // 1. Upsert official categories
  for (const cat of OFFICIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder, isActive: true },
      create: { slug: cat.slug, name: cat.name, sortOrder: cat.sortOrder, isActive: true },
    });
    console.log(`  ✅ ${cat.slug} → ${cat.name}`);
  }

  // 2. Deactivate non-official categories
  const deactivated = await prisma.category.updateMany({
    where: { slug: { notIn: officialSlugs } },
    data: { isActive: false },
  });

  if (deactivated.count > 0) {
    console.log(`\n  ⚠️  Deactivated ${deactivated.count} non-official categories`);
  }

  // 3. Summary
  const active = await prisma.category.count({ where: { isActive: true } });
  const total = await prisma.category.count();
  console.log(`\n📊 Result: ${active} active / ${total} total categories`);
  console.log('✅ Category sync complete!');
}

main()
  .catch((e) => {
    console.error('❌ Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
