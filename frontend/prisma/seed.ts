import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo producer first
  const producer = await prisma.producer.upsert({
    where: { slug: 'demo-producer' },
    update: {},
    create: {
      slug: 'demo-producer',
      name: 'Παραγωγός Demo',
      region: 'Κρήτη',
      category: 'Πολυ-κατηγορία',
      description: 'Τοπικός παραγωγός με παραδοσιακά προϊόντα',
      products: 5,
      isActive: true,
    },
  })

  // Create 5 demo products linked to producer
  // Καθάρισε παλιά demo entries για να μην έχουμε διπλά
await prisma.product.deleteMany({ where: { producerId: producer.id, title: { in: [
  'Ελιές Θρούμπες','Μέλι Θυμαρίσιο','Γραβιέρα Νάξου','Ελαιόλαδο Εξαιρετικό','Ρίγανη βουνίσια'
]}}})
const items = [
    { title: 'Ελιές Θρούμπες', category: 'Ελιές', unit: 'τεμ', price: 5.2, stock: 30 },
    { title: 'Μέλι Θυμαρίσιο', category: 'Μέλι', unit: 'τεμ', price: 9.9, stock: 25 },
    { title: 'Γραβιέρα Νάξου', category: 'Γαλακτοκομικά', unit: 'κιλό', price: 14.5, stock: 10 },
    { title: 'Ελαιόλαδο Εξαιρετικό', category: 'Λάδια', unit: 'λίτρο', price: 12.0, stock: 40 },
    { title: 'Ρίγανη βουνίσια', category: 'Βότανα', unit: 'τεμ', price: 2.5, stock: 100 },
  ]

  for (const p of items) {
    await prisma.product.create({
      data: {
        ...p,
        producerId: producer.id,
        isActive: true,
      },
    })
  }

  console.log(`✅ Seeded ${items.length} products for producer: ${producer.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
