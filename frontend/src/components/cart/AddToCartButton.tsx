'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ slug, qty = 1 }: { slug: string; qty?: number }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    try {
      setBusy(true);
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, qty })
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart:updated'));
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      data-testid="add-to-cart"
      onClick={onClick}
      disabled={busy}
      className="mt-2 text-sm px-3 py-1 border rounded hover:bg-neutral-50 disabled:opacity-60"
    >
      {busy ? 'Προσθήκη…' : 'Προσθήκη στο καλάθι'}
    </button>
  );
}
