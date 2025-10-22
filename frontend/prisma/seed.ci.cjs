const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = [
    { id:'T-1001', buyerName:'CI User', total: 10.00, status:'paid',      createdAt:new Date() },
    { id:'T-1002', buyerName:'CI User', total: 20.00, status:'pending',   createdAt:new Date() },
    { id:'T-1003', buyerName:'CI User', total: 30.00, status:'shipped',   createdAt:new Date() },
  ];
  await prisma.order.deleteMany({});
  await prisma.order.createMany({ data: rows });
  console.log(`Seed(CI): inserted ${rows.length} orders`);
}
main().catch(e => { console.error(e); process.exit(0); }).finally(() => prisma.$disconnect());
