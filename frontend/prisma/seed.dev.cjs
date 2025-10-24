const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = Date.now();
  const rows = [
    { id:'A-3001', buyerName:'Μαρία',   buyerPhone:'6900000001', shippingLine1:'Οδός 1', shippingCity:'Αθήνα', shippingPostal:'10001', total: 42.00, status:'pending',   createdAt:new Date(now-5*864e5) },
    { id:'A-3002', buyerName:'Γιάννης', buyerPhone:'6900000002', shippingLine1:'Οδός 2', shippingCity:'Θεσσαλονίκη', shippingPostal:'54001', total: 99.90, status:'paid',      createdAt:new Date(now-4*864e5) },
    { id:'A-3003', buyerName:'Ελένη',   buyerPhone:'6900000003', shippingLine1:'Οδός 3', shippingCity:'Πάτρα', shippingPostal:'26001', total: 12.00, status:'refunded',  createdAt:new Date(now-3*864e5) },
    { id:'A-3004', buyerName:'Νίκος',   buyerPhone:'6900000004', shippingLine1:'Οδός 4', shippingCity:'Ηράκλειο', shippingPostal:'71001', total: 59.00, status:'cancelled', createdAt:new Date(now-2*864e5) },
    { id:'A-3005', buyerName:'Άννα',    buyerPhone:'6900000005', shippingLine1:'Οδός 5', shippingCity:'Λάρισα', shippingPostal:'41001', total: 19.50, status:'shipped',   createdAt:new Date(now-1*864e5) },
    { id:'A-3006', buyerName:'Κώστας',  buyerPhone:'6900000006', shippingLine1:'Οδός 6', shippingCity:'Βόλος', shippingPostal:'38001', total: 31.70, status:'pending',   createdAt:new Date(now-0*864e5) },
  ];
  await prisma.order.deleteMany({});
  await prisma.order.createMany({ data: rows });
  console.log(`Seed(dev): inserted ${rows.length} orders`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
