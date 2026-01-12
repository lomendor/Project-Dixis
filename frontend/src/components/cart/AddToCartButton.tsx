'use client';
import * as React from 'react';
import { useCart, AddResult } from '@/lib/cart';
import ProducerConflictModal from './ProducerConflictModal';

export default function AddToCartButton(
  { id, title, price, currency = 'EUR', qty = 1, className = '', producerId, producerName }:
  { id: string|number; title?: string; price?: number|string; currency?: string; qty?: number; className?: string; producerId?: string; producerName?: string }
){
  const add = useCart(s => s.add);
  const forceAdd = useCart(s => s.forceAdd);
  const [ok, setOk] = React.useState(false);
  const [conflict, setConflict] = React.useState<Extract<AddResult, { status: 'conflict' }> | null>(null);
  const [pendingItem, setPendingItem] = React.useState<{id: string; title: string; priceCents: number; producerId?: string; producerName?: string} | null>(null);

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

    // Add using Zustand cart format
    for (let i = 0; i < qty; i++) {
      const result = add(item);
      if (result.status === 'conflict') {
        // Store pending item and show modal
        setPendingItem(item);
        setConflict(result);
        return;
      }
    }

    setOk(true);
    setTimeout(() => setOk(false), 1200);
  };

  const handleReplaceCart = () => {
    if (pendingItem) {
      forceAdd(pendingItem);
      setOk(true);
      setTimeout(() => setOk(false), 1200);
    }
    setConflict(null);
    setPendingItem(null);
  };

  const handleCancel = () => {
    setConflict(null);
    setPendingItem(null);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`h-11 px-4 rounded-md text-sm bg-brand text-white hover:opacity-90 ${className}`}
        aria-live="polite"
      >
        {ok ? '✅ Προστέθηκε' : 'Προσθήκη στο καλάθι'}
      </button>
      {conflict && (
        <ProducerConflictModal
          currentProducerName={conflict.currentProducerName}
          onCheckout={() => { window.location.href = '/checkout'; }}
          onReplace={handleReplaceCart}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
