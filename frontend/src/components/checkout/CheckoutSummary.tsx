'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, cartCount, cartTotalCents } from '@/lib/cart';
import { apiClient } from '@/lib/api';

export default function CheckoutSummary(){
  const router = useRouter();
  const cartItems = useCart(s => s.items);
  const clearCart = useCart(s => s.clear);
  const items = Object.values(cartItems); // Convert Record to array
  const count = cartCount(cartItems);
  const total = cartTotalCents(cartItems) / 100; // Convert cents to EUR
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState<string|undefined>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault(); setErr(undefined); setSubmitting(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      customer: {
        name: (fd.get('name')||'').toString().trim(),
        email: (fd.get('email')||'').toString().trim(),
        phone: (fd.get('phone')||'').toString().trim(),
        address: (fd.get('address')||'').toString().trim(),
        city: (fd.get('city')||'').toString().trim(),
        postcode: (fd.get('postcode')||'').toString().trim(),
        notes: (fd.get('notes')||'').toString().trim(),
      },
      items,
      totals: { items: total, shipping: 0, grand: total },
      ts: Date.now()
    };
    // basic validation
    if (!payload.customer.name || !payload.customer.phone || !payload.customer.address || !payload.customer.city || !payload.customer.postcode) {
      setErr('Συμπλήρωσε τα βασικά στοιχεία αποστολής.'); setSubmitting(false); return;
    }
    try {
      // Create order via Laravel API (persists to PostgreSQL)
      const orderData = {
        items: items.map(item => ({
          product_id: parseInt(item.id.toString()),
          quantity: item.qty
        })),
        currency: 'EUR' as const,
        shipping_method: 'HOME' as const,
        notes: payload.customer.notes || ''
      };

      const order = await apiClient.createOrder(orderData);

      // Store payload in sessionStorage for confirmation page display
      sessionStorage.setItem('dixis:last-order', JSON.stringify(payload));

      // Clear cart after successful order creation
      clearCart();

      // Redirect to confirmation page
      router.push('/checkout/confirmation');
    } catch (e) {
      console.error('Order creation failed:', e);
      setErr('Σφάλμα κατά τη δημιουργία παραγγελίας. Παρακαλώ δοκιμάστε ξανά.');
      setSubmitting(false);
    }
  };

  if (count===0) return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Ταμείο</h1>
      <p className="text-neutral-600">Το καλάθι είναι άδειο. <Link className="underline" href="/products">Δες προϊόντα</Link></p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <section className="md:col-span-3">
        <h1 className="text-2xl font-bold mb-2">Ταμείο</h1>
        <p className="text-sm text-neutral-600 mb-4">Συμπλήρωσε τα στοιχεία αποστολής σου.</p>
        {err ? <p className="text-sm text-red-600 mb-3">{err}</p> : null}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Ονοματεπώνυμο *" className="h-10 px-3 border rounded-md" required />
            <input name="phone" placeholder="Τηλέφωνο *" className="h-10 px-3 border rounded-md" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="email" name="email" placeholder="Email" className="h-10 px-3 border rounded-md" />
            <input name="postcode" placeholder="ΤΚ *" className="h-10 px-3 border rounded-md" required />
          </div>
          <input name="address" placeholder="Διεύθυνση *" className="h-10 px-3 w-full border rounded-md" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="city" placeholder="Πόλη *" className="h-10 px-3 border rounded-md" required />
            <input name="notes" placeholder="Σημειώσεις (προαιρετικά)" className="h-10 px-3 border rounded-md" />
          </div>
          <button disabled={submitting} className="h-10 px-4 rounded-md bg-brand text-white text-sm">
            {submitting ? 'Ολοκλήρωση…' : 'Ολοκλήρωση παραγγελίας'}
          </button>
        </form>
      </section>

      <aside className="md:col-span-2">
        <div className="border rounded-md p-3 bg-white">
          <h2 className="text-sm font-semibold">Σύνοψη</h2>
          <ul className="divide-y mt-2">
            {items.map(it => (
              <li key={it.id} className="py-2 flex justify-between text-sm">
                <span className="text-neutral-700">{it.title} × {it.qty}</span>
                <span className="font-medium">{((it.priceCents * it.qty) / 100).toFixed(2)} EUR</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-sm mt-3 text-neutral-600"><span>Μεταφορικά</span><span>—</span></div>
          <div className="flex justify-between text-base font-semibold mt-2"><span>Σύνολο</span><span>{total.toFixed(2)} EUR</span></div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">* Πρόχειρο ταμείο (demo). Η έκδοση με πραγματική πληρωμή έπεται.</p>
      </aside>
    </div>
  );
}
