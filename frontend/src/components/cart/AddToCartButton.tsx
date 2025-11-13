'use client';
import * as React from 'react';
import { useCart } from '@/store/cart';

export default function AddToCartButton(
  { id, title, price, currency = 'EUR', qty = 1, className = '' }:
  { id: string|number; title?: string; price?: number|string; currency?: string; qty?: number; className?: string }
){
  const { add } = useCart();
  const [ok, setOk] = React.useState(false);
  return (
    <button
      onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); add({ id: String(id), title: String(title ?? 'Προϊόν'), price: Number(price ?? 0), currency }, qty); setOk(true); setTimeout(()=>setOk(false), 1200); }}
      className={`h-10 px-4 rounded-md text-sm bg-brand text-white hover:opacity-90 ${className}`}
      aria-live="polite"
    >
      {ok ? '✅ Προστέθηκε' : 'Προσθήκη στο καλάθι'}
    </button>
  );
}
