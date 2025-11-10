export const dynamic = 'force-dynamic';
import CartClient from '@/components/cart/CartClient';

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

async function fetchShipping(items: {slug:string; qty:number}[]) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const r = await fetch(`${baseUrl}/api/v1/shipping/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      cache: 'no-store'
    });
    if (!r.ok) return { total: 0 };
    const data = await r.json();
    return typeof data?.total === 'number' ? data : { total: 0 };
  } catch {
    return { total: 0 };
  }
}

export default async function CartPage() {
  const cart = await fetchCart();
  const items = (cart.items ?? []) as { slug:string; qty:number; price?:number; name?:string }[];
  const shipping = await fetchShipping(items.map(i => ({ slug: i.slug, qty: i.qty })));
  const subtotal = Number(cart.subtotal ?? 0);
  const shippingTotal = Number(shipping.total ?? 0);
  const grandTotal = Math.max(0, subtotal + shippingTotal);
  const currency = cart.currency ?? 'EUR';

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Το Καλάθι μου</h1>
      <CartClient items={items} />
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Σύνοψη Παραγγελίας</h2>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between">
              <dt>Υποσύνολο</dt>
              <dd>{subtotal.toFixed(2)} {currency}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Μεταφορικά</dt>
              <dd>{shippingTotal.toFixed(2)} {currency}</dd>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <dt>Σύνολο</dt>
              <dd data-testid="cart-grand-total">{grandTotal.toFixed(2)} {currency}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
