import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type CartItem = { slug: string; qty: number };
const CK = 'cart';

async function readCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const c = cookieStore.get(CK)?.value;
  if (!c) return [];
  try { return JSON.parse(c); } catch { return []; }
}
async function writeCart(items: CartItem[]) {
  const res = NextResponse.json({ ok: true, items });
  res.cookies.set(CK, JSON.stringify(items), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return res;
}

export async function GET() {
  const items = await readCart();
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  return NextResponse.json({ items, totalItems });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug = (body?.slug || '').trim();
  const qty = Math.max(1, Math.min(99, Number(body?.qty ?? 1)));
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 });

  // validate product exists (slug is just an identifier passed in the cart)
  // We store it as-is in the cart cookie without validation for simplicity
  // In a real app, you'd validate the slug maps to a real product

  const items = await readCart();
  const idx = items.findIndex(i => i.slug === slug);
  if (idx >= 0) items[idx].qty = Math.min(99, items[idx].qty + qty);
  else items.push({ slug, qty });

  return writeCart(items);
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, items: [] });
  res.cookies.set(CK, '[]', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return res;
}
