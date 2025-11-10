export const dynamic = 'force-dynamic';
import CartClient from '@/components/cart/CartClient';
import CartTotalsClient from '@/components/cart/CartTotalsClient';

async function fetchCart() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const r = await fetch(`${baseUrl}/api/cart`, { cache: 'no-store' });
    if (!r.ok) return { items: [], totalItems: 0, subtotal: 0, currency: 'EUR' };
    return await r.json();
  } catch {
    return { items: [], totalItems: 0, subtotal: 0, currency: 'EUR' };
  }
}

async function fetchShipping(items: {slug:string; qty:number}[], zone: 'mainland'|'islands'='mainland') {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const r = await fetch(`${baseUrl}/api/v1/shipping/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, zone }),
      cache: 'no-store'
    });
    if (!r.ok) return { total: 0, threshold: 35, zone };
    return await r.json();
  } catch {
    return { total: 0, threshold: 35, zone };
  }
}

export default async function CartPage() {
  const cart = await fetchCart();
  const items = (cart.items ?? []) as { slug:string; qty:number; price?:number; name?:string }[];
  const init = await fetchShipping(items.map(i => ({ slug: i.slug, qty: i.qty })));
  const subtotal = Number(cart.subtotal ?? 0);
  const currency = cart.currency ?? 'EUR';
  const threshold = Number(init?.threshold ?? process.env.NEXT_PUBLIC_SHIP_FREE_THRESHOLD_EUR ?? 35);
  const initialZone = (init?.zone === 'islands' ? 'islands' : 'mainland') as 'mainland'|'islands';

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Το Καλάθι μου</h1>
      <CartClient items={items} />
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <CartTotalsClient items={items} subtotal={subtotal} currency={currency}
                          initialZone={initialZone} threshold={threshold} />
      </section>
    </main>
  );
}
