'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
  // Card payments gated by build-time env flag AND user authentication
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [cardEnabled, setCardEnabled] = useState(false)

  // COD gated by build-time env flag (NEXT_PUBLIC_ENABLE_COD)
  const codEnabled = process.env.NEXT_PUBLIC_ENABLE_COD === 'true'

  useEffect(() => {
    // NEXT_PUBLIC_* vars are replaced at build time
    // Card is only available if: flag enabled AND user is logged in
    const flagEnabled = process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true'
    setCardEnabled(flagEnabled && isAuthenticated)

    // Auto-select card when COD is disabled and card is available
    if (!codEnabled && flagEnabled && isAuthenticated && value === 'cod') {
      onChange('card')
    }

    // If user not authenticated and card was selected, reset to COD (only if COD enabled)
    if (!isAuthenticated && value === 'card' && codEnabled) {
      onChange('cod')
    }
  }, [isAuthenticated, value, onChange, codEnabled])

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="font-semibold mb-3">Τρόπος Πληρωμής</legend>

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
            <span className="font-medium">Αντικαταβολή</span>
            <p className="text-sm text-neutral-500">Πληρωμή κατά την παράδοση</p>
            {codFee != null && codFee > 0 && (
              <p className="text-xs text-amber-600 mt-0.5" data-testid="cod-fee-note">
                +{new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(codFee)} χρέωση αντικαταβολής
              </p>
            )}
          </div>
        </label>
      )}

      {/* Card (Stripe) - Only if feature flag enabled AND user is logged in */}
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
            <span className="font-medium">Κάρτα</span>
            <p className="text-sm text-neutral-500">Ασφαλής πληρωμή με κάρτα</p>
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
          Τα στοιχεία πληρωμής δεν αποθηκεύονται στο Dixis
        </p>
      )}

      {/* Message for guests when card flag is enabled but user not logged in */}
      {/* Only render after auth loading completes to avoid hydration mismatch */}
      {!authLoading && !isAuthenticated && process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg" data-testid="guest-card-notice">
          <p className="text-sm text-amber-800">
            Για πληρωμή με κάρτα απαιτείται σύνδεση.{' '}
            <a href="/login?redirect=/checkout" className="font-medium text-primary hover:underline">Συνδεθείτε</a>
          </p>
        </div>
      )}
    </fieldset>
  )
}
