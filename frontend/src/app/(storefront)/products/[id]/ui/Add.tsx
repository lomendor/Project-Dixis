'use client';
import { useCart } from '@/lib/cart';
import { useState } from 'react';

interface AddProps {
  product: { id: string; title: string; price: number };
  translations: {
    addToCart: string;
    cartAdded: string;
  };
}

export default function Add({ product, translations }: AddProps) {
  const add = useCart(s => s.add);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    // Use the correct cart system (@/lib/cart - Zustand)
    // Convert price to cents for consistency with products list
    const priceCents = Math.round(Number(product.price || 0) * 100);

    add({
      id: String(product.id),
      title: product.title,
      priceCents: priceCents,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <form onSubmit={handleAdd} className="space-y-2">
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition"
        data-testid="add-to-cart-button"
      >
        {translations.addToCart}
      </button>
      {added && (
        <p role="status" className="text-green-600 text-sm text-center">
          ✓ {translations.cartAdded}
        </p>
      )}
    </form>
  );
}
