import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ops = process.env.OPS_ADMIN_TOKEN;
  if (!ops || req.headers.get('x-ops-token') !== ops) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Find orders without publicToken and generate UUIDs
  const ordersToUpdate = await prisma.order.findMany({
    where: {
      OR: [
        { publicToken: null },
        { publicToken: '' }
      ]
    },
    select: { id: true }
  });

  let updated = 0;
  for (const order of ordersToUpdate) {
    await prisma.order.update({
      where: { id: order.id },
      data: { publicToken: crypto.randomUUID() }
    });
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
