'use client';
import { useCart } from '@/lib/cart/context';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function Add({ product }: { product: { id: string; title: string; price: number } }) {
  const { addItem, force } = useCart();
  const t = useTranslations();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      title: product.title,
      price: Number(product.price || 0),
      qty: 1
    });
    force();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <form onSubmit={handleAdd} className="space-y-2">
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition"
        data-testid="add-to-cart"
      >
        {t('product.addToCart')}
      </button>
      {added && (
        <p role="status" className="text-green-600 text-sm text-center">
          ✓ {t('cart.added')}
        </p>
      )}
    </form>
  );
}
