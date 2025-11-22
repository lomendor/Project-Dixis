#!/usr/bin/env tsx
/**
 * AG119.1 Seed Script: Products (Idempotent)
 *
 * Seeds ≥10 products into Neon DB using upsert by slug.
 * Safe to run multiple times - will not create duplicates.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SEED_PRODUCTS = [
  {
    slug: 'extra-virgin-olive-oil-1l',
    title: 'Ελαιόλαδο Εξαιρετικά Παρθένο 1L',
    category: 'Έλαια',
    priceCents: 1250,
    unit: '1L',
    stock: 50,
    description: 'Κρητικό εξαιρετικά παρθένο ελαιόλαδο από οικογενειακούς ελαιώνες.',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'mountain-honey-500g',
    title: 'Μέλι Βουνού 500g',
    category: 'Μέλι',
    priceCents: 890,
    unit: '500g',
    stock: 30,
    description: 'Φυσικό μέλι από τα βουνά της Πελοποννήσου, χωρίς πρόσθετα.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784110?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'feta-cheese-400g',
    title: 'Φέτα ΠΟΠ 400g',
    category: 'Τυροκομικά',
    priceCents: 650,
    unit: '400g',
    stock: 40,
    description: 'Παραδοσιακή φέτα με προστατευόμενη ονομασία προέλευσης.',
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'organic-tomatoes-1kg',
    title: 'Βιολογικές Ντομάτες 1kg',
    category: 'Λαχανικά',
    priceCents: 340,
    unit: '1kg',
    stock: 60,
    description: 'Φρέσκες βιολογικές ντομάτες από τη Μεσσηνία.',
    imageUrl: 'https://images.unsplash.com/photo-1546470427-227d8c71c1c8?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'graviera-cheese-500g',
    title: 'Γραβιέρα Κρήτης 500g',
    category: 'Τυροκομικά',
    priceCents: 780,
    unit: '500g',
    stock: 25,
    description: 'Κρητική γραβιέρα με πλούσια γεύση και αρώματα.',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'thyme-honey-250g',
    title: 'Μέλι Θυμαρίσιο 250g',
    category: 'Μέλι',
    priceCents: 550,
    unit: '250g',
    stock: 35,
    description: 'Αρωματικό θυμαρίσιο μέλι από τις Κυκλάδες.',
    imageUrl: 'https://images.unsplash.com/photo-1558640044-3205a4d5d1c3?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'kalamata-olives-500g',
    title: 'Ελιές Καλαμάτας 500g',
    category: 'Ελιές',
    priceCents: 490,
    unit: '500g',
    stock: 45,
    description: 'Καλαμών ελιές σε άρμη, με πλούσια γεύση.',
    imageUrl: 'https://images.unsplash.com/photo-1583770291066-35b8f648f922?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'oregano-dried-50g',
    title: 'Ρίγανη Ξερή 50g',
    category: 'Μπαχαρικά',
    priceCents: 280,
    unit: '50g',
    stock: 70,
    description: 'Αρωματική ρίγανη από ορεινές περιοχές της Κρήτης.',
    imageUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'grape-raki-500ml',
    title: 'Ρακί Σταφυλιού 500ml',
    category: 'Ποτά',
    priceCents: 1150,
    unit: '500ml',
    stock: 20,
    description: 'Παραδοσιακό κρητικό ρακί από απόσταξη σταφυλιού.',
    imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'orange-marmalade-450g',
    title: 'Μαρμελάδα Πορτοκάλι 450g',
    category: 'Γλυκά',
    priceCents: 590,
    unit: '450g',
    stock: 30,
    description: 'Σπιτική μαρμελάδα πορτοκάλι χωρίς συντηρητικά.',
    imageUrl: 'https://images.unsplash.com/photo-1562020286-d28634c64d98?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'lemon-olive-oil-250ml',
    title: 'Ελαιόλαδο με Λεμόνι 250ml',
    category: 'Έλαια',
    priceCents: 690,
    unit: '250ml',
    stock: 40,
    description: 'Παρθένο ελαιόλαδο εμποτισμένο με φρέσκο λεμόνι.',
    imageUrl: 'https://images.unsplash.com/photo-1608478876706-00f7e4da2458?w=800&h=800&fit=crop',
    isActive: true,
  },
  {
    slug: 'wild-mountain-tea-100g',
    title: 'Τσάι του Βουνού 100g',
    category: 'Ροφήματα',
    priceCents: 450,
    unit: '100g',
    stock: 50,
    description: 'Φυσικό τσάι του βουνού από την Ολυμπία.',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop',
    isActive: true,
  },
]

async function main() {
  console.log('🌱 AG119.1 Seed: Products (Idempotent)')

  // Ensure we have at least one producer to assign products to
  let producer = await prisma.producer.findFirst({ where: { isActive: true } })

  if (!producer) {
    console.log('  → Creating default producer...')
    producer = await prisma.producer.create({
      data: {
        slug: 'demo-producer',
        name: 'Ελληνικοί Παραγωγοί',
        region: 'Κρήτη',
        category: 'Γενική',
        description: 'Συνεργασίες με τοπικούς παραγωγούς σε όλη την Ελλάδα.',
        products: 0,
        isActive: true,
      },
    })
    console.log(`  ✓ Created producer: ${producer.name} (${producer.id})`)
  } else {
    console.log(`  ✓ Using existing producer: ${producer.name} (${producer.id})`)
  }

  // Upsert products (idempotent)
  let created = 0
  let updated = 0

  for (const product of SEED_PRODUCTS) {
    const result = await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        ...product,
        producerId: producer.id,
        price: product.priceCents / 100, // Convert to Float for backwards compat
      },
      update: {
        title: product.title,
        category: product.category,
        priceCents: product.priceCents,
        price: product.priceCents / 100,
        unit: product.unit,
        stock: product.stock,
        description: product.description,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
      },
    })

    // Check if this was a create or update by comparing createdAt/updatedAt
    const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime()
    if (wasCreated) {
      created++
      console.log(`  + Created: ${product.slug}`)
    } else {
      updated++
      console.log(`  ↻ Updated: ${product.slug}`)
    }
  }

  console.log(`\n✓ Seed complete: ${created} created, ${updated} updated, ${SEED_PRODUCTS.length} total`)

  // Update producer product count
  const productCount = await prisma.product.count({ where: { producerId: producer.id } })
  await prisma.producer.update({
    where: { id: producer.id },
    data: { products: productCount },
  })
  console.log(`✓ Updated producer product count: ${productCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
