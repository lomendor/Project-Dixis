const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient();
function costFrom(method, base=3.5, codFee=2.0){
  if(!method || method==='PICKUP') return 0;
  if(method==='COURIER_COD') return Number((base + codFee).toFixed(2));
  return Number((base).toFixed(2));
}
(async ()=>{
  const updates=[];
  const orders = await prisma.order.findMany({ select:{ id:true, publicToken:true, shippingMethod:true, computedShipping:true }});
  for (const o of orders){
    const data = {};
    if (!o.publicToken || o.publicToken.trim()===''){ data.publicToken = (Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,10)).toLowerCase(); }
    if (o.computedShipping==null){
      const m = String(o.shippingMethod||'').toUpperCase();
      data.computedShipping = costFrom(m);
    }
    if (Object.keys(data).length>0){
      updates.push(prisma.order.update({ where:{ id:o.id }, data }));
    }
  }
  if (updates.length){ await Promise.all(updates); }
  // Επαλήθευση uniqueness
  const dups = await prisma.$queryRawUnsafe(`SELECT publicToken, COUNT(*) c FROM "Order" GROUP BY publicToken HAVING COUNT(*)>1`);
  if (Array.isArray(dups) && dups.length){ console.error('Duplicate tokens:', dups); process.exit(2); }
  console.log('Backfill done; no duplicates.');
  await prisma.$disconnect();
})().catch(e=>{ console.error(e); process.exit(1); });
