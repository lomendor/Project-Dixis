import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';

export async function GET(){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({ items: [] });
  const items = await prisma.orderItem.findMany({
    where:{ producerId: me.id },
    orderBy:{ createdAt:'desc' }
  });
  return NextResponse.json({ items });
}
