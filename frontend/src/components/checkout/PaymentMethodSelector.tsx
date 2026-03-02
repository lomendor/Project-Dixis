'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from '@/contexts/LocaleContext'

export type PaymentMethod = 'cod' | 'card'

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  disabled?: boolean
  codFee?: number
}

export default function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  codFee,
}: PaymentMethodSelectorProps) {
  // Card payments gated by build-time env flag (guests allowed — Stripe handles auth)
  const t = useTranslations()
  const [cardEnabled, setCardEnabled] = useState(false)

  // COD gated by build-time env flag (NEXT_PUBLIC_ENABLE_COD)
  const codEnabled = process.env.NEXT_PUBLIC_ENABLE_COD === 'true'

  useEffect(() => {
    // NEXT_PUBLIC_* vars are replaced at build time
    // Card is available if flag is enabled (guests can pay via Stripe)
    const flagEnabled = process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true'
    setCardEnabled(flagEnabled)

    // Auto-select card when COD is disabled and card is available
    if (!codEnabled && flagEnabled && value === 'cod') {
      onChange('card')
    }
  }, [value, onChange, codEnabled])

  return (
    <fieldset className="space-y-3" disabled={disabled} aria-label={t('checkoutPage.paymentMethod')}>
      <legend className="font-semibold mb-3">{t('checkoutPage.paymentMethod')}</legend>

      {/* Cash on Delivery - Only if NEXT_PUBLIC_ENABLE_COD=true */}
      {codEnabled && (
        <label
          htmlFor="payment-cod"
          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            value === 'cod'
              ? 'border-primary bg-primary-pale'
              : 'border-neutral-200 hover:border-neutral-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            id="payment-cod"
            name="paymentMethod"
            value="cod"
            checked={value === 'cod'}
            onChange={() => onChange('cod')}
            className="w-5 h-5 text-primary focus:ring-primary"
            data-testid="payment-cod"
          />
          <div className="flex-1">
            <span className="font-medium">{t('checkoutPage.codPayment')}</span>
            <p className="text-sm text-neutral-500">{t('checkoutPage.codPaymentDesc')}</p>
            {codFee != null && codFee > 0 && (
              <p className="text-xs text-amber-600 mt-0.5" data-testid="cod-fee-note">
                {t('checkoutPage.codFeeText', { fee: new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(codFee) })}
              </p>
            )}
          </div>
        </label>
      )}

      {/* Card (Stripe) - Available for all users when feature flag is enabled */}
      {cardEnabled && (
        <label
          htmlFor="payment-card"
          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            value === 'card'
              ? 'border-primary bg-primary-pale'
              : 'border-neutral-200 hover:border-neutral-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            id="payment-card"
            name="paymentMethod"
            value="card"
            checked={value === 'card'}
            onChange={() => onChange('card')}
            className="w-5 h-5 text-primary focus:ring-primary"
            data-testid="payment-card"
          />
          <div className="flex-1">
            <span className="font-medium">{t('checkoutPage.cardPayment')}</span>
            <p className="text-sm text-neutral-500">{t('checkoutPage.cardPaymentDesc')}</p>
          </div>
          <div className="flex gap-1">
            <span className="text-xs bg-neutral-100 px-2 py-1 rounded">Visa</span>
            <span className="text-xs bg-neutral-100 px-2 py-1 rounded">MC</span>
          </div>
        </label>
      )}

      {/* T3-02: Stripe trust text — payment data is not stored on Dixis */}
      {cardEnabled && (
        <p className="text-xs text-neutral-500 mt-1 pl-7">
          {t('checkoutPage.stripePrivacy')}
        </p>
      )}

      {/* Card payments are now available for both guests and logged-in users */}
    </fieldset>
  )
}
