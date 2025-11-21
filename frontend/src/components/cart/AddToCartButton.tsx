'use client';
import * as React from 'react';
import { useCart } from '@/store/cart';

export default function AddToCartButton(
  { id, title, price, currency = 'EUR', qty = 1, className = '' }:
  { id: string|number; title?: string; price?: number|string; currency?: string; qty?: number; className?: string }
){
  const { add } = useCart();
  const [ok, setOk] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const priceNum = Number(price ?? 0);
    const priceFormatted = currency === 'EUR' ? `€${priceNum.toFixed(2)}` : `${priceNum.toFixed(2)} ${currency}`;
    add({
      id: String(id),
      title: String(title ?? 'Προϊόν'),
      priceFormatted,
      price: priceNum,
      currency
    }, qty);
    setOk(true);
    setTimeout(() => setOk(false), 1200);
  };

  return (
    <button
      onClick={handleClick}
      className={`h-10 px-4 rounded-md text-sm bg-brand text-white hover:opacity-90 ${className}`}
      aria-live="polite"
    >
      {ok ? '✅ Προστέθηκε' : 'Προσθήκη στο καλάθι'}
    </button>
  );
}
