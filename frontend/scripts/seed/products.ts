import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('→ Seeding products (idempotent upsert by slug)');

  // First, ensure we have a producer
  const producer = await prisma.producer.upsert({
    where: { slug: 'local-farm-demo' },
    update: {},
    create: {
      slug: 'local-farm-demo',
      name: 'Τοπική Φάρμα Demo',
      region: 'Αττική',
      category: 'Λαχανικά & Φρούτα',
      description: 'Βιολογικά προϊόντα από τοπική φάρμα',
      email: 'info@local-farm.gr',
      phone: '+30 210 1234567',
      isActive: true,
    },
  });

  const products = [
    {
      slug: 'tomatoes-organic',
      title: 'Βιολογικές Ντομάτες',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Λαχανικά',
      price: 3.50,
      priceCents: 350,
      unit: 'κιλό',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337',
      isActive: true,
    },
    {
      slug: 'olives-kalamata',
      title: 'Ελιές Καλαμάτας',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Ελιές & Λάδι',
      price: 8.90,
      priceCents: 890,
      unit: 'κιλό',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1605665187398-f6021e0cb6c0',
      isActive: true,
    },
    {
      slug: 'honey-thyme',
      title: 'Μέλι Θυμαρίσιο',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Μέλι & Γλυκά',
      price: 12.00,
      priceCents: 1200,
      unit: 'κιλό',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784963',
      isActive: true,
    },
    {
      slug: 'feta-cheese',
      title: 'Φέτα ΠΟΠ',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Τυριά',
      price: 15.50,
      priceCents: 1550,
      unit: 'κιλό',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c',
      isActive: true,
    },
    {
      slug: 'olive-oil-extra-virgin',
      title: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Ελιές & Λάδι',
      price: 25.00,
      priceCents: 2500,
      unit: 'λίτρο',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
      isActive: true,
    },
    {
      slug: 'spinach-fresh',
      title: 'Φρέσκο Σπανάκι',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Λαχανικά',
      price: 2.80,
      priceCents: 280,
      unit: 'κιλό',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
      isActive: true,
    },
    {
      slug: 'potatoes-local',
      title: 'Πατάτες Τοπικές',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Λαχανικά',
      price: 1.50,
      priceCents: 150,
      unit: 'κιλό',
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
      isActive: true,
    },
    {
      slug: 'eggs-organic',
      title: 'Βιολογικά Αυγά',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Αυγά & Γαλακτοκομικά',
      price: 4.50,
      priceCents: 450,
      unit: '6 τεμάχια',
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f',
      isActive: true,
    },
    {
      slug: 'grapes-red',
      title: 'Κόκκινα Σταφύλια',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Φρούτα',
      price: 3.20,
      priceCents: 320,
      unit: 'κιλό',
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d',
      isActive: true,
    },
    {
      slug: 'yogurt-greek',
      title: 'Ελληνικό Γιαούρτι',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Αυγά & Γαλακτοκομικά',
      price: 5.80,
      priceCents: 580,
      unit: '500g',
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
      isActive: true,
    },
    {
      slug: 'oranges-fresh',
      title: 'Φρέσκα Πορτοκάλια',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Φρούτα',
      price: 2.40,
      priceCents: 240,
      unit: 'κιλό',
      stock: 70,
      imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9',
      isActive: true,
    },
    {
      slug: 'basil-fresh',
      title: 'Φρέσκος Βασιλικός',
      producerName: 'Τοπική Φάρμα Demo',
      category: 'Βότανα',
      price: 1.80,
      priceCents: 180,
      unit: 'μάτσο',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733',
      isActive: true,
    },
  ];

  let count = 0;
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        producerName: product.producerName,
        category: product.category,
        price: product.price,
        priceCents: product.priceCents,
        unit: product.unit,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
      },
      create: {
        ...product,
        producerId: producer.id,
      },
    });
    count++;
  }

  console.log(`✓ Seeded ${count} products successfully`);
}

main()
  .catch((e) => {
    console.error('✗ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
