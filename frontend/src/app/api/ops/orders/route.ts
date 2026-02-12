import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

function unauthorized(msg='Unauthorized'){ return NextResponse.json({ error: msg }, { status: 401 }); }

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-ops-token') || '';
  const expected = process.env.OPS_ADMIN_TOKEN || '';
  if (!expected) return NextResponse.json({ error: 'OPS_ADMIN_TOKEN not set' }, { status: 503 });
  if (token !== expected) return unauthorized();

  const { searchParams } = new URL(req.url);
  const take = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '50')));
  const cursor = searchParams.get('cursor') || undefined;

  const orders = await prisma.order.findMany({
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, createdAt: true, email: true, subtotal: true, shipping: true, total: true, currency: true,
      items: { select: { id: true, slug: true, qty: true, price: true, currency: true } }
    }
  });

  const nextCursor = orders.length === take ? orders[orders.length - 1].id : null;
  return NextResponse.json({
    items: orders.map(o => ({
      ...o,
      subtotal: Number(o.subtotal), shipping: Number(o.shipping), total: Number(o.total)
    })),
    nextCursor
  });
}
