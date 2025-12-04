import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production seed (idempotent)...');

  // Seed categories (idempotent)
  const CATEGORIES = [
    { slug: 'vegetables', name: 'Λαχανικά', icon: '🥬', sortOrder: 1 },
    { slug: 'fruits', name: 'Φρούτα', icon: '🍎', sortOrder: 2 },
    { slug: 'dairy', name: 'Γαλακτοκομικά', icon: '🧀', sortOrder: 3 },
    { slug: 'meat', name: 'Κρέατα', icon: '🥩', sortOrder: 4 },
    { slug: 'fish', name: 'Ψάρια', icon: '🐟', sortOrder: 5 },
    { slug: 'bakery', name: 'Αρτοσκευάσματα', icon: '🥖', sortOrder: 6 },
    { slug: 'honey-sweets', name: 'Μέλι & Γλυκά', icon: '🍯', sortOrder: 7 },
    { slug: 'olive-oil', name: 'Ελαιόλαδο', icon: '🫒', sortOrder: 8 },
    { slug: 'other', name: 'Άλλο', icon: '📦', sortOrder: 99 }
  ];

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true },
      create: { slug: cat.slug, name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true }
    });
  }
  console.log(`✅ Categories: ${CATEGORIES.length} seeded`);

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
      category: 'Honey & Sweets',
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
      category: 'Honey & Sweets',
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
      category: 'Olive Oil',
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
      category: 'Olive Oil',
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
      category: 'Honey & Sweets',
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
      category: 'Honey & Sweets',
      price: 4.5,
      unit: 'jar',
      stock: 40,
      description: 'Traditional fig spoon sweet',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 4 - Feta cheese
  const product4 = await prisma.product.upsert({
    where: { slug: 'feta-pop-mytilinis' },
    update: {
      title: 'Φέτα ΠΟΠ Μυτιλήνης 400g',
      category: 'Dairy',
      price: 6.5,
      unit: 'pack',
      stock: 25,
      description: 'Authentic PDO feta cheese from Mytilini',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'feta-pop-mytilinis',
      title: 'Φέτα ΠΟΠ Μυτιλήνης 400g',
      category: 'Dairy',
      price: 6.5,
      unit: 'pack',
      stock: 25,
      description: 'Authentic PDO feta cheese from Mytilini',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 5 - Tsipouro
  const product5 = await prisma.product.upsert({
    where: { slug: 'tsipouro-paradosiako' },
    update: {
      title: 'Τσίπουρο Παραδοσιακό 700ml',
      category: 'Beverages',
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
      category: 'Beverages',
      price: 12.9,
      unit: 'bottle',
      stock: 15,
      description: 'Traditional Greek tsipouro spirit',
      isActive: true,
      producerId: producer2.id,
    },
  });

  // Product 6 - Organic Oranges
  const product6 = await prisma.product.upsert({
    where: { slug: 'portokalia-viologika' },
    update: {
      title: 'Πορτοκάλια Βιολογικά 5kg',
      category: 'Fruits & Vegetables',
      price: 8.9,
      unit: 'box',
      stock: 20,
      description: 'Organic oranges from Argolida',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'portokalia-viologika',
      title: 'Πορτοκάλια Βιολογικά 5kg',
      category: 'Fruits & Vegetables',
      price: 8.9,
      unit: 'box',
      stock: 20,
      description: 'Organic oranges from Argolida',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 7 - Mountain Oregano
  const product7 = await prisma.product.upsert({
    where: { slug: 'rigani-vounou' },
    update: {
      title: 'Ρίγανη Βουνού 100g',
      category: 'Herbs & Spices',
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
      category: 'Herbs & Spices',
      price: 3.5,
      unit: 'pack',
      stock: 60,
      description: 'Wild mountain oregano from Epirus',
      isActive: true,
      producerId: producer2.id,
    },
  });

  // Product 8 - Naxos Potatoes
  const product8 = await prisma.product.upsert({
    where: { slug: 'patates-naxou' },
    update: {
      title: 'Πατάτες Νάξου 3kg',
      category: 'Fruits & Vegetables',
      price: 4.9,
      unit: 'bag',
      stock: 35,
      description: 'Famous potatoes from Naxos island',
      isActive: true,
      producerId: producer1.id,
    },
    create: {
      slug: 'patates-naxou',
      title: 'Πατάτες Νάξου 3kg',
      category: 'Fruits & Vegetables',
      price: 4.9,
      unit: 'bag',
      stock: 35,
      description: 'Famous potatoes from Naxos island',
      isActive: true,
      producerId: producer1.id,
    },
  });

  // Product 9 - Lemnos Red Wine
  const product9 = await prisma.product.upsert({
    where: { slug: 'krasi-limnou-erythro' },
    update: {
      title: 'Κρασί Λήμνου Ερυθρό 750ml',
      category: 'Beverages',
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
      category: 'Beverages',
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
      category: 'Pasta & Grains',
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
      category: 'Pasta & Grains',
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
