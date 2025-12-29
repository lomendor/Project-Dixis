'use client'

import { useEffect, useState } from 'react'

export type PaymentMethod = 'cod' | 'card'

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  disabled?: boolean
}

export default function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  // Card payments gated by build-time env flag
  const [cardEnabled, setCardEnabled] = useState(false)

  useEffect(() => {
    // NEXT_PUBLIC_* vars are replaced at build time
    const enabled = process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true'
    setCardEnabled(enabled)
  }, [])

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="font-semibold mb-3">Τρόπος Πληρωμής</legend>

      {/* Cash on Delivery - Always available */}
      <label
        htmlFor="payment-cod"
        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
          value === 'cod'
            ? 'border-emerald-600 bg-emerald-50'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="radio"
          id="payment-cod"
          name="paymentMethod"
          value="cod"
          checked={value === 'cod'}
          onChange={() => onChange('cod')}
          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
          data-testid="payment-cod"
        />
        <div className="flex-1">
          <span className="font-medium">Αντικαταβολή</span>
          <p className="text-sm text-gray-500">Πληρωμή κατά την παράδοση</p>
        </div>
      </label>

      {/* Card (Stripe) - Only if feature flag enabled */}
      {cardEnabled && (
        <label
          htmlFor="payment-card"
          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            value === 'card'
              ? 'border-emerald-600 bg-emerald-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            id="payment-card"
            name="paymentMethod"
            value="card"
            checked={value === 'card'}
            onChange={() => onChange('card')}
            className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
            data-testid="payment-card"
          />
          <div className="flex-1">
            <span className="font-medium">Κάρτα</span>
            <p className="text-sm text-gray-500">Ασφαλής πληρωμή με κάρτα</p>
          </div>
          <div className="flex gap-1">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">MC</span>
          </div>
        </label>
      )}
    </fieldset>
  )
}
