import { NextResponse } from 'next/server'
import { readCart, writeCart, addItem, removeItem, totalCents } from '@/lib/cart'

// Feature flag μέσω env (default ON για τώρα)
const CART_ENABLED = process.env.CART_V1 !== 'off'

export async function GET() {
  if (!CART_ENABLED) return NextResponse.json({ enabled:false, items:[], totalCents:0 }, { status:200 })
  const cart = await readCart()
  return NextResponse.json({ enabled:true, items: cart.items, totalCents: totalCents(cart) }, { status:200 })
}

export async function POST(req: Request) {
  if (!CART_ENABLED) return NextResponse.json({ ok:false, reason:'disabled' }, { status:403 })
  const body = await req.json().catch(() => ({}))
  const { id, title, priceCents } = body || {}
  if (!id || !title || typeof priceCents !== 'number') {
    return NextResponse.json({ ok:false, reason:'invalid' }, { status:400 })
  }
  const cart = addItem(await readCart(), { id, title, priceCents }, 1)
  await writeCart(cart)
  return NextResponse.json({ ok:true, count: cart.items.length, totalCents: totalCents(cart) }, { status:200 })
}

export async function DELETE(req: Request) {
  if (!CART_ENABLED) return NextResponse.json({ ok:false, reason:'disabled' }, { status:403 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (id === 'all') { await writeCart({ items: [] }); return NextResponse.json({ ok:true }) }
  if (!id) return NextResponse.json({ ok:false, reason:'missing id' }, { status:400 })
  const cart = removeItem(await readCart(), id)
  await writeCart(cart)
  return NextResponse.json({ ok:true, count: cart.items.length, totalCents: totalCents(cart) })
}
