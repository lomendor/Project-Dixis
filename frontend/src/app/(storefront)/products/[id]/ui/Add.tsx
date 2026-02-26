'use client';
import { useCart } from '@/lib/cart';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

/**
 * Pass FIX-STOCK-GUARD-01: Added stock field for OOS awareness
 * Pass CART-UX-FEEDBACK-01: Added toast notification + imageUrl
 */
interface AddProps {
  // Pass HOTFIX-MP-CHECKOUT-GUARD-01: Include producerId for multi-producer cart detection
  product: { id: string; title: string; price: number; imageUrl?: string | null; producerId?: string | number | null; producerName?: string | null; stock?: number | null };
  translations: {
    addToCart: string;
    cartAdded: string;
    outOfStock?: string;
  };
}

const MAX_QTY = 99;

export default function Add({ product, translations }: AddProps) {
  const add = useCart(s => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { showSuccess } = useToast();

  // Pass FIX-STOCK-GUARD-01: Check if product is out of stock
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  // Cap max qty by available stock (if known)
  const maxQty = typeof product.stock === 'number' && product.stock > 0
    ? Math.min(product.stock, MAX_QTY)
    : MAX_QTY;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const priceCents = Math.round(Number(product.price || 0) * 100);
    const item = {
      id: String(product.id),
      title: product.title,
      priceCents,
      imageUrl: product.imageUrl || undefined,
      producerId: product.producerId ? String(product.producerId) : undefined,
      producerName: product.producerName || undefined,
    };

    // Add the selected quantity by calling add() in a loop
    // (add() increments qty if item already exists in cart)
    for (let i = 0; i < qty; i++) add(item);

    setAdded(true);
    const label = qty > 1 ? `${qty}x ${product.title}` : product.title;
    showSuccess(`${label} προστέθηκε στο καλάθι`, 2000);
    setQty(1);
    setTimeout(() => setAdded(false), 2000);
  };

  // Pass FIX-STOCK-GUARD-01: Show disabled OOS state
  if (isOutOfStock) {
    return (
      <form className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full bg-red-100 text-red-600 font-medium py-3 px-6 rounded-lg cursor-not-allowed"
          data-testid="add-to-cart-button"
          data-oos="true"
        >
          {translations.outOfStock || 'Εξαντλήθηκε'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleAdd} className="space-y-3">
      {/* Quantity selector — matches cart page pattern */}
      <div className="flex items-center justify-center gap-3" data-testid="qty-selector">
        <span className="text-sm text-neutral-500 mr-1">Ποσότητα</span>
        <button
          type="button"
          onClick={() => setQty(q => Math.max(1, q - 1))}
          disabled={qty <= 1}
          className="h-10 w-10 rounded-lg border border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-lg transition"
          aria-label="Μείωση ποσότητας"
          data-testid="qty-minus"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center font-semibold text-lg" data-testid="qty-value">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty(q => Math.min(maxQty, q + 1))}
          disabled={qty >= maxQty}
          className="h-10 w-10 rounded-lg border border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-lg transition"
          aria-label="Αύξηση ποσότητας"
          data-testid="qty-plus"
        >
          +
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-lg transition"
        data-testid="add-to-cart-button"
      >
        {translations.addToCart}
      </button>
      {added && (
        <p role="status" className="text-primary text-sm text-center">
          ✓ {translations.cartAdded}
        </p>
      )}
    </form>
  );
}
