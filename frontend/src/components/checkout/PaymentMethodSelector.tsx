'use client'

export type PaymentMethod = 'cod' | 'viva'

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
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="font-semibold mb-3">Τρόπος Πληρωμής</legend>

      {/* Cash on Delivery */}
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

      {/* Viva Wallet */}
      <label
        htmlFor="payment-viva"
        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
          value === 'viva'
            ? 'border-emerald-600 bg-emerald-50'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="radio"
          id="payment-viva"
          name="paymentMethod"
          value="viva"
          checked={value === 'viva'}
          onChange={() => onChange('viva')}
          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
          data-testid="payment-viva"
        />
        <div className="flex-1">
          <span className="font-medium">Κάρτα (Viva Wallet)</span>
          <p className="text-sm text-gray-500">Ασφαλής πληρωμή με κάρτα</p>
        </div>
        <div className="flex gap-1">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">MC</span>
        </div>
      </label>
    </fieldset>
  )
}
