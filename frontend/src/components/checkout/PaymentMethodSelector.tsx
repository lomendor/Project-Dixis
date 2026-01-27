'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
  // Card payments gated by build-time env flag AND user authentication
  // Guest users can only use COD; logged-in users can use card
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [cardEnabled, setCardEnabled] = useState(false)

  useEffect(() => {
    // NEXT_PUBLIC_* vars are replaced at build time
    // Card is only available if: flag enabled AND user is logged in
    const flagEnabled = process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true'
    setCardEnabled(flagEnabled && isAuthenticated)

    // If user not authenticated and card was selected, reset to COD
    if (!isAuthenticated && value === 'card') {
      onChange('cod')
    }
  }, [isAuthenticated, value, onChange])

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

      {/* Card (Stripe) - Only if feature flag enabled AND user is logged in */}
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

      {/* Pass PAY-GUEST-CARD-GATE-01: Message for guests when card flag is enabled but user not logged in */}
      {/* Only render after auth loading completes to avoid hydration mismatch */}
      {!authLoading && !isAuthenticated && process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg" data-testid="guest-card-notice">
          <p className="text-sm text-amber-800">
            Για πληρωμή με κάρτα απαιτείται σύνδεση.{' '}
            <a href="/login?redirect=/checkout" className="font-medium text-emerald-600 hover:underline">Συνδεθείτε</a>
          </p>
        </div>
      )}
    </fieldset>
  )
}
