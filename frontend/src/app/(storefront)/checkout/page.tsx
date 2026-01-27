'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, cartTotalCents } from '@/lib/cart'
import { apiClient } from '@/lib/api'
import { paymentApi } from '@/lib/api/payment'
import PaymentMethodSelector, { type PaymentMethod } from '@/components/checkout/PaymentMethodSelector'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from '@/contexts/LocaleContext'
import { useToast } from '@/contexts/ToastContext'
import StripeProvider from '@/components/payment/StripeProvider'
import StripePaymentForm from '@/components/payment/StripePaymentForm'

// Pass CHECKOUT-SHIPPING-DISPLAY-01: Shipping quote state type
interface ShippingQuote {
  price_eur: number;
  zone_name: string | null;
  free_shipping: boolean;
  source: string;
}

function CheckoutContent() {
  const router = useRouter()
  const cartItems = useCart(s => s.items)
  const clear = useCart(s => s.clear)
  const { isAuthenticated, user } = useAuth()
  const t = useTranslations()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [cardProcessing, setCardProcessing] = useState(false)
  // Fix React error #418: Prevent hydration mismatch by waiting for client mount
  const [isMounted, setIsMounted] = useState(false)
  // Stripe Elements state
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)
  // Pass PAYMENT-INIT-ORDER-ID-01: Store checkout session ID for thank-you redirect
  const [pendingThankYouId, setPendingThankYouId] = useState<number | null>(null)
  const [orderTotal, setOrderTotal] = useState<number>(0)
  // Pass CHECKOUT-SHIPPING-DISPLAY-01: Shipping quote state
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [postalCode, setPostalCode] = useState('')

  // Guest checkout: email is required for order confirmation
  const isGuest = !isAuthenticated

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  // Calculate subtotal from cart items (for display only)
  // Must be calculated before fetchShippingQuote since it's used in the callback
  const subtotalCents = cartTotalCents(cartItems)
  const subtotal = subtotalCents / 100

  // Pass CHECKOUT-SHIPPING-DISPLAY-01: Fetch shipping quote when postal code is valid (5 digits)
  const fetchShippingQuote = useCallback(async (postal: string) => {
    // Validate Greek postal code format
    if (!postal || !/^\d{5}$/.test(postal)) {
      setShippingQuote(null)
      return
    }

    // Need cart items to calculate shipping
    const itemCount = Object.keys(cartItems).length
    if (itemCount === 0) {
      setShippingQuote(null)
      return
    }

    setShippingLoading(true)
    try {
      const quote = await apiClient.getZoneShippingQuote({
        postal_code: postal,
        method: 'HOME',
        subtotal: subtotal,
      })
      setShippingQuote({
        price_eur: quote.price_eur,
        zone_name: quote.zone_name,
        free_shipping: quote.free_shipping,
        source: quote.source,
      })
    } catch (err) {
      console.error('[Checkout] Shipping quote failed:', err)
      // Fallback: don't show error, just hide shipping until order is placed
      setShippingQuote(null)
    } finally {
      setShippingLoading(false)
    }
  }, [cartItems, subtotal])

  // Handle successful Stripe payment
  // Pass PAY-CARD-CONFIRM-GUARD-01: Only call backend confirm with valid Stripe result
  async function handleStripePaymentSuccess(paymentIntentId: string) {
    // Guard 1: Must have pending order ID
    if (!pendingOrderId) {
      console.error('[Checkout] handleStripePaymentSuccess called without pendingOrderId');
      setError('Σφάλμα: Δεν βρέθηκε η παραγγελία. Παρακαλώ δοκιμάστε ξανά.');
      return;
    }

    // Guard 2: Must have valid paymentIntentId from Stripe
    if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
      console.error('[Checkout] Invalid paymentIntentId:', paymentIntentId);
      setError('Σφάλμα: Μη έγκυρο αναγνωριστικό πληρωμής. Παρακαλώ δοκιμάστε ξανά.');
      return;
    }

    console.log('[Checkout] Confirming payment with backend:', {
      orderId: pendingOrderId,
      paymentIntentId: `${paymentIntentId.substring(0, 10)}...`,
    });

    try {
      // Confirm payment with backend
      await paymentApi.confirmPayment(pendingOrderId, paymentIntentId)
      // Show success toast ONLY after backend confirms payment
      // (Fix: Previously toast was shown in StripePaymentForm before backend confirmation)
      showToast('success', 'Η πληρωμή ολοκληρώθηκε επιτυχώς')
      // Clear cart and redirect to success page
      clear()
      router.push(`/thank-you?id=${pendingThankYouId ?? pendingOrderId}`)
    } catch (err) {
      console.error('[Checkout] Payment confirmation failed:', err)
      // Pass PAY-CARD-CONFIRM-GUARD-01: Show specific error from backend if available
      const errorMessage = err instanceof Error ? err.message : t('checkoutPage.cardPaymentError');
      setError(errorMessage);
    }
  }

  // Handle Stripe payment error
  function handleStripePaymentError(errorMessage: string) {
    setError(errorMessage)
    setCardProcessing(false)
  }

  // Cancel pending card payment and go back to form
  function handleCancelPayment() {
    setStripeClientSecret(null)
    setPendingOrderId(null)
    setPendingThankYouId(null)
    setOrderTotal(0)
    setCardProcessing(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Pass PAY-GUEST-CARD-GATE-01: Hard-guard against guest + card payment
    // Payment init endpoint requires auth:sanctum - guests cannot use card
    if (isGuest && paymentMethod === 'card') {
      setError('Για πληρωμή με κάρτα απαιτείται σύνδεση.')
      return
    }

    // Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: Multi-producer checkout now enabled.
    // Backend CheckoutService handles order splitting with per-producer shipping.

    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // Convert cart items to API format
    const items = Object.values(cartItems).map(item => ({
      id: item.id,
      qty: item.qty
    }))

    const body = {
      customer: {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: (formData.get('email') as string) || undefined,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        postcode: formData.get('postcode') as string
      },
      items,
      paymentMethod
    }

    try {
      // Ensure token is loaded from localStorage before API calls
      // This fixes SSR singleton issue where token might be null
      apiClient.refreshToken();

      // Create order via Laravel API (persists to PostgreSQL)
      // Pass 54: Include shipping_address and shipping_cost
      const shippingAddress = {
        name: body.customer.name,
        phone: body.customer.phone,
        email: body.customer.email,
        line1: body.customer.address,
        city: body.customer.city,
        postal_code: body.customer.postcode,
        country: 'GR'
      };

      // Shipping is calculated by backend (CheckoutService) based on per-producer rules.
      // Do NOT send shipping_cost - backend is the single source of truth.
      const orderData = {
        items: Object.values(cartItems).map(item => ({
          product_id: parseInt(item.id.toString()),
          quantity: item.qty
        })),
        currency: 'EUR' as const,
        shipping_method: 'HOME' as const,
        payment_method: paymentMethod === 'card' ? 'CARD' as const : 'COD' as const,
        shipping_address: shippingAddress,
        notes: ''
      };

      const order = await apiClient.createOrder(orderData);

      // Pass PAYMENT-INIT-ORDER-ID-01: Get correct order ID for payment init
      // For multi-producer checkout, API returns CheckoutSession with payment_order_id
      // For single-producer, use order.id directly
      const paymentOrderId = order.payment_order_id ?? order.id;
      const thankYouId = order.id; // Use checkout session ID for thank-you page

      // Store customer details for order confirmation/email
      sessionStorage.setItem('dixis:last-order-customer', JSON.stringify(body.customer));

      // Handle card payment via Stripe Elements
      if (paymentMethod === 'card') {
        setCardProcessing(true)
        try {
          // Initialize payment intent to get client_secret for Stripe Elements
          const paymentInit = await paymentApi.initPayment(paymentOrderId, {
            customer: {
              email: body.customer.email,
              firstName: body.customer.name.split(' ')[0],
              lastName: body.customer.name.split(' ').slice(1).join(' ') || undefined,
            },
            return_url: `${window.location.origin}/thank-you?id=${thankYouId}`,
          })

          // Store order info and show Stripe Elements form
          // Use paymentOrderId for payment operations, thankYouId for navigation
          setPendingOrderId(paymentOrderId)
          setPendingThankYouId(thankYouId)
          setOrderTotal(paymentInit.payment.amount / 100) // amount is in cents
          setStripeClientSecret(paymentInit.payment.client_secret)
          setLoading(false)
          // Don't clear cart yet - wait for payment success
          return
        } catch (paymentErr) {
          console.error('Card payment init failed:', paymentErr)
          setError(t('checkoutPage.cardPaymentError'))
          setCardProcessing(false)
          setLoading(false)
          return
        }
      }

      // COD: Clear cart and redirect to thank-you page
      clear()
      router.push(`/thank-you?id=${thankYouId}`)
    } catch (err: any) {
      console.error('Order creation failed:', err)
      // Pass PAYMENT-INIT-ORDER-ID-01: Handle specific error codes
      // 409 = stock conflict, 400 = validation error
      if (err?.status === 409) {
        setError(t('checkoutPage.stockError') || 'Κάποια προϊόντα δεν είναι διαθέσιμα. Ελέγξτε το καλάθι σας.')
      } else if (err?.status === 400) {
        setError(err?.message || t('checkoutPage.orderError'))
      } else {
        setError(t('checkoutPage.orderError'))
      }
      // Clear any stale payment state on error
      setPendingOrderId(null)
      setPendingThankYouId(null)
      setStripeClientSecret(null)
    } finally {
      setLoading(false)
    }
  }

  // Fix React error #418: Show loading during SSR/hydration
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600">{t('checkoutPage.loading')}</p>
        </div>
      </main>
    )
  }

  // If cart is empty and no pending payment, show message
  if (Object.keys(cartItems).length === 0 && !stripeClientSecret) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600 mb-4">{t('checkoutPage.emptyCart')}</p>
          <a href="/products" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 active:opacity-90 touch-manipulation">
            {t('checkoutPage.viewProducts')}
          </a>
        </div>
      </main>
    )
  }

  // Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: Multi-producer checkout enabled.
  // Backend CheckoutService creates CheckoutSession + N child Orders with per-producer shipping.

  // Show Stripe Elements form when we have a client secret
  if (stripeClientSecret && pendingOrderId) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4" data-testid="checkout-page">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-6">{t('checkout.title')}</h1>

          <div className="bg-white border rounded-xl p-6 mb-6">
            <h2 className="font-semibold mb-4">{t('checkoutPage.cardPayment') || 'Card Payment'}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('checkoutPage.securePayment') || 'Complete your payment securely with Stripe.'}
            </p>

            <StripeProvider clientSecret={stripeClientSecret}>
              <StripePaymentForm
                amount={orderTotal}
                onPaymentSuccess={handleStripePaymentSuccess}
                onPaymentError={handleStripePaymentError}
                disabled={false}
              />
            </StripeProvider>

            {error && (
              <div className="mt-4 text-red-600 text-sm" data-testid="payment-error">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleCancelPayment}
              className="mt-4 w-full h-10 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t('checkoutPage.cancelPayment') || 'Cancel and go back'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4" data-testid="checkout-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6" data-testid="checkout-title">{t('checkout.title')}</h1>

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

            {/* Pass CHECKOUT-SHIPPING-DISPLAY-01: Show shipping cost */}
            <div className="flex justify-between" data-testid="shipping-line">
              <span>{t('checkoutPage.shipping')}:</span>
              {shippingLoading ? (
                <span className="text-gray-400 text-sm" data-testid="shipping-loading">
                  {t('checkoutPage.shippingCalculating')}
                </span>
              ) : shippingQuote ? (
                <span
                  className={shippingQuote.free_shipping ? 'text-emerald-600 font-medium' : ''}
                  data-testid="shipping-cost"
                >
                  {shippingQuote.free_shipping ? t('checkoutPage.shippingFree') : fmt.format(shippingQuote.price_eur)}
                </span>
              ) : (
                <span className="text-gray-400 text-sm" data-testid="shipping-pending">
                  {t('checkoutPage.shippingEnterPostal')}
                </span>
              )}
            </div>

            {/* Show zone info if available */}
            {shippingQuote?.zone_name && (
              <p className="text-xs text-gray-500" data-testid="shipping-zone">
                {t('checkoutPage.shippingZone')}: {shippingQuote.zone_name}
              </p>
            )}

            {/* Total with shipping */}
            <div className="flex justify-between font-bold text-lg pt-2 border-t" data-testid="total-line">
              <span>{t('checkoutPage.total')}:</span>
              <span data-testid="checkout-total">
                {shippingQuote
                  ? fmt.format(subtotal + (shippingQuote.free_shipping ? 0 : shippingQuote.price_eur))
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

        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6" data-testid="checkout-form">
          <h2 className="font-semibold mb-4">{t('checkoutPage.shippingDetails')}</h2>

          {isGuest && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg" data-testid="guest-checkout-notice">
              <p className="text-sm text-blue-800">
                {t('checkoutPage.guestNotice')}
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
                <p className="text-xs text-gray-500 mt-1">
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
                  setPostalCode(val)
                  // Pass CHECKOUT-SHIPPING-DISPLAY-01: Fetch quote on valid postal code
                  if (val.length === 5) {
                    fetchShippingQuote(val)
                  } else {
                    setShippingQuote(null)
                  }
                }}
                className="w-full h-11 px-4 border rounded-lg text-base"
                data-testid="checkout-postal"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="pt-4 border-t">
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm" data-testid="checkout-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || cardProcessing}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-base touch-manipulation active:opacity-90"
              data-testid="checkout-submit"
            >
              {cardProcessing
                ? t('checkoutPage.redirectingToPayment')
                : loading
                  ? t('checkoutPage.processing')
                  : paymentMethod === 'card'
                    ? t('checkoutPage.continueToPayment')
                    : t('checkoutPage.completeOrder')}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  const t = useTranslations()
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600">{t('checkoutPage.loading')}</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
