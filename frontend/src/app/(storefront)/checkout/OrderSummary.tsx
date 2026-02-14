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
          <p className="text-xs text-gray-500" data-testid="shipping-zone">
            {t('checkoutPage.shippingZone')}: {shippingQuote.zone_name}
          </p>
        )}

        {/* COD fee row */}
        {cartShippingQuote && cartShippingQuote.cod_fee > 0 && (
          <div className="flex justify-between text-sm" data-testid="cod-fee-line">
            <span>Αντικαταβολή:</span>
            <span>{fmt.format(cartShippingQuote.cod_fee)}</span>
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
          <p className="text-xs text-gray-500 mt-1">
            {t('checkoutPage.shippingNote')}
          </p>
        )}
      </div>
    </div>
  )
}
