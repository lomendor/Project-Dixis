'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react'
import { useCart, cartTotalCents } from '@/lib/cart'
import { calcTotals, fmtEUR } from '@/lib/cart/totals'
import { DEFAULT_OPTIONS, calculateShippingCost, type ShippingMethod } from '@/contracts/shipping'
import { useTranslations } from 'next-intl'
import ShippingBreakdown from '@/components/checkout/ShippingBreakdown'
import type { QuoteResponse } from '@/lib/quoteClient'
import { apiClient } from '@/lib/api'

// Pass 51: Payment method type
type PaymentMethodType = 'COD' | 'CARD'

// Pass 49: Greek market validation
const GREEK_PHONE_REGEX = /^(\+30|0030|30)?[2-9]\d{8,9}$/
const GREEK_POSTAL_REGEX = /^\d{5}$/

// Shipping method options for UI (Pass 48)
const SHIPPING_OPTIONS: Array<{
  code: 'HOME' | 'PICKUP' | 'COURIER';
  label: string;
  labelEl: string;
  cost: number;
  etaDays?: string;
}> = [
  { code: 'HOME', label: 'Home Delivery', labelEl: 'Παράδοση στο σπίτι', cost: 3.50, etaDays: '2-3 ημέρες' },
  { code: 'PICKUP', label: 'Store Pickup', labelEl: 'Παραλαβή από κατάστημα', cost: 0, etaDays: 'Άμεση' },
  { code: 'COURIER', label: 'Courier', labelEl: 'Μεταφορική εταιρεία', cost: 4.50, etaDays: '1-2 ημέρες' },
];

// Free shipping threshold (€)
const FREE_SHIPPING_THRESHOLD = 35;

// Pass 49: Field validation errors type
interface FieldErrors {
  phone?: string;
  postal?: string;
}

// Helper to derive total from subtotal + shipping + cod
function deriveTotal(subtotal: number, shipping: number, cod: number = 0) {
  return Number((subtotal + shipping + cod).toFixed(2));
}

