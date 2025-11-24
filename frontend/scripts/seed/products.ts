import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const producers = [
  { id: 'seed-producer-1', slug: 'ktima-papadopoulou', name: 'Κτήμα Παπαδόπουλου', region: 'Πελοπόννησος', category: 'Λαχανικά' },
  { id: 'seed-producer-2', slug: 'melissi-aigaiou', name: 'Μελίσσι Αιγαίου', region: 'Αιγαίο', category: 'Μέλι' },
  { id: 'seed-producer-3', slug: 'lachanokipos-kritis', name: 'Λαχανόκηπος Κρήτης', region: 'Κρήτη', category: 'Λαχανικά' },
]

const products = [
  { id: 'seed-prod-tomato-1', slug: 'tomates-viologikes', producerId: 'seed-producer-1', title: 'Τομάτες βιολογικές', category: 'Λαχανικά', price: 2.9,  unit: '€/kg', stock: 120, imageUrl: null as string | null },
  { id: 'seed-prod-cucumber-1', slug: 'agouria-freska', producerId: 'seed-producer-1', title: 'Αγγούρια φρέσκα',  category: 'Λαχανικά', price: 1.8,  unit: '€/kg', stock: 180, imageUrl: null as string | null },
  { id: 'seed-prod-honey-1', slug: 'meli-thymarisio', producerId: 'seed-producer-2', title: 'Μέλι θυμαρίσιο',    category: 'Μέλι',     price: 12.5, unit: '€/500g', stock: 40,  imageUrl: null as string | null },
  { id: 'seed-prod-honey-2', slug: 'meli-antheon', producerId: 'seed-producer-2', title: 'Μέλι ανθέων',       category: 'Μέλι',     price: 9.9,  unit: '€/500g', stock: 60,  imageUrl: null as string | null },
  { id: 'seed-prod-lettuce-1', slug: 'marouli', producerId: 'seed-producer-3', title: 'Μαρούλι',         category: 'Λαχανικά', price: 0.9,  unit: '€/τεμ',  stock: 90,  imageUrl: null as string | null },
  { id: 'seed-prod-pepper-1',  slug: 'piperies-prasines', producerId: 'seed-producer-3', title: 'Πιπεριές πράσινες',category: 'Λαχανικά', price: 2.2,  unit: '€/kg',  stock: 70,  imageUrl: null as string | null },
  { id: 'seed-prod-eggplant-1', slug: 'melitzanes', producerId: 'seed-producer-3', title: 'Μελιτζάνες',      category: 'Λαχανικά', price: 2.6,  unit: '€/kg',  stock: 65,  imageUrl: null as string | null },
  { id: 'seed-prod-zucchini-1', slug: 'kolokyth', producerId: 'seed-producer-3', title: 'Κολοκυθάκια',     category: 'Λαχανικά', price: 1.9,  unit: '€/kg',  stock: 85,  imageUrl: null as string | null },
  { id: 'seed-prod-honey-3',   slug: 'meli-elatou', producerId: 'seed-producer-2', title: 'Μέλι ελάτου',     category: 'Μέλι',     price: 11.5, unit: '€/500g', stock: 35,  imageUrl: null as string | null },
  { id: 'seed-prod-tomato-2',  slug: 'tomates-roma', producerId: 'seed-producer-1', title: 'Τομάτες Roma',    category: 'Λαχανικά', price: 3.2,  unit: '€/kg',  stock: 75,  imageUrl: null as string | null },
]

async function main() {
  // Ασφάλεια: ΜΗΝ τρέχεις seed σε production
  const url = process.env.DATABASE_URL || ''
  if (/neon\.tech\/.*prod/i.test(url)) {
    throw new Error('Refusing to seed on production DATABASE_URL')
  }

  // Upsert producers
  for (const p of producers) {
    await prisma.producer.upsert({
      where: { id: p.id },
      update: { name: p.name, slug: p.slug, region: p.region, category: p.category },
      create: { id: p.id, slug: p.slug, name: p.name, region: p.region, category: p.category },
    })
  }

  // Upsert products (με σταθερά ids)
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        slug: p.slug, title: p.title, category: p.category, price: p.price, unit: p.unit,
        stock: p.stock, imageUrl: p.imageUrl ?? null, isActive: true, producerId: p.producerId,
      },
      create: {
        id: p.id, slug: p.slug, title: p.title, category: p.category, price: p.price, unit: p.unit,
        stock: p.stock, imageUrl: p.imageUrl ?? null, isActive: true, producerId: p.producerId,
      }
    })
  }
  const count = await prisma.product.count({ where: { isActive: true } })
  console.log('Seeded products (active):', count)
}

main().catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
