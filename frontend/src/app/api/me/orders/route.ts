import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';

export async function GET(){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const orders = await prisma.order.findMany({
    where:{ buyerPhone: phone },
    orderBy:{ createdAt: 'desc' },
    include:{ items: true }
  });
  return NextResponse.json({ items: orders });
}
