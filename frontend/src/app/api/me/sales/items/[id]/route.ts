import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';
import { z } from 'zod';

export const runtime = 'nodejs';

const Body = z.object({ status: z.enum(['ACCEPTED','REJECTED','FULFILLED']) });

async function recalcOrderStatus(orderId: string){
  const items = await prisma.orderItem.findMany({ where:{ orderId }, select:{ status:true }});
  const allOff = items.every(i => i.status==='REJECTED' || i.status==='CANCELLED');
  await prisma.order.update({ where:{ id: orderId }, data:{ status: allOff ? 'CANCELLED' : 'PLACED' }});
}

export async function PATCH(req: Request, { params }:{ params:{ id:string }}){
  const phone = await getSessionPhone(); if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({error:'No producer'},{status:400});
  const body = await req.json().catch((): null =>null);
  const parsed = Body.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:'Bad body'},{status:400});

  const item = await prisma.orderItem.findUnique({ where:{ id: params.id }});
  if(!item || item.producerId !== me.id) return NextResponse.json({error:'Forbidden'},{status:403});

  const from = item.status, to = parsed.data.status;
  const ok =
    (from==='PLACED' && (to==='ACCEPTED' || to==='REJECTED')) ||
    (from==='ACCEPTED' && to==='FULFILLED');
  if(!ok) return NextResponse.json({error:'Invalid transition'},{status:400});

  // transaction: update status (+ stock return on first REJECTED)
  const updated = await prisma.$transaction(async (tx)=>{
    // Return stock only when transitioning TO REJECTED for the first time
    if (to==='REJECTED' && from==='PLACED'){
      await tx.product.update({ where:{ id: item.productId }, data:{ stock: { increment: item.qty } }});
    }
    const it = await tx.orderItem.update({ where:{ id: item.id }, data:{ status: to }});
    await recalcOrderStatus(item.orderId);
    return it;
  });

  // dev notification
  try {
    const path = await import('path'); const fs = await import('fs');
    if (process.env.NODE_ENV !== 'production'){
      const dir = path.default.join(process.cwd(),'frontend','.tmp','mails');
      await fs.promises.mkdir(dir,{recursive:true});
      await fs.promises.writeFile(path.default.join(dir, `${Date.now()}-status-${updated.id}.json`), JSON.stringify({ type:'producer-item-status', itemId: updated.id, orderId: updated.orderId, status: updated.status }, null, 2));
    }
  } catch {}

  return NextResponse.json({ item: updated });
}
