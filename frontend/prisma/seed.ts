import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production seed (idempotent)...');

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

  // Idempotent product upserts
  const product1 = await prisma.product.upsert({
    where: { id: 'seed-product-honey' },
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
      id: 'seed-product-honey',
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
    where: { id: 'seed-product-olive-oil' },
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
      id: 'seed-product-olive-oil',
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
    where: { id: 'seed-product-fig-sweet' },
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
      id: 'seed-product-fig-sweet',
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

  console.log(`✅ Products: ${product1.title}, ${product2.title}, ${product3.title}`);
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
