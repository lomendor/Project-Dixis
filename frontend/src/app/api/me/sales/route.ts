import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET(){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});

  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({error:'No producer'},{status:400});

  const items = await prisma.orderItem.findMany({
    where:{ producerId: me.id },
    orderBy:{ createdAt: 'desc' },
    take: 100
  });

  return NextResponse.json({ items });
}
