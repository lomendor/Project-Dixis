import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST(_: Request, { params }:{ params:{ id:string }}){
  const phone = await getSessionPhone(); if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const order = await prisma.order.findUnique({ where:{ id: params.id }, include:{ items:true }});
  if(!order || order.buyerPhone !== phone) return NextResponse.json({error:'Not found'},{status:404});
  // Only if all items are PLACED
  if(!order.items.every(i=>i.status==='PLACED')) return NextResponse.json({error:'Η παραγγελία δεν μπορεί να ακυρωθεί'},{status:400});

  await prisma.$transaction(async (tx)=>{
    for(const it of order.items){
      await tx.orderItem.update({ where:{ id: it.id }, data:{ status:'CANCELLED' }});
      await tx.product.update({ where:{ id: it.productId }, data:{ stock: { increment: it.qty } }});
    }
    await tx.order.update({ where:{ id: order.id }, data:{ status:'CANCELLED' }});
  });

  // dev notification
  try {
    const path = await import('path'); const fs = await import('fs');
    if (process.env.NODE_ENV !== 'production'){
      const dir = path.default.join(process.cwd(),'frontend','.tmp','mails');
      await fs.promises.mkdir(dir,{recursive:true});
      await fs.promises.writeFile(path.default.join(dir, `${Date.now()}-order-cancel-${order.id}.json`), JSON.stringify({ type:'buyer-order-cancel', orderId: order.id }, null, 2));
    }
  } catch {}

  return NextResponse.json({ ok:true });
}
