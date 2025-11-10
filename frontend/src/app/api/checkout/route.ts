import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Item = { slug: string; qty: number };
type Customer = { email: string; name?: string; phone?: string; address?: string; city?: string; zip?: string };
type Zone = 'mainland' | 'islands';

function bad(msg: string, code=400){ return NextResponse.json({ error: msg }, { status: code }); }

async function computeShipping(items: Item[], zone: Zone){
  try{
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/v1/shipping/quote`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ items, zone })
    });
    const data = await res.json().catch(()=>({ total:0, threshold:35 }));
    return Number(data?.total ?? 0);
  }catch{ return 0; }
}

export async function POST(req: NextRequest) {
  const idem = req.headers.get('x-idempotency-key') ?? '';
  const body = await req.json().catch(()=> ({}));
  const items: Item[] = Array.isArray(body?.items) ? body.items : [];
  const zone: Zone = (body?.zone === 'islands' ? 'islands' : 'mainland');
  const customer: Customer = body?.customer ?? {};

  if (!customer?.email || !items.length) return bad('Missing email or items');

  const slugs = items.map(i => i.slug);
  const prods = await prisma.product.findMany({
    where: { id: { in: slugs } },
    select: { id:true, title:true, price:true }
  });
  const bySlug = new Map<string, any>();
  for (const p of prods) bySlug.set(p.id, p);

  let subtotal = 0;
  const lines = items.map(i=>{
    const p = bySlug.get(i.slug);
    const price = Number(p?.price ?? 0);
    const qty = Math.max(0, Number(i.qty) || 0);
    subtotal += price * qty;
    return {
      productId: p?.id ?? null,
      slug: i.slug,
      qty,
      price,
      currency: 'EUR'
    };
  });

  const shipping = await computeShipping(items, zone);
  const total = Math.max(0, subtotal + shipping);

  if (idem) {
    const existing = await prisma.order.findFirst({
      where: { email: customer.email, total: total }
    });
    if (existing) return NextResponse.json({ orderId: existing.id, total, shipping, subtotal });
  }

  const order = await prisma.order.create({
    data: {
      email: customer.email,
      name: customer.name ?? null,
      phone: customer.phone ?? null,
      address: customer.address ?? null,
      city: customer.city ?? null,
      zip: customer.zip ?? null,
      zone,
      subtotal: subtotal.toFixed(2) as any,
      shipping: shipping.toFixed(2) as any,
      total: total,
      currency: 'EUR',
      items: {
        create: lines.map(l => ({
          productId: l.productId,
          producerId: null,
          slug: l.slug,
          qty: l.qty,
          price: l.price,
          currency: l.currency
        }))
      }
    },
    select: { id:true }
  });

  const res = NextResponse.json({ orderId: order.id, total, shipping, subtotal });
  res.headers.set('Set-Cookie', 'cart=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  return res;
}
