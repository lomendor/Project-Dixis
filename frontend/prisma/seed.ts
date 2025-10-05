import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const producers = [
    {
      slug: 'agroktima-aiges',
      name: 'Αγρόκτημα Αιγές',
      region: 'Μακεδονία',
      category: 'Γαλακτοκομικά',
      description: 'Παραδοσιακά τυροκομικά προϊόντα από ελεύθερα βοσκόμενα ζώα',
      phone: '+30 23510 12345',
      email: 'info@agroktima-aiges.gr',
      products: 12,
      rating: 4.8,
      isActive: true
    },
    {
      slug: 'meli-olympou',
      name: 'Μέλι Ολύμπου',
      region: 'Θεσσαλία',
      category: 'Μέλι',
      description: 'Βιολογικό μέλι από τις πλαγιές του Ολύμπου',
      phone: '+30 23520 67890',
      email: 'contact@meli-olympou.gr',
      products: 8,
      rating: 4.9,
      isActive: true
    },
    {
      slug: 'tyrokomeio-kritis',
      name: 'Τυροκομείο Κρήτης',
      region: 'Κρήτη',
      category: 'Τυροκομικά',
      description: 'Κρητικά τυριά με παράδοση τριών γενεών',
      phone: '+30 28210 11111',
      email: 'sales@tyrokomeio-kritis.gr',
      products: 15,
      rating: 4.7,
      isActive: true
    }
  ];

  for (const producer of producers) {
    await prisma.producer.upsert({
      where: { slug: producer.slug },
      update: {},
      create: producer
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
