'use client';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import * as C from '@/lib/cart/cart';
import { useRouter } from 'next/navigation';

type Props = {
  product: {
    productId: string;
    title: string;
    price: number;
    unit?: string;
    stock: number;
  };
  disabled?: boolean;
};

export default function AddToCartButton({ product, disabled }: Props) {
  const [qty, setQty] = useState(1);
  const { refresh } = useCart();
  const router = useRouter();

  const handleAdd = () => {
    C.addItem({
      productId: product.productId,
      title: product.title,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      qty
    });
    refresh();
    router.push('/cart');
  };

  const maxQty = Math.min(product.stock, 99);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border rounded-lg">
        <button
          type="button"
          onClick={() => setQty(Math.max(1, qty - 1))}
          disabled={disabled || qty <= 1}
          className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Μείωση ποσότητας"
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max={maxQty}
          value={qty}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 1 && val <= maxQty) setQty(val);
          }}
          disabled={disabled}
          className="w-16 text-center border-x py-2 focus:outline-none disabled:bg-gray-100"
          aria-label="Ποσότητα"
        />
        <button
          type="button"
          onClick={() => setQty(Math.min(maxQty, qty + 1))}
          disabled={disabled || qty >= maxQty}
          className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Αύξηση ποσότητας"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled}
        className="flex-1 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {disabled ? 'Μη Διαθέσιμο' : 'Προσθήκη στο Καλάθι'}
      </button>
    </div>
  );
}
