'use client'

/**
 * T4: Enhanced with per-field validation on blur + ARIA attributes.
 * Validates: name, phone (Greek format), email, address, city, postcode.
 * Shows inline Greek error messages with role="alert" for screen readers.
 */

import { useRef, useState, useCallback } from 'react'
import { useTranslations } from '@/contexts/LocaleContext'

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

/** Validate a single field; returns translation key or empty string */
function validateField(name: string, value: string, isGuest: boolean): string {
  const v = value.trim()
  switch (name) {
    case 'name':
      return v.length < 2 ? 'checkoutPage.validateName' : ''
    case 'phone': {
      const digits = v.replace(/[\s\-()]/g, '')
      return !/^\+?\d{10,14}$/.test(digits)
        ? 'checkoutPage.validatePhone'
        : ''
    }
    case 'email':
      if (!isGuest && !v) return '' // optional for logged-in users
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? 'checkoutPage.validateEmail'
        : ''
    case 'address':
      return v.length < 3 ? 'checkoutPage.validateAddress' : ''
    case 'city':
      return v.length < 2 ? 'checkoutPage.validateCity' : ''
    case 'postcode':
      return !/^\d{5}$/.test(v) ? 'checkoutPage.validatePostcode' : ''
    default:
      return ''
  }
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

  // Per-field error tracking
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateField(name, value, isGuest)
      setFieldErrors((prev) => ({ ...prev, [name]: error }))
    },
    [isGuest]
  )

  /** Dynamic class for inputs — red border when invalid + touched */
  const inputClass = (name: string) =>
    `w-full h-11 px-4 border rounded-lg text-base ${
      touched[name] && fieldErrors[name]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-neutral-300'
    }`

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
        <div className="mb-4 p-3 bg-primary-pale border border-primary/20 rounded-lg" data-testid="saved-address-notice">
          <p className="text-sm text-primary-dark">
            {t('checkoutPage.savedAddressInUse')}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Full name */}
        <div>
          <label htmlFor="checkout-name" className="block text-sm font-medium mb-1">{t('checkoutPage.fullName')}</label>
          <input
            id="checkout-name"
            name="name"
            required
            autoComplete="name"
            aria-required="true"
            aria-invalid={touched.name && !!fieldErrors.name}
            aria-describedby={touched.name && fieldErrors.name ? 'error-name' : undefined}
            defaultValue={savedAddress?.name || user?.name || ''}
            onBlur={handleBlur}
            className={inputClass('name')}
            data-testid="checkout-name"
          />
          {touched.name && fieldErrors.name && (
            <p id="error-name" role="alert" className="text-xs text-red-600 mt-1">{t(fieldErrors.name)}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="checkout-phone" className="block text-sm font-medium mb-1">{t('checkoutPage.phone')}</label>
          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            aria-required="true"
            aria-invalid={touched.phone && !!fieldErrors.phone}
            aria-describedby={touched.phone && fieldErrors.phone ? 'error-phone' : undefined}
            placeholder="+30 210 1234567"
            defaultValue={savedAddress?.phone || ''}
            onBlur={handleBlur}
            className={inputClass('phone')}
            data-testid="checkout-phone"
          />
          {touched.phone && fieldErrors.phone && (
            <p id="error-phone" role="alert" className="text-xs text-red-600 mt-1">{t(fieldErrors.phone)}</p>
          )}
        </div>

        {/* Email */}
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
            aria-required={isGuest}
            aria-invalid={touched.email && !!fieldErrors.email}
            aria-describedby={
              (touched.email && fieldErrors.email ? 'error-email' : '') +
              (isGuest ? ' email-hint' : '') || undefined
            }
            defaultValue={user?.email || ''}
            onBlur={handleBlur}
            className={inputClass('email')}
            data-testid="checkout-email"
          />
          {isGuest && (
            <p id="email-hint" className="text-xs text-neutral-500 mt-1">
              {t('checkoutPage.emailRequired')}
            </p>
          )}
          {touched.email && fieldErrors.email && (
            <p id="error-email" role="alert" className="text-xs text-red-600 mt-1">{t(fieldErrors.email)}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="checkout-address" className="block text-sm font-medium mb-1">{t('checkoutPage.address')}</label>
          <input
            id="checkout-address"
            name="address"
            required
            autoComplete="street-address"
            aria-required="true"
            aria-invalid={touched.address && !!fieldErrors.address}
            aria-describedby={touched.address && fieldErrors.address ? 'error-address' : undefined}
            defaultValue={savedAddress?.line1 || ''}
            onBlur={handleBlur}
            className={inputClass('address')}
            data-testid="checkout-address"
          />
          {touched.address && fieldErrors.address && (
            <p id="error-address" role="alert" className="text-xs text-red-600 mt-1">{t(fieldErrors.address)}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="checkout-city" className="block text-sm font-medium mb-1">{t('checkoutPage.city')}</label>
          <input
            id="checkout-city"
            name="city"
            required
            autoComplete="address-level2"
            aria-required="true"
            aria-invalid={touched.city && !!fieldErrors.city}
            aria-describedby={touched.city && fieldErrors.city ? 'error-city' : undefined}
            defaultValue={savedAddress?.city || ''}
            onBlur={handleBlur}
            className={inputClass('city')}
            data-testid="checkout-city"
          />
          {touched.city && fieldErrors.city && (
            <p id="error-city" role="alert" className="text-xs text-red-600 mt-1">{t(fieldErrors.city)}</p>
          )}
        </div>

        {/* Postal code */}
        <div>
          <label htmlFor="checkout-postcode" className="block text-sm font-medium mb-1">{t('checkoutPage.postalCode')}</label>
          <input
            id="checkout-postcode"
            name="postcode"
            required
            inputMode="numeric"
            pattern="[0-9]{5}"
            autoComplete="postal-code"
            aria-required="true"
            aria-invalid={touched.postcode && !!fieldErrors.postcode}
            aria-describedby={touched.postcode && fieldErrors.postcode ? 'error-postcode' : undefined}
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
            onBlur={handleBlur}
            className={inputClass('postcode')}
            data-testid="checkout-postal"
          />
          {touched.postcode && fieldErrors.postcode && (
            <p id="error-postcode" role="alert" className="text-xs text-red-600 mt-1">{t(fieldErrors.postcode)}</p>
          )}
        </div>
      </div>
    </>
  )
}
