'use client';
import * as React from 'react';
import { useCart } from '@/lib/cart';

export default function AddToCartButton(
  { id, title, price, currency = 'EUR', qty = 1, className = '' }:
  { id: string|number; title?: string; price?: number|string; currency?: string; qty?: number; className?: string }
){
  const add = useCart(s => s.add);
  const [ok, setOk] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const priceNum = Number(price ?? 0);
    const priceCents = Math.round(priceNum * 100); // Convert EUR to cents

    // Add using Zustand cart format
    for (let i = 0; i < qty; i++) {
      add({
        id: String(id),
        title: String(title ?? 'Προϊόν'),
        priceCents
      });
    }

    setOk(true);
    setTimeout(() => setOk(false), 1200);
  };

  return (
    <button
      onClick={handleClick}
      className={`h-11 px-4 rounded-md text-sm bg-brand text-white hover:opacity-90 ${className}`}
      aria-live="polite"
    >
      {ok ? '✅ Προστέθηκε' : 'Προσθήκη στο καλάθι'}
    </button>
  );
}
