'use client';
import { useState } from 'react';

export type AddToCartButtonProps = {
  slug: string;
};

export default function AddToCartButton({ slug }: AddToCartButtonProps) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle');

  async function handleAdd() {
    setStatus('adding');
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, qty: 1 }),
      });
      if (res.ok) {
        setStatus('added');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('idle');
        alert('Αποτυχία προσθήκης στο καλάθι');
      }
    } catch {
      setStatus('idle');
      alert('Σφάλμα δικτύου');
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={status === 'adding'}
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
      data-cart-status={status}
    >
      {status === 'adding' && 'Προσθήκη...'}
      {status === 'added' && '✓ Προστέθηκε'}
      {status === 'idle' && 'Προσθήκη στο καλάθι'}
    </button>
  );
}
