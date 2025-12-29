/**
 * CI-only seed script for deterministic E2E testing
 * Pass E2E-SEED-01: Creates minimal producer + product data for e2e-full suite
 *
 * SAFETY: This script ONLY runs with CI schema (schema.ci.prisma → SQLite)
 * It will NOT affect production or development databases
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Deterministic IDs for stable test selectors
const CI_PRODUCER_ID = 'ci-producer-001'
const CI_CONSUMER_ID = 'ci-consumer-001'

const CI_PRODUCTS = [
  {
    id: 'ci-product-001',
    slug: 'ci-tomatoes-organic',
    title: 'Τομάτες Βιολογικές',
    category: 'Λαχανικά',
    price: 2.90,
    unit: 'kg',
    stock: 100,
    description: 'CI Test Product - Organic tomatoes',
  },
  {
    id: 'ci-product-002',
    slug: 'ci-honey-thyme',
    title: 'Μέλι Θυμαρίσιο 500g',
    category: 'Μέλι',
    price: 12.50,
    unit: 'jar',
    stock: 50,
    description: 'CI Test Product - Thyme honey',
  },
  {
    id: 'ci-product-003',
    slug: 'ci-olive-oil-1l',
    title: 'Ελαιόλαδο Έξτρα Παρθένο 1L',
    category: 'Λάδι',
    price: 15.00,
    unit: 'bottle',
    stock: 30,
    description: 'CI Test Product - Extra virgin olive oil',
  },
]

async function main() {
  console.log('🌱 CI Seed: Starting deterministic E2E data seed...')

  // Safety check: refuse production URLs
  const url = process.env.DATABASE_URL || ''
  if (url.includes('neon.tech') || url.includes('prod')) {
    throw new Error('SAFETY: Refusing to seed on production DATABASE_URL')
  }

  // 1. Create CI Producer
  const producer = await prisma.producer.upsert({
    where: { id: CI_PRODUCER_ID },
    update: {
      name: 'CI Test Producer',
      slug: 'ci-test-producer',
      region: 'Αττική',
      category: 'Λαχανικά',
      description: 'Deterministic CI test producer for E2E',
      isActive: true,
      approvalStatus: 'approved',
    },
    create: {
      id: CI_PRODUCER_ID,
      slug: 'ci-test-producer',
      name: 'CI Test Producer',
      region: 'Αττική',
      category: 'Λαχανικά',
      description: 'Deterministic CI test producer for E2E',
      isActive: true,
      approvalStatus: 'approved',
    },
  })
  console.log(`✅ Producer: ${producer.name} (${producer.id})`)

  // 2. Create CI Products
  for (const p of CI_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        description: p.description,
        isActive: true,
        producerId: CI_PRODUCER_ID,
      },
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        description: p.description,
        isActive: true,
        producerId: CI_PRODUCER_ID,
      },
    })
    console.log(`✅ Product: ${product.title} (€${product.price})`)
  }

  // 3. Create CI Consumer (for authenticated tests)
  // Note: User model may not exist in Prisma schema - check if it does
  try {
    // @ts-expect-error - User model may not exist in all schemas
    if (prisma.user) {
      // @ts-expect-error - conditional access
      await prisma.user.upsert({
        where: { id: CI_CONSUMER_ID },
        update: {
          email: 'ci-consumer@test.dixis.gr',
          name: 'CI Test Consumer',
        },
        create: {
          id: CI_CONSUMER_ID,
          email: 'ci-consumer@test.dixis.gr',
          name: 'CI Test Consumer',
        },
      })
      console.log('✅ Consumer: ci-consumer@test.dixis.gr')
    }
  } catch {
    console.log('ℹ️  User model not in schema, skipping consumer seed')
  }

  // Verify counts
  const productCount = await prisma.product.count({ where: { isActive: true } })
  const producerCount = await prisma.producer.count({ where: { isActive: true } })

  console.log('')
  console.log('🎯 CI Seed Complete:')
  console.log(`   Producers: ${producerCount}`)
  console.log(`   Products:  ${productCount}`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ CI Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
