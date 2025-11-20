import { cookies } from 'next/headers'

export type CartItem = { id: string; title: string; priceCents: number; qty: number }
export type Cart = { items: CartItem[] }

const NAME = 'dixis_cart'

export async function readCart(): Promise<Cart> {
  const jar = await cookies()
  const raw = jar.get(NAME)?.value
  if (!raw) return { items: [] }
  try {
    const data = JSON.parse(raw) as Cart
    if (!Array.isArray(data.items)) return { items: [] }
    return { items: data.items.map(i => ({ ...i, qty: Number(i.qty||1) })) }
  } catch { return { items: [] } }
}

export async function writeCart(cart: Cart) {
  const jar = await cookies()
  jar.set(NAME, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60*60*24*7
  })
}

export function addItem(cart: Cart, item: Omit<CartItem, 'qty'>, qty=1): Cart {
  const idx = cart.items.findIndex(i => i.id === item.id)
  if (idx >= 0) {
    cart.items[idx].qty += qty
  } else {
    cart.items.push({ ...item, qty })
  }
  return cart
}

export function removeItem(cart: Cart, id: string): Cart {
  return { items: cart.items.filter(i => i.id !== id) }
}

export function totalCents(cart: Cart): number {
  return cart.items.reduce((s, i) => s + i.priceCents * i.qty, 0)
}
