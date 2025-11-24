'use client';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { useTranslations } from 'next-intl';
import { calcTotals, fmtEUR } from '@/lib/cart/totals';
import { DEFAULT_OPTIONS, type ShippingMethod } from '@/contracts/shipping';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  const { items, increase, decrease, remove } = useCart();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('PICKUP');

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1>
        <p className="text-gray-500">{t('common.loading')}</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1>
        <div className="text-center py-16" data-testid="empty-cart">
          <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">{t('cart.empty')}</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            {t('cart.continue')}
          </Link>
        </div>
      </main>
    );
  }

  // Find shipping option details
  const shippingOption = DEFAULT_OPTIONS.find(opt => opt.code === shippingMethod) || DEFAULT_OPTIONS[0];

  // Calculate totals - @/store/cart uses price directly (EUR), convert to cents for calcTotals
  const totals = calcTotals({
    items: items.map(item => ({ price: item.price * 100, qty: item.qty })),
    shippingMethod,
    baseShipping: shippingOption.baseCost * 100, // Convert to cents
    codFee: (shippingOption.codFee || 0) * 100, // Convert to cents
    taxRate: 0.24, // 24% VAT
  });

  const handleShippingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShippingMethod(e.target.value as ShippingMethod);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4" data-testid="cart-items">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg" data-testid="cart-item">
              <div className="flex-1">
                <h3 className="font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {item.priceFormatted || fmtEUR(item.price * 100)}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('cart.qty')}:</span>
                    <button
                      onClick={() => decrease(item.id)}
                      className="w-8 h-8 flex items-center justify-center border rounded bg-gray-100 hover:bg-gray-200 text-lg font-medium"
                      data-testid="qty-minus"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span
                      className="w-8 text-center font-medium"
                      data-testid="qty-value"
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => increase(item.id)}
                      className="w-8 h-8 flex items-center justify-center border rounded bg-gray-100 hover:bg-gray-200 text-lg font-medium"
                      data-testid="qty-plus"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-red-600 hover:underline text-sm"
                    data-testid="cart-remove"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium" data-testid="cart-item-total">
                  {fmtEUR(item.price * item.qty * 100)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Shipping Method */}
          <div className="border rounded-lg p-6">
            <label className="block text-sm font-medium mb-2">
              {t('shipping.method')}
            </label>
            <select
              value={shippingMethod}
              onChange={handleShippingChange}
              className="w-full px-3 py-2 border rounded-lg"
              data-testid="shipping-selector"
            >
              {DEFAULT_OPTIONS.map(option => (
                <option key={option.code} value={option.code}>
                  {t(`shipping.${option.code}`)}
                  {option.baseCost > 0 && ` (${option.baseCost.toFixed(2)} €)`}
                  {option.codFee && ` + ${option.codFee.toFixed(2)} € COD`}
                </option>
              ))}
            </select>
          </div>

          {/* Totals */}
          <div className="border rounded-lg p-6 space-y-3" data-testid="cart-totals">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.subtotal')}</span>
              <span data-testid="cart-subtotal">{fmtEUR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.shipping')}</span>
              <span data-testid="cart-shipping">{fmtEUR(totals.shipping)}</span>
            </div>
            {totals.codFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.codFee')}</span>
                <span data-testid="cart-cod-fee">{fmtEUR(totals.codFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.tax')}</span>
              <span data-testid="cart-tax">{fmtEUR(totals.tax)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>{t('cart.total')}</span>
              <span data-testid="cart-total">{fmtEUR(totals.grandTotal)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            href="/checkout"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg text-center transition"
            data-testid="checkout-button"
          >
            {t('cart.checkout')}
          </Link>

          <Link
            href="/products"
            className="block text-center text-blue-600 hover:underline"
          >
            {t('cart.continue')}
          </Link>
        </div>
      </div>
    </main>
  );
}
