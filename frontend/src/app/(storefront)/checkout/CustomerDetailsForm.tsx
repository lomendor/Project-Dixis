'use client'

import { useRef } from 'react'
import { useTranslations } from '@/contexts/LocaleContext'
import type { CartShippingQuote, ShippingQuote } from './types'

interface SavedAddress {
  name?: string
  line1?: string
  city?: string
  postal_code?: string
  phone?: string
}

interface CustomerDetailsFormProps {
  isGuest: boolean
  savedAddress: SavedAddress | null
  user: { name?: string; email?: string } | null
  postalCode: string
  onPostalCodeChange: (val: string) => void
  onFetchShipping: (postal: string) => void
  onClearShipping: () => void
}

export default function CustomerDetailsForm({
  isGuest,
  savedAddress,
  user,
  postalCode,
  onPostalCodeChange,
  onFetchShipping,
  onClearShipping,
}: CustomerDetailsFormProps) {
  const t = useTranslations()
  const postalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return (
    <>
      {isGuest && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg" data-testid="guest-checkout-notice">
          <p className="text-sm text-blue-800">
            {t('checkoutPage.guestNotice')}
          </p>
        </div>
      )}

      {savedAddress && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg" data-testid="saved-address-notice">
          <p className="text-sm text-green-800">
            Χρησιμοποιείται η αποθηκευμένη διεύθυνση αποστολής σας.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="checkout-name" className="block text-sm font-medium mb-1">{t('checkoutPage.fullName')}</label>
          <input
            id="checkout-name"
            name="name"
            required
            autoComplete="name"
            defaultValue={savedAddress?.name || user?.name || ''}
            className="w-full h-11 px-4 border rounded-lg text-base"
            data-testid="checkout-name"
          />
        </div>

        <div>
          <label htmlFor="checkout-phone" className="block text-sm font-medium mb-1">{t('checkoutPage.phone')}</label>
          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="+30 210 1234567"
            defaultValue={savedAddress?.phone || ''}
            className="w-full h-11 px-4 border rounded-lg text-base"
            data-testid="checkout-phone"
          />
        </div>

        <div>
          <label htmlFor="checkout-email" className="block text-sm font-medium mb-1">
            Email{isGuest && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            inputMode="email"
            required={isGuest}
            autoComplete="email"
            defaultValue={user?.email || ''}
            className="w-full h-11 px-4 border rounded-lg text-base"
            data-testid="checkout-email"
          />
          {isGuest && (
            <p className="text-xs text-neutral-500 mt-1">
              {t('checkoutPage.emailRequired')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="checkout-address" className="block text-sm font-medium mb-1">{t('checkoutPage.address')}</label>
          <input
            id="checkout-address"
            name="address"
            required
            autoComplete="street-address"
            defaultValue={savedAddress?.line1 || ''}
            className="w-full h-11 px-4 border rounded-lg text-base"
            data-testid="checkout-address"
          />
        </div>

        <div>
          <label htmlFor="checkout-city" className="block text-sm font-medium mb-1">{t('checkoutPage.city')}</label>
          <input
            id="checkout-city"
            name="city"
            required
            autoComplete="address-level2"
            defaultValue={savedAddress?.city || ''}
            className="w-full h-11 px-4 border rounded-lg text-base"
            data-testid="checkout-city"
          />
        </div>

        <div>
          <label htmlFor="checkout-postcode" className="block text-sm font-medium mb-1">{t('checkoutPage.postalCode')}</label>
          <input
            id="checkout-postcode"
            name="postcode"
            required
            inputMode="numeric"
            pattern="[0-9]{5}"
            autoComplete="postal-code"
            placeholder="10671"
            value={postalCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 5)
              onPostalCodeChange(val)
              // Debounced fetch (300ms) on valid 5-digit postal code
              if (postalDebounceRef.current) {
                clearTimeout(postalDebounceRef.current)
              }
              if (val.length === 5) {
                postalDebounceRef.current = setTimeout(() => {
                  onFetchShipping(val)
                }, 300)
              } else {
                onClearShipping()
              }
            }}
            className="w-full h-11 px-4 border rounded-lg text-base"
            data-testid="checkout-postal"
          />
        </div>
      </div>
    </>
  )
}
