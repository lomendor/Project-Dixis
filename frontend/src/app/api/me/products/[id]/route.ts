import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ProductUpdate } from '@/lib/validators/product';
import { getSessionPhone } from '@/lib/auth/session';
import { Prisma } from '@prisma/client';

export async function PATCH(req: Request, { params }:{ params:{ id:string }}){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({error:'No producer'},{status:400});

  const body = await req.json().catch(():null=>null);
  const parsed = ProductUpdate.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:'Λάθος στοιχεία', details: parsed.error},{status:400});
  const upd:any = parsed.data;
  if(typeof upd.price === 'number') upd.price = new Prisma.Decimal(upd.price);

  // Ensure ownership
  const target = await prisma.product.findUnique({ where:{ id: params.id }});
  if(!target || target.producerId !== me.id) return NextResponse.json({error:'Forbidden'},{status:403});

  const updated = await prisma.product.update({ where:{ id: params.id }, data: upd });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_: Request, { params }:{ params:{ id:string }}){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({error:'No producer'},{status:400});

  const target = await prisma.product.findUnique({ where:{ id: params.id }});
  if(!target || target.producerId !== me.id) return NextResponse.json({error:'Forbidden'},{status:403});

  const deleted = await prisma.product.update({ where:{ id: params.id }, data:{ isActive:false }});
  return NextResponse.json({ item: deleted });
}
