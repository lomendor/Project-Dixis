'use client';
import { useRouter } from 'next/navigation';
import { useTransition, useRef } from 'react';

type CartItem = { slug: string; qty: number; name?: string; price?: number; currency?: string };

export default function CartClient({ items }: { items: CartItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // AG116.3: One-shot guard to prevent mobile refresh loops
  const refreshingRef = useRef(false);
  const safeRefresh = () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    router.refresh();
    setTimeout(() => { refreshingRef.current = false; }, 500);
  };

  const updateQty = (slug: string, qty: number) => {
    startTransition(async () => {
      await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, qty }),
      });
      safeRefresh();
    });
  };

  const removeItem = (slug: string) => {
    startTransition(async () => {
      await fetch(`/api/cart?slug=${slug}`, { method: 'DELETE' });
      safeRefresh();
    });
  };

  const clearCart = () => {
    startTransition(async () => {
      await fetch('/api/cart', { method: 'DELETE' });
      safeRefresh();
    });
  };

  if (!items.length) {
    return <p className="text-gray-500">Το καλάθι σας είναι άδειο.</p>;
  }

  return (
    <div style={{ opacity: isPending ? 0.6 : 1 }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Προϊόν</th>
            <th className="p-2 text-left">Τιμή</th>
            <th className="p-2 text-left">Ποσότητα</th>
            <th className="p-2 text-left">Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.slug} className="border-b">
              <td className="p-2">{item.name ?? item.slug}</td>
              <td className="p-2">
                {typeof item.price === 'number'
                  ? `${item.price.toFixed(2)} ${item.currency ?? 'EUR'}`
                  : '-'}
              </td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.slug, item.qty - 1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={isPending}
                  >
                    -
                  </button>
                  <span className="min-w-[2rem] text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.slug, item.qty + 1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={isPending}
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="p-2">
                <button
                  onClick={() => removeItem(item.slug)}
                  className="px-3 py-1 text-red-600 hover:text-red-800"
                  disabled={isPending}
                >
                  Αφαίρεση
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={clearCart}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        disabled={isPending}
      >
        Καθαρισμός καλαθιού
      </button>
    </div>
  );
}
