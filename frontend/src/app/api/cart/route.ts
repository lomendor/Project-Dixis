import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

type CartItem = { slug: string; qty: number };
const CK = 'cart';
const secure = process.env.NODE_ENV === 'production';

async function readCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const c = cookieStore.get(CK)?.value;
  if (!c) return [];
  try { return JSON.parse(c); } catch { return []; }
}

async function writeCart(items: CartItem[]) {
  const res = NextResponse.json({ ok: true, items, totalItems: items.reduce((s,i)=>s+i.qty,0) });
  const cookieStore = await cookies();
  cookieStore.set(CK, JSON.stringify(items), { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  return res;
}

export async function GET() {
  const items = await readCart();
  return NextResponse.json({ items, totalItems: items.reduce((s,i)=>s+i.qty,0) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug = (body?.slug || '').trim();
  const qty = Math.max(1, Math.min(99, Number(body?.qty ?? 1)));
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 });

  const exists = await prisma.product.findUnique({ where: { id: slug }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: 'unknown product' }, { status: 404 });

  const items = await readCart();
  const idx = items.findIndex(i => i.slug === slug);
  if (idx >= 0) items[idx].qty = Math.min(99, items[idx].qty + qty);
  else items.push({ slug, qty });
  return await writeCart(items);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug = (body?.slug || '').trim();
  const qty = Number(body?.qty ?? NaN);
  if (!slug || Number.isNaN(qty)) return NextResponse.json({ error: 'missing slug/qty' }, { status: 400 });

  const items = await readCart();
  const idx = items.findIndex(i => i.slug === slug);
  if (idx < 0) return NextResponse.json({ error: 'not in cart' }, { status: 404 });

  if (qty <= 0) items.splice(idx,1); else items[idx].qty = Math.min(99, qty);
  return await writeCart(items);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get('slug') || '').trim();
  if (!slug) return await writeCart([]);
  const items = await readCart();
  return await writeCart(items.filter(i => i.slug !== slug));
}
