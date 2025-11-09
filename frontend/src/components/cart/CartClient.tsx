'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type CartItem = { slug: string; qty: number };

export default function CartClient({ items }: { items: CartItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateQty = (slug: string, qty: number) => {
    startTransition(async () => {
      await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, qty }),
      });
      router.refresh();
    });
  };

  const removeItem = (slug: string) => {
    startTransition(async () => {
      await fetch(`/api/cart?slug=${slug}`, { method: 'DELETE' });
      router.refresh();
    });
  };

  const clearCart = () => {
    startTransition(async () => {
      await fetch('/api/cart', { method: 'DELETE' });
      router.refresh();
    });
  };

  if (!items.length) {
    return <p>Το καλάθι σας είναι άδειο.</p>;
  }

  return (
    <div style={{ opacity: isPending ? 0.6 : 1 }}>
      <h2>Καλάθι</h2>
      <ul>
        {items.map((item) => (
          <li key={item.slug}>
            {item.slug} - Qty: {item.qty}{' '}
            <button onClick={() => updateQty(item.slug, item.qty + 1)}>+</button>
            <button onClick={() => updateQty(item.slug, item.qty - 1)}>-</button>
            <button onClick={() => removeItem(item.slug)}>Αφαίρεση</button>
          </li>
        ))}
      </ul>
      <button onClick={clearCart}>Καθαρισμός καλαθιού</button>
    </div>
  );
}
