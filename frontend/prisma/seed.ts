import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production seed (idempotent)...');

  // Seed categories — must match src/data/categories.ts (10 unified, Phase 10)
  const CATEGORIES = [
    { slug: 'olive-oil-olives', name: 'Ελαιόλαδο & Ελιές', icon: '🫒', sortOrder: 1 },
    { slug: 'honey-bee', name: 'Μέλι & Προϊόντα Μέλισσας', icon: '🍯', sortOrder: 2 },
    { slug: 'nuts-dried', name: 'Ξηροί Καρποί', icon: '🥜', sortOrder: 3 },
    { slug: 'cosmetics', name: 'Φυσικά Καλλυντικά', icon: '✨', sortOrder: 4 },
    { slug: 'beverages', name: 'Ποτά', icon: '🍷', sortOrder: 5 },
    { slug: 'sweets-jams', name: 'Γλυκά & Μαρμελάδες', icon: '🍒', sortOrder: 6 },
    { slug: 'pasta', name: 'Ζυμαρικά', icon: '🍝', sortOrder: 7 },
    { slug: 'herbs-spices-tea', name: 'Βότανα, Μπαχαρικά & Τσάι', icon: '🌿', sortOrder: 8 },
    { slug: 'sauces-spreads', name: 'Σάλτσες & Αλείμματα', icon: '🥫', sortOrder: 9 },
    { slug: 'legumes-grains', name: 'Όσπρια & Δημητριακά', icon: '🫘', sortOrder: 10 },
  ];

  // Upsert the 10 unified categories (create if missing, update name/icon/order)
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true },
      create: { slug: cat.slug, name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true }
    });
  }
  // Deactivate ALL categories not in the unified 10
  const validSlugs = CATEGORIES.map(c => c.slug);
  const deactivated = await prisma.category.updateMany({
    where: { slug: { notIn: validSlugs } },
    data: { isActive: false },
  });
  console.log(`✅ Categories: ${CATEGORIES.length} active, ${deactivated.count} stale deactivated`);

  // Idempotent producer upserts
  const producer1 = await prisma.producer.upsert({
    where: { slug: 'malis-garden' },
    update: {
      name: 'Malis Garden',
      region: 'Attica',
      category: 'Organic Farming',
      description: 'Traditional organic farm in Attica producing olive oil and preserves',
      isActive: true,
    },
    create: {
      slug: 'malis-garden',
      name: 'Malis Garden',
      region: 'Attica',
      category: 'Organic Farming',
      description: 'Traditional organic farm in Attica producing olive oil and preserves',
      products: 0,
      rating: 0,
      isActive: true,
    },
  });

  const producer2 = await prisma.producer.upsert({
    where: { slug: 'lemnos-honey-co' },
    update: {
      name: 'Lemnos Honey Co',
      region: 'Lemnos',
      category: 'Beekeeping',
      description: 'Family beekeeping business producing premium thyme honey',
      isActive: true,
    },
    create: {
      slug: 'lemnos-honey-co',
      name: 'Lemnos Honey Co',
      region: 'Lemnos',
      category: 'Beekeeping',
      description: 'Family beekeeping business producing premium thyme honey',
      products: 0,
      rating: 0,
      isActive: true,
    },
  });

  console.log(`✅ Producers: ${producer1.name}, ${producer2.name}`);

  // Idempotent product upserts using slug
  const product1 = await prisma.product.upsert({
    where: { slug: 'thymarisio-meli-450g' },
    update: {
      title: 'Θυμαρίσιο Μέλι 450g',
      category: 'honey-bee',
      price: 7.9,
      unit: 'jar',
      stock: 50,
      description: 'Premium thyme honey from Lemnos island',
      isActive: true,
      producerId: producer2.id,
    },
    create: {
      slug: 'thymarisio-meli-450g',
      title: 'Θυμαρίσιο Μέλι 450g',
      category: 'honey-bee',
      price: 7.9,
      unit: 'jar',
      stock: 50,
      description: 'Premium thyme honey from Lemnos island',
      isActive: true,
      producerId: producer2.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'exairetiko-partheno-elaiolado-1l' },
    update: {
      title: 'Εξαιρετικό Παρθένο Ελαιόλαδο 1L',
      category: 'olive-oil-olives',
      price: 10.9,
      unit: 'bottle',
      stock: 30,
      description: 'Extra virgin olive oil from organic olives',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'exairetiko-partheno-elaiolado-1l',
      title: 'Εξαιρετικό Παρθένο Ελαιόλαδο 1L',
      category: 'olive-oil-olives',
      price: 10.9,
      unit: 'bottle',
      stock: 30,
      description: 'Extra virgin olive oil from organic olives',
      isActive: true,
      producerId: producer1.id,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { slug: 'glyko-koutaliou-syko-380g' },
    update: {
      title: 'Γλυκό Κουταλιού Σύκο 380g',
      category: 'sweets-jams',
      price: 4.5,
      unit: 'jar',
      stock: 40,
      description: 'Traditional fig spoon sweet',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'glyko-koutaliou-syko-380g',
      title: 'Γλυκό Κουταλιού Σύκο 380g',
      category: 'sweets-jams',
      price: 4.5,
      unit: 'jar',
      stock: 40,
      description: 'Traditional fig spoon sweet',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 4 - Tomato sauce (was feta — dairy removed from MVP)
  const product4 = await prisma.product.upsert({
    where: { slug: 'feta-pop-mytilinis' },
    update: {
      title: 'Σάλτσα Ντομάτας Σπιτική 350g',
      category: 'sauces-spreads',
      price: 4.5,
      unit: 'jar',
      stock: 25,
      description: 'Homemade tomato sauce with fresh basil',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'feta-pop-mytilinis',
      title: 'Σάλτσα Ντομάτας Σπιτική 350g',
      category: 'sauces-spreads',
      price: 4.5,
      unit: 'jar',
      stock: 25,
      description: 'Homemade tomato sauce with fresh basil',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 5 - Tsipouro
  const product5 = await prisma.product.upsert({
    where: { slug: 'tsipouro-paradosiako' },
    update: {
      title: 'Τσίπουρο Παραδοσιακό 700ml',
      category: 'beverages',
      price: 12.9,
      unit: 'bottle',
      stock: 15,
      description: 'Traditional Greek tsipouro spirit',
      isActive: true,
      producerId: producer2.id,
    },
    create: {
      slug: 'tsipouro-paradosiako',
      title: 'Τσίπουρο Παραδοσιακό 700ml',
      category: 'beverages',
      price: 12.9,
      unit: 'bottle',
      stock: 15,
      description: 'Traditional Greek tsipouro spirit',
      isActive: true,
      producerId: producer2.id,
    },
  });

  // Product 6 - Lentils (was oranges — fruits-vegetables removed from MVP)
  const product6 = await prisma.product.upsert({
    where: { slug: 'portokalia-viologika' },
    update: {
      title: 'Φακές Εγχώριες 500g',
      category: 'legumes-grains',
      price: 3.9,
      unit: 'pack',
      stock: 45,
      description: 'Premium Greek lentils from Thessaly',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'portokalia-viologika',
      title: 'Φακές Εγχώριες 500g',
      category: 'legumes-grains',
      price: 3.9,
      unit: 'pack',
      stock: 45,
      description: 'Premium Greek lentils from Thessaly',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 7 - Mountain Oregano
  const product7 = await prisma.product.upsert({
    where: { slug: 'rigani-vounou' },
    update: {
      title: 'Ρίγανη Βουνού 100g',
      category: 'herbs-spices-tea',
      price: 3.5,
      unit: 'pack',
      stock: 60,
      description: 'Wild mountain oregano from Epirus',
      isActive: true,
      producerId: producer2.id,
    },
    create: {
      slug: 'rigani-vounou',
      title: 'Ρίγανη Βουνού 100g',
      category: 'herbs-spices-tea',
      price: 3.5,
      unit: 'pack',
      stock: 60,
      description: 'Wild mountain oregano from Epirus',
      isActive: true,
      producerId: producer2.id,
    },
  });

  // Product 8 - Almonds (was potatoes — fruits-vegetables removed from MVP)
  const product8 = await prisma.product.upsert({
    where: { slug: 'patates-naxou' },
    update: {
      title: 'Αμύγδαλα Αιγίνης 250g',
      category: 'nuts-dried',
      price: 5.9,
      unit: 'pack',
      stock: 35,
      description: 'Premium almonds from Aegina island',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'patates-naxou',
      title: 'Αμύγδαλα Αιγίνης 250g',
      category: 'nuts-dried',
      price: 5.9,
      unit: 'pack',
      stock: 35,
      description: 'Premium almonds from Aegina island',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 9 - Lemnos Red Wine
  const product9 = await prisma.product.upsert({
    where: { slug: 'krasi-limnou-erythro' },
    update: {
      title: 'Κρασί Λήμνου Ερυθρό 750ml',
      category: 'beverages',
      price: 9.9,
      unit: 'bottle',
      stock: 18,
      description: 'Red wine from Lemnos vineyards',
      isActive: true,
      producerId: producer2.id,
    },
    create: {
      slug: 'krasi-limnou-erythro',
      title: 'Κρασί Λήμνου Ερυθρό 750ml',
      category: 'beverages',
      price: 9.9,
      unit: 'bottle',
      stock: 18,
      description: 'Red wine from Lemnos vineyards',
      isActive: true,
      producerId: producer2.id,
    },
  });

  // Product 10 - Homemade Trahanas
  const product10 = await prisma.product.upsert({
    where: { slug: 'trachanas-spitikos' },
    update: {
      title: 'Τραχανάς Σπιτικός 500g',
      category: 'pasta',
      price: 5.5,
      unit: 'pack',
      stock: 40,
      description: 'Traditional homemade trahanas',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'trachanas-spitikos',
      title: 'Τραχανάς Σπιτικός 500g',
      category: 'pasta',
      price: 5.5,
      unit: 'pack',
      stock: 40,
      description: 'Traditional homemade trahanas',
      isActive: true,
      producerId: producer1.id,
    },
  });

  console.log(`✅ Products seeded: 10 items total`);
  console.log(`   - ${product1.title}`);
  console.log(`   - ${product2.title}`);
  console.log(`   - ${product3.title}`);
  console.log(`   - ${product4.title}`);
  console.log(`   - ${product5.title}`);
  console.log(`   - ${product6.title}`);
  console.log(`   - ${product7.title}`);
  console.log(`   - ${product8.title}`);
  console.log(`   - ${product9.title}`);
  console.log(`   - ${product10.title}`);
  console.log('🌱 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
