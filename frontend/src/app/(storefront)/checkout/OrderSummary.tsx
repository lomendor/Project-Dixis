'use client'

import { useTranslations } from '@/contexts/LocaleContext'
import ShippingBreakdownDisplay from '@/components/checkout/ShippingBreakdownDisplay'
import type { CartItem } from '@/lib/cart'
import type { ShippingQuote, CartShippingQuote } from './types'

interface OrderSummaryProps {
  cartItems: Record<string, CartItem>
  subtotal: number
  shippingQuote: ShippingQuote | null
  cartShippingQuote: CartShippingQuote | null
  shippingLoading: boolean
  postalCode: string
  cartShippingError: string | null
}

const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' })

export default function OrderSummary({
  cartItems,
  subtotal,
  shippingQuote,
  cartShippingQuote,
  shippingLoading,
  postalCode,
  cartShippingError,
}: OrderSummaryProps) {
  const t = useTranslations()

  return (
    <div className="bg-white border rounded-xl p-6 mb-6">
      <h2 className="font-semibold mb-4">{t('checkoutPage.orderDetails')}</h2>
      <div className="space-y-2 mb-4">
        {Object.values(cartItems).map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.title} x {item.qty}
            </span>
            <span className="font-medium">
              {fmt.format((item.priceCents / 100) * item.qty)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between">
          <span>{t('checkoutPage.subtotal')}:</span>
          <span>{fmt.format(subtotal)}</span>
        </div>

        {/* Multi-producer separate shipments notice */}
        {cartShippingQuote && cartShippingQuote.producers.length > 1 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm" data-testid="multi-producer-notice">
            <svg className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-800">
              {t('checkoutPage.multiProducerNotice', { count: cartShippingQuote.producers.length })}
            </p>
          </div>
        )}

        {/* Per-producer shipping breakdown */}
        <ShippingBreakdownDisplay
          producers={cartShippingQuote?.producers ?? null}
          totalShipping={cartShippingQuote?.total_shipping ?? shippingQuote?.price_eur ?? null}
          isLoading={shippingLoading}
          isPending={!postalCode || postalCode.length < 5}
          error={cartShippingError ?? undefined}
        />

        {/* Zone info fallback for single-producer */}
        {!cartShippingQuote && shippingQuote?.zone_name && (
          <p className="text-xs text-neutral-500" data-testid="shipping-zone">
            {t('checkoutPage.shippingZone')}: {shippingQuote.zone_name}
          </p>
        )}

        {/* COD fee row */}
        {cartShippingQuote && cartShippingQuote.cod_fee > 0 && (
          <div className="flex justify-between text-sm" data-testid="cod-fee-line">
            <span>{t('checkoutPage.codFeeLabel')}:</span>
            <span>{fmt.format(cartShippingQuote.cod_fee)}</span>
          </div>
        )}

        {/* T3-02: Estimated delivery time */}
        {(cartShippingQuote || shippingQuote) && !cartShippingError && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 pt-1" data-testid="delivery-estimate">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('checkoutPage.estimatedDelivery')}</span>
          </div>
        )}

        {/* Total with shipping + COD fee */}
        <div className="flex justify-between font-bold text-lg pt-2 border-t" data-testid="total-line">
          <span>{t('checkoutPage.total')}:</span>
          <span data-testid="checkout-total">
            {shippingQuote
              ? fmt.format(subtotal + (shippingQuote.free_shipping ? 0 : shippingQuote.price_eur) + (cartShippingQuote?.cod_fee ?? 0))
              : fmt.format(subtotal)}
          </span>
        </div>

        {!shippingQuote && (
          <p className="text-xs text-neutral-500 mt-1">
            {t('checkoutPage.shippingNote')}
          </p>
        )}
      </div>
    </div>
  )
}
