'use client'

import { useAuth } from '@/contexts/AuthContext'

export type PaymentMethod = 'card'

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
  const { isAuthenticated, loading: authLoading } = useAuth()

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="font-semibold mb-3">Τρόπος Πληρωμής</legend>

      {/* Card (Stripe) — only payment method */}
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

      {/* T3-02: Stripe trust text */}
      <p className="text-xs text-neutral-500 mt-1 pl-7">
        Τα στοιχεία πληρωμής δεν αποθηκεύονται στο Dixis
      </p>

      {/* Guest login prompt */}
      {!authLoading && !isAuthenticated && (
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
