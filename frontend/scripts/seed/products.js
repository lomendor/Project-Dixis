/* Idempotent seed for Producers & Products */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const producers = [
  { slug: 'melissokomia-aigaiou', name: 'Μελισσοκομία Αιγαίου', region: 'Αιγαίο', category: 'Μέλι & Κερί', imageUrl: '/demo/producer-honey.jpg' },
  { slug: 'elaiones-messinias', name: 'Ελαιώνες Μεσσηνίας', region: 'Πελοπόννησος', category: 'Ελαιόλαδο', imageUrl: '/demo/producer-oil.jpg' },
  { slug: 'tyrokomeio-olympou', name: 'Τυροκομείο Ολύμπου', region: 'Μακεδονία', category: 'Τυροκομικά', imageUrl: '/demo/producer-cheese.jpg' },
  { slug: 'ktima-peloponissou', name: 'Κτήμα Πελοποννήσου', region: 'Πελοπόννησος', category: 'Κρασί & Αμπέλι', imageUrl: '/demo/producer-wine.jpg' },
  { slug: 'ktima-papadopoulou', name: 'Κτήμα Παπαδόπουλου', region: 'Θεσσαλία', category: 'Λαχανικά', imageUrl: '/demo/producer-veg.jpg' },
  { slug: 'ktima-argolidas', name: 'Κτήμα Αργολίδας', region: 'Πελοπόννησος', category: 'Οπωρικά', imageUrl: '/demo/producer-fruit.jpg' },
];

// Products με reference στους Producers (by slug)
const products = [
  { title: 'Μέλι Θυμαριού 500g', category: 'Μέλι', price: 9.50, unit: 'τμχ', stock: 25, producerSlug: 'melissokomia-aigaiou', imageUrl: '/demo/honey.jpg' },
  { title: 'Ελαιόλαδο Extra Virgin 1L', category: 'Ελαιόλαδο', price: 11.50, unit: 'L', stock: 40, producerSlug: 'elaiones-messinias', imageUrl: '/demo/olive-oil.jpg' },
  { title: 'Φέτα ΠΟΠ 400g', category: 'Τυρί', price: 5.20, unit: 'τμχ', stock: 30, producerSlug: 'tyrokomeio-olympou', imageUrl: '/demo/feta.jpg' },
  { title: 'Κρασί Ροδίτης 750ml', category: 'Κρασί', price: 7.80, unit: 'φιάλη', stock: 50, producerSlug: 'ktima-peloponissou', imageUrl: '/demo/wine.jpg' },
  { title: 'Ντομάτες Βιολογικές /kg', category: 'Λαχανικά', price: 3.20, unit: 'kg', stock: 100, producerSlug: 'ktima-papadopoulou', imageUrl: '/demo/tomatoes.jpg' },
  { title: 'Πορτοκάλια Αργολίδας /kg', category: 'Φρούτα', price: 1.80, unit: 'kg', stock: 120, producerSlug: 'ktima-argolidas', imageUrl: '/demo/orange.jpg' },
  { title: 'Μέλι Πεύκου 250g', category: 'Μέλι', price: 6.50, unit: 'τμχ', stock: 20, producerSlug: 'melissokomia-aigaiou', imageUrl: '/demo/honey-pine.jpg' },
  { title: 'Ελαιόλαδο Βιολογικό 500ml', category: 'Ελαιόλαδο', price: 7.90, unit: 'τμχ', stock: 35, producerSlug: 'elaiones-messinias', imageUrl: '/demo/olive-oil-bio.jpg' },
  { title: 'Γραβιέρα 300g', category: 'Τυρί', price: 6.90, unit: 'τμχ', stock: 25, producerSlug: 'tyrokomeio-olympou', imageUrl: '/demo/graviera.jpg' },
  { title: 'Κρασί Ασύρτικο 750ml', category: 'Κρασί', price: 12.50, unit: 'φιάλη', stock: 30, producerSlug: 'ktima-peloponissou', imageUrl: '/demo/wine-white.jpg' },
  { title: 'Αγγούρια Βιολογικά /kg', category: 'Λαχανικά', price: 2.50, unit: 'kg', stock: 80, producerSlug: 'ktima-papadopoulou', imageUrl: '/demo/cucumber.jpg' },
  { title: 'Μανταρίνια Χίου /kg', category: 'Φρούτα', price: 2.20, unit: 'kg', stock: 90, producerSlug: 'ktima-argolidas', imageUrl: '/demo/mandarin.jpg' },
];

(async () => {
  // 1) Upsert Producers
  const producerMap = {};
  for (const p of producers) {
    const producer = await prisma.producer.upsert({
      where: { slug: p.slug },
      create: { ...p, isActive: true },
      update: { name: p.name, region: p.region, category: p.category, imageUrl: p.imageUrl },
    });
    producerMap[p.slug] = producer.id;
  }
  
  // 2) Check if products already exist
  const existingCount = await prisma.product.count({ where: { isActive: true } });
  if (existingCount >= 10) {
    console.log(JSON.stringify({ ok: true, skipped: true, reason: 'already_seeded', count: existingCount }));
    await prisma.$disconnect();
    return;
  }
  
  // 3) Create Products
  let created = 0;
  for (const p of products) {
    const producerId = producerMap[p.producerSlug];
    if (!producerId) {
      console.warn(`Producer not found for slug: ${p.producerSlug}`);
      continue;
    }
    
    await prisma.product.create({
      data: {
        title: p.title,
        category: p.category,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        producerId,
        imageUrl: p.imageUrl,
        isActive: true,
      },
    });
    created++;
  }
  
  const total = await prisma.product.count();
  console.log(JSON.stringify({ ok: true, created, total }));
  await prisma.$disconnect();
})().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
