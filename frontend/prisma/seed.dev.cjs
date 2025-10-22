const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = Date.now();
  const rows = [
    { id:'A-3001', buyerName:'Μαρία',   total: 42.00, status:'pending',   createdAt:new Date(now-5*864e5) },
    { id:'A-3002', buyerName:'Γιάννης', total: 99.90, status:'paid',      createdAt:new Date(now-4*864e5) },
    { id:'A-3003', buyerName:'Ελένη',   total: 12.00, status:'refunded',  createdAt:new Date(now-3*864e5) },
    { id:'A-3004', buyerName:'Νίκος',   total: 59.00, status:'cancelled', createdAt:new Date(now-2*864e5) },
    { id:'A-3005', buyerName:'Άννα',    total: 19.50, status:'shipped',   createdAt:new Date(now-1*864e5) },
    { id:'A-3006', buyerName:'Κώστας',  total: 31.70, status:'pending',   createdAt:new Date(now-0*864e5) },
  ];
  await prisma.order.deleteMany({});
  await prisma.order.createMany({ data: rows });
  console.log(`Seed(dev): inserted ${rows.length} orders`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
