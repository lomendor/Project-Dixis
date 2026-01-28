'use client';

import { useTranslations } from '@/contexts/LocaleContext';

/**
 * Pass ORDER-SHIPPING-SPLIT-01: Per-producer shipping breakdown display component
 *
 * Displays shipping costs with per-producer breakdown when multiple producers in cart.
 * Single producer shows simple single line.
 */

export interface ProducerShipping {
  producer_id: number;
  producer_name: string;
  subtotal: number;
  shipping_cost: number;
  is_free: boolean;
  free_reason: string | null;
  threshold?: number;
  zone: string | null;
  weight_grams: number;
}

interface ShippingBreakdownDisplayProps {
  producers: ProducerShipping[] | null;
  totalShipping: number | null;
  isLoading?: boolean;
  isPending?: boolean;
  error?: string | null;
}

export default function ShippingBreakdownDisplay({
  producers,
  totalShipping,
  isLoading = false,
  isPending = false,
  error = null,
}: ShippingBreakdownDisplayProps) {
  const t = useTranslations();
  const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-1" data-testid="shipping-loading">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{t('checkoutPage.shipping')}:</span>
          <span>{t('checkoutPage.shippingCalculating')}</span>
        </div>
      </div>
    );
  }

  // Pending state (no postal code entered)
  if (isPending) {
    return (
      <div className="space-y-1" data-testid="shipping-pending">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{t('checkoutPage.shipping')}:</span>
          <span>{t('checkoutPage.shippingEnterPostal')}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-1" data-testid="shipping-error">
        <div className="flex justify-between text-sm text-red-600">
          <span>{t('checkoutPage.shipping')}:</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // No producers (shouldn't happen, but fallback)
  if (!producers || producers.length === 0) {
    return (
      <div className="space-y-1" data-testid="shipping-pending">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{t('checkoutPage.shipping')}:</span>
          <span>{t('checkoutPage.shippingEnterPostal')}</span>
        </div>
      </div>
    );
  }

  // Single producer - simple display (no breakdown)
  if (producers.length === 1) {
    const producer = producers[0];
    return (
      <div className="space-y-1" data-testid="shipping-single">
        <div className="flex justify-between">
          <span>{t('checkoutPage.shipping')}:</span>
          <span
            className={producer.is_free ? 'text-emerald-600 font-medium' : ''}
            data-testid="shipping-cost"
          >
            {producer.is_free ? t('checkoutPage.shippingFree') : fmt.format(producer.shipping_cost)}
          </span>
        </div>
      </div>
    );
  }

  // Multiple producers - show breakdown
  return (
    <div className="space-y-2" data-testid="shipping-breakdown">
      <div className="text-sm font-medium text-gray-700">{t('checkoutPage.shipping')}:</div>

      <div className="pl-2 space-y-1 border-l-2 border-gray-200">
        {producers.map((producer) => (
          <div
            key={producer.producer_id}
            className="flex justify-between text-sm"
            data-testid={`shipping-producer-${producer.producer_id}`}
          >
            <span className="text-gray-600">
              {t('checkoutPage.shippingFrom', { producer: producer.producer_name })}
            </span>
            <span
              className={producer.is_free ? 'text-emerald-600 font-medium' : ''}
              data-testid={`shipping-cost-${producer.producer_id}`}
            >
              {producer.is_free
                ? t('checkoutPage.shippingFree')
                : fmt.format(producer.shipping_cost)}
            </span>
          </div>
        ))}
      </div>

      {/* Total shipping line */}
      <div className="flex justify-between font-medium pt-1 border-t border-gray-100">
        <span>{t('checkoutPage.totalShipping')}:</span>
        <span
          className={totalShipping === 0 ? 'text-emerald-600' : ''}
          data-testid="shipping-total"
        >
          {totalShipping === 0 ? t('checkoutPage.shippingFree') : fmt.format(totalShipping)}
        </span>
      </div>
    </div>
  );
}
