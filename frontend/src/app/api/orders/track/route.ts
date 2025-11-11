import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function handle(bodyOrQuery: any) {
  const token = String(bodyOrQuery?.token ?? '').trim();
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const ord = await prisma.order.findFirst({
    where: { publicToken: token },
    include: { items: true }
  });

  if (!ord) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: ord.id,
    createdAt: ord.createdAt,
    email: ord.email,
    subtotal: Number(ord.subtotal ?? 0),
    shipping: Number(ord.shipping ?? 0),
    total: Number(ord.total ?? 0),
    currency: ord.currency ?? 'EUR',
    items: ord.items.map(it => ({
      id: it.id,
      slug: it.slug,
      qty: it.qty,
      price: Number(it.price),
      currency: it.currency
    })),
    token: ord.publicToken,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  return handle({ token });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return handle(body);
}
