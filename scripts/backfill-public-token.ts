import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('[backfill] Starting publicToken backfill...');

  // Find orders without publicToken
  const ordersWithoutToken = await prisma.order.findMany({
    where: {
      OR: [
        { publicToken: null },
        { publicToken: '' }
      ]
    },
    select: { id: true }
  });

  console.log(`[backfill] Found ${ordersWithoutToken.length} orders without publicToken`);

  let updated = 0;
  for (const order of ordersWithoutToken) {
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { publicToken: randomUUID() }
      });
      updated++;
      console.log(`[backfill] ✓ Updated order ${order.id}`);
    } catch (error) {
      console.error(`[backfill] ✗ Failed to update order ${order.id}:`, error);
    }
  }

  console.log(`[backfill] Completed! Updated ${updated}/${ordersWithoutToken.length} orders`);
}

main()
  .then(() => {
    console.log('[backfill] Done');
    process.exit(0);
  })
  .catch((e) => {
    console.error('[backfill] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
