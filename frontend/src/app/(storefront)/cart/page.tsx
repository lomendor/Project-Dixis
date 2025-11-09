import CartClient from '@/components/cart/CartClient';
import { cookies } from 'next/headers';

type CartItem = { slug: string; qty: number };

async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const c = cookieStore.get('cart')?.value;
  if (!c) return [];
  try { return JSON.parse(c); } catch { return []; }
}

export default async function CartPage() {
  const items = await getCart();
  return (
    <div>
      <h1>Το Καλάθι μου</h1>
      <CartClient items={items} />
    </div>
  );
}