export default function CheckoutClient(){
  const router = useRouter()
  const searchParams = useSearchParams()
  const err = searchParams?.get('err') || null
  const t = useTranslations()

  // Use Zustand cart
  const cartItems = useCart(state => state.items)
  const clearCart = useCart(state => state.clear)
  const items = Object.values(cartItems) // Convert Record to array

  // Pass 48: Shipping method selection state
  const [shippingMethod, setShippingMethod] = useState<'HOME' | 'PICKUP' | 'COURIER'>('HOME')
  const [loading, setLoading] = useState(false)
  // Pass 49: Validation error state for Greek market
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  // Pass 50: Zone-based shipping quote state
  const [zoneQuote, setZoneQuote] = useState<{ price: number; zoneName: string | null; source: string } | null>(null)
  const [postalInput, setPostalInput] = useState('')
  // Pass 51: Payment method and card payments feature flag
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD')
  const [cardPaymentsEnabled, setCardPaymentsEnabled] = useState(false)

  // Live totals state from ShippingBreakdown
  const [liveTotals, setLiveTotals] = useState<{shipping:number; cod:number; total:number; free:boolean}>({
    shipping: 0,
    cod: 0,
    total: 0,
    free: false
  })

  // Pass 51: Check if card payments are enabled on mount
  useEffect(() => {
    const checkCardPayments = async () => {
      try {
        // Check env var first (faster than API call)
        const envEnabled = process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true'
        if (envEnabled) {
          setCardPaymentsEnabled(true)
        }
      } catch {
        // Card payments disabled by default
        setCardPaymentsEnabled(false)
      }
    }
    checkCardPayments()
  }, [])

  // Find shipping option details
  const shippingOption = SHIPPING_OPTIONS.find(opt => opt.code === shippingMethod) || SHIPPING_OPTIONS[0]

  // Map Zustand cart items (priceCents) to totals format (price in cents)
  const lines = items.map(i => ({ price: i.priceCents, qty: i.qty }))

  // Calculate subtotal in euros
  const subtotalEur = lines.reduce((sum, l) => sum + (l.price * l.qty) / 100, 0)

  // Pass 50: Calculate shipping cost (zone-based with fallback)
  const shippingCost = useMemo(() => {
    if (shippingMethod === 'PICKUP') return 0
    if (subtotalEur >= FREE_SHIPPING_THRESHOLD) return 0
    // Use zone quote if available, otherwise fallback to hardcoded
    if (zoneQuote && zoneQuote.source !== 'fallback') {
      return zoneQuote.price
    }
    return shippingOption.cost
  }, [shippingMethod, subtotalEur, shippingOption.cost, zoneQuote])

  // Pass 50: Fetch zone-based quote when postal code changes
  const fetchShippingQuote = async (postal: string, method: 'HOME' | 'PICKUP' | 'COURIER') => {
    if (!postal || postal.length !== 5 || method === 'PICKUP') {
      setZoneQuote(null)
      return
    }
    try {
      const quote = await apiClient.getZoneShippingQuote({
        postal_code: postal,
        method,
        subtotal: subtotalEur,
      })
      setZoneQuote({
        price: quote.price_eur,
        zoneName: quote.zone_name,
        source: quote.source,
      })
    } catch {
      // Fallback silently - use hardcoded prices
      setZoneQuote(null)
    }
  }

  const totals = calcTotals({
    items: lines,
    shippingMethod,
    baseShipping: shippingCost * 100, // Convert to cents
    codFee: 0, // No COD fee in this flow
    taxRate: 0.24 // 24% VAT
  })

  // Callback when ShippingBreakdown gets new quote
  function onQuoteUpdate(q: QuoteResponse | null) {
    try {
      if (!q) return;
      setLiveTotals({
        shipping: q.shippingCost || 0,
        cod: q.codFee || 0,
        total: deriveTotal(totals.subtotal / 100, q.shippingCost || 0, q.codFee || 0),
        free: !!q.freeShipping
      });
    } catch (e) {
      // noop - graceful degradation
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name  = String(formData.get('name')||'').trim()
    const phone = String(formData.get('phone')||'').trim()
    const email = String(formData.get('email')||'').trim()
    const line1 = String(formData.get('line1')||'').trim()
    const city  = String(formData.get('city')||'').trim()
    const postal= String(formData.get('postal')||'').trim()

    if(!items.length){ router.push('/cart'); return }
    if(!name || !phone || !line1 || !city || !postal){
      router.push('/checkout?err=missing')
      return
    }

    // Pass 49: Greek market validation
    const errors: FieldErrors = {}
    if (!GREEK_PHONE_REGEX.test(phone)) {
      errors.phone = 'Παρακαλώ εισάγετε έγκυρο ελληνικό τηλέφωνο (π.χ. 6912345678 ή +306912345678)'
    }
    if (!GREEK_POSTAL_REGEX.test(postal)) {
      errors.postal = 'Ο Τ.Κ. πρέπει να έχει ακριβώς 5 ψηφία'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({}) // Clear errors on successful validation

    setLoading(true)
    try{
      // Pass 44: Use Laravel API directly (Single Source of Truth)
      // Pass 48: Include shipping_cost in order creation
      // Pass 51: Support both COD and CARD payment methods
      const order = await apiClient.createOrder({
        items: items.map(i => ({ product_id: parseInt(i.id, 10), quantity: i.qty })),
        currency: 'EUR',
        shipping_method: shippingMethod,
        shipping_address: {
          name,
          phone,
          line1,
          city,
          postal_code: postal,
          country: 'GR', // Default to Greece
        },
        shipping_cost: shippingCost, // Pass 48: Send calculated shipping cost
        payment_method: paymentMethod, // Pass 51: COD or CARD
        notes: undefined,
      });

      // CRITICAL: Do NOT redirect without a valid order ID
      if (!order?.id) {
        console.error('[CHECKOUT] No order ID in response:', order)
        router.push('/checkout?err=no-order-id')
        return
      }

      // Pass 51: Handle card payment - redirect to Stripe checkout
      if (paymentMethod === 'CARD') {
        try {
          const paymentSession = await apiClient.createPaymentCheckout(order.id)
          clearCart()
          // Redirect to Stripe Checkout
          window.location.href = paymentSession.redirect_url
          return
        } catch (paymentError) {
          console.error('[CHECKOUT] Card payment init failed:', paymentError)
          // Order created but payment failed - redirect to order page with error
          router.push(`/order/${encodeURIComponent(order.id)}?payment_error=true`)
          return
        }
      }

      // COD: Clear cart and redirect to order confirmation
      clearCart()
      router.push(`/order/${encodeURIComponent(order.id)}`)
    }catch(e){
      console.error('[CHECKOUT] Submit error:', e)
      router.push('/checkout?err=submit')
    }finally{
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8" data-testid="checkout-page">
      <h1 className="text-3xl font-bold mb-6">{t('checkout.title')}</h1>
      {!items.length ? (
        <div className="text-gray-500">
          {t('checkout.error.empty')} <a href="/products" className="text-blue-600 hover:underline">{t('cart.continue')}</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="checkout-form">
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.name')}</label>
              <input
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.phone')}</label>
              <input
                name="phone"
                required
                placeholder="6912345678"
                className={`w-full px-3 py-2 border rounded-lg ${fieldErrors.phone ? 'border-red-500' : ''}`}
                data-testid="checkout-phone"
              />
              {fieldErrors.phone && (
                <p className="text-red-600 text-sm mt-1" data-testid="phone-error">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.email')}</label>
              <input
                name="email"
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.address')}</label>
              <input
                name="line1"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('form.city')}</label>
                <input
                  name="city"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="checkout-city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('form.postal')}</label>
                <input
                  name="postal"
                  required
                  placeholder="10564"
                  maxLength={5}
                  value={postalInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                    setPostalInput(val)
                    if (val.length === 5) {
                      fetchShippingQuote(val, shippingMethod)
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${fieldErrors.postal ? 'border-red-500' : ''}`}
                  data-testid="checkout-postal"
                />
                {fieldErrors.postal && (
                  <p className="text-red-600 text-sm mt-1" data-testid="postal-error">{fieldErrors.postal}</p>
                )}
              </div>
            </div>

            {/* Pass 48: Shipping Method Selection */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium mb-3">Τρόπος Αποστολής</label>
              <div className="space-y-2" data-testid="shipping-method-selector">
                {SHIPPING_OPTIONS.map((option) => {
                  const isSelected = shippingMethod === option.code
                  const isFree = option.code === 'PICKUP' || subtotalEur >= FREE_SHIPPING_THRESHOLD
                  return (
                    <label
                      key={option.code}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                        isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`shipping-option-${option.code}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_method"
                          value={option.code}
                          checked={isSelected}
                          onChange={() => {
                            setShippingMethod(option.code)
                            if (postalInput.length === 5) {
                              fetchShippingQuote(postalInput, option.code)
                            }
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <span className="font-medium">{option.labelEl}</span>
                          {option.etaDays && (
                            <span className="text-xs text-gray-500 ml-2">({option.etaDays})</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${isFree ? 'text-green-600' : 'text-gray-700'}`}>
                        {isFree ? 'Δωρεάν' : (
                          zoneQuote && isSelected && zoneQuote.source !== 'fallback'
                            ? `€${zoneQuote.price.toFixed(2)}`
                            : `€${option.cost.toFixed(2)}`
                        )}
                      </span>
                    </label>
                  )
                })}
              </div>
              {subtotalEur >= FREE_SHIPPING_THRESHOLD && shippingMethod !== 'PICKUP' && (
                <p className="mt-2 text-sm text-green-600" data-testid="free-shipping-message">
                  ✓ Δωρεάν αποστολή για παραγγελίες άνω των €{FREE_SHIPPING_THRESHOLD}
                </p>
              )}
              {/* Pass 50: Show zone info when available */}
              {zoneQuote && zoneQuote.zoneName && shippingMethod !== 'PICKUP' && (
                <p className="mt-2 text-xs text-gray-500" data-testid="zone-info">
                  Ζώνη: {zoneQuote.zoneName}
                </p>
              )}
            </div>

            {/* Pass 51: Payment Method Selection */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium mb-3">Τρόπος Πληρωμής</label>
              <div className="space-y-2" data-testid="payment-method-selector">
                {/* COD - Always available */}
                <label
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                    paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid="payment-option-COD"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium">Αντικαταβολή</span>
                      <span className="text-xs text-gray-500 ml-2">(Πληρωμή κατά την παράδοση)</span>
                    </div>
                  </div>
                </label>

                {/* Card - Only if feature flag enabled */}
                {cardPaymentsEnabled && (
                  <label
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'CARD' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid="payment-option-CARD"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <span className="font-medium">Κάρτα</span>
                        <span className="text-xs text-gray-500 ml-2">(Ασφαλής πληρωμή με κάρτα)</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Visa / Mastercard</span>
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition"
              data-testid="checkout-submit"
            >
              {loading
                ? 'Επεξεργασία...'
                : paymentMethod === 'CARD'
                  ? 'Συνέχεια στην Πληρωμή'
                  : 'Ολοκλήρωση Παραγγελίας'}
            </button>
            {err && (
              <p className="text-red-600" data-testid="checkout-error">
                {err === 'missing' ? t('checkout.error.empty') : t('checkout.error.generic')}
              </p>
            )}
          </form>

          <aside className="border rounded-lg p-6 bg-gray-50 h-fit" data-testid="checkout-summary">
            <h3 className="font-semibold mb-4">{t('cart.items')}</h3>
            <ul className="space-y-2 mb-4">
              {items.map(it => (
                <li key={it.id} className="flex justify-between gap-4">
                  <span className="text-sm">{it.title} × {it.qty}</span>
                  <span className="text-sm font-medium">{fmtEUR(it.priceCents * it.qty)}</span>
                </li>
              ))}
            </ul>
            <hr className="border-gray-200 my-4"/>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium" data-testid="subtotal-display">{fmtEUR(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span data-testid="shipping-cost-display" className={shippingCost === 0 ? 'text-green-600' : ''}>
                  {shippingCost === 0 ? 'Δωρεάν' : `€${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Τρόπος:</span>
                <span data-testid="shipping-method-display">{shippingOption.labelEl}</span>
              </div>
              {totals.codFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.codFee')}</span>
                  <span>{fmtEUR(totals.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.tax')}</span>
                <span>{fmtEUR(totals.tax)}</span>
              </div>
              <hr className="border-gray-200 my-2"/>
              <div className="flex justify-between text-lg font-bold">
                <span>{t('cart.total')}</span>
                <span data-testid="checkout-total">{fmtEUR(totals.grandTotal)}</span>
              </div>
            </div>

            {/* AG7a: Shipping breakdown UI - shows detailed shipping calculation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <ShippingBreakdown
                onQuote={(q) => onQuoteUpdate(q)}
                initialPostalCode=""
                initialMethod={shippingMethod as any || 'COURIER'}
                initialItems={items.map(i => ({ weightGrams: 500 }))}
                initialSubtotal={totals.subtotal / 100}
              />
            </div>

            {/* AG7b: Live totals from shipping quote */}
            {liveTotals.total > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Σύνολο παραγγελίας:</span>
                  <span data-testid="order-total">€{liveTotals.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* AG7b: Free shipping banner */}
            {liveTotals.free && (
              <div
                data-testid="free-shipping-banner"
                className="mt-4 bg-green-50 border border-green-500 text-green-800 px-4 py-2 rounded-lg text-sm font-medium"
              >
                ✓ Δωρεάν μεταφορικά
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}
