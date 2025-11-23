'use client';
import * as React from 'react';
import AddToCartButton from './AddToCartButton';

export default function BuyBox({ product }:{ product: { id: string|number; title?: string; name?: string; price?: number|string; currency?: string } }){
  const [qty, setQty] = React.useState(1);
  const title = String(product.title ?? product.name ?? 'Προϊόν');
  return (
    <div className="mt-6 flex gap-3 items-center">
      <input type="number" min={1} value={qty} onChange={e=>setQty(Number(e.target.value||1))} className="h-10 w-20 border rounded-md px-3" />
      <AddToCartButton id={product.id} title={title} price={Number(product.price ?? 0)} currency={product.currency ?? 'EUR'} qty={qty} />
    </div>
  );
}
