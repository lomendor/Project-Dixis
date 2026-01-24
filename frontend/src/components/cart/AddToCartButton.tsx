'use client';
import * as React from 'react';
import { useCart } from '@/lib/cart';

/**
 * AddToCartButton - Multi-producer carts now supported
 * (Pass SHIP-MULTI-PRODUCER-ENABLE-01)
 */
export default function AddToCartButton(
  { id, title, price, currency = 'EUR', qty = 1, className = '', producerId, producerName }:
  { id: string|number; title?: string; price?: number|string; currency?: string; qty?: number; className?: string; producerId?: string; producerName?: string }
){
  const add = useCart(s => s.add);
  const [ok, setOk] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const priceNum = Number(price ?? 0);
    const priceCents = Math.round(priceNum * 100); // Convert EUR to cents

    const item = {
      id: String(id),
      title: String(title ?? 'Προϊόν'),
      priceCents,
      producerId,
      producerName,
    };

    // Add using Zustand cart format (multi-producer allowed)
    for (let i = 0; i < qty; i++) {
      add(item);
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
