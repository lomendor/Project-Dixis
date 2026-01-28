'use client'
import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
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
import ShippingBreakdownDisplay from '@/components/checkout/ShippingBreakdownDisplay'
import ShippingChangedModal from '@/components/checkout/ShippingChangedModal'

// Pass CHECKOUT-SHIPPING-DISPLAY-01: Shipping quote state type (legacy single-quote)
interface ShippingQuote {
  price_eur: number;
  zone_name: string | null;
  free_shipping: boolean;
  source: string;
}

// Pass ORDER-SHIPPING-SPLIT-01: Per-producer shipping breakdown
interface ProducerShipping {
  producer_id: number;
  producer_name: string;
  subtotal: number;
  shipping_cost: number;
  is_free: boolean;
  free_reason: string | null;
  zone: string;
  weight_grams: number;
}

interface CartShippingQuote {
  producers: ProducerShipping[];
  total_shipping: number;
  quoted_at: string;
  currency: string;
  zone_name: string | null;
  method: string;
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
  // Pass CHECKOUT-SHIPPING-DISPLAY-01: Shipping quote state (legacy single-producer)
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [postalCode, setPostalCode] = useState('')
  // Pass ORDER-SHIPPING-SPLIT-01: Per-producer cart shipping quote
  const [cartShippingQuote, setCartShippingQuote] = useState<CartShippingQuote | null>(null)
  const [cartShippingError, setCartShippingError] = useState<string | null>(null)
  // Pass ORDER-SHIPPING-SPLIT-01: Shipping changed modal state
  const [shippingMismatch, setShippingMismatch] = useState<{
    oldAmount: number;
    newAmount: number;
  } | null>(null)
  // Debounce ref for postal code input
  const postalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Saved address for pre-fill
  const [savedAddress, setSavedAddress] = useState<{
    name?: string;
    line1?: string;
    city?: string;
    postal_code?: string;
    phone?: string;
  } | null>(null)

  // Guest checkout: email is required for order confirmation
  const isGuest = !isAuthenticated

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Fetch saved address for logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      apiClient.getShippingAddress()
        .then((data) => {
          if (data.address) {
            setSavedAddress(data.address)
            // Pre-fill postal code and trigger shipping quote
            if (data.address.postal_code && /^\d{5}$/.test(data.address.postal_code)) {
              setPostalCode(data.address.postal_code)
            }
          }
        })
        .catch((err) => {
          console.warn('[Checkout] Failed to fetch saved address:', err)
        })
    }
  }, [isAuthenticated])

  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  // Calculate subtotal from cart items (for display only)
  // Must be calculated before fetchShippingQuote since it's used in the callback
  const subtotalCents = cartTotalCents(cartItems)
  const subtotal = subtotalCents / 100

  // Pass ORDER-SHIPPING-SPLIT-01: Fetch per-producer cart shipping quote
  const fetchCartShippingQuote = useCallback(async (postal: string) => {
    // Validate Greek postal code format
    if (!postal || !/^\d{5}$/.test(postal)) {
      setCartShippingQuote(null)
      setCartShippingError(null)
      setShippingQuote(null)
      return
    }

    // Need cart items to calculate shipping
    const itemCount = Object.keys(cartItems).length
    if (itemCount === 0) {
      setCartShippingQuote(null)
      setCartShippingError(null)
      setShippingQuote(null)
      return
    }

    setShippingLoading(true)
    setCartShippingError(null)
    try {
      // Convert cart items to API format
      const items = Object.values(cartItems).map(item => ({
        product_id: parseInt(item.id.toString()),
        quantity: item.qty
      }))

      const quote = await apiClient.getCartShippingQuote({
        postal_code: postal,
        method: 'HOME',
        items,
      })

      setCartShippingQuote(quote)
      // Also set legacy shippingQuote for total calculation compatibility
      setShippingQuote({
        price_eur: quote.total_shipping,
        zone_name: quote.zone_name,
        free_shipping: quote.total_shipping === 0,
        source: 'cart_quote',
      })
    } catch (err: any) {
      console.error('[Checkout] Cart shipping quote failed:', err)
      // Pass ORDER-SHIPPING-SPLIT-01: Handle zone unavailable (HARD_BLOCK)
      if (err?.code === 'ZONE_UNAVAILABLE') {
        setCartShippingError(t('checkoutPage.shippingUnavailable'))
        setCartShippingQuote(null)
        setShippingQuote(null)
      } else {
        // Other errors: fall back to legacy quote
        setCartShippingQuote(null)
        setCartShippingError(null)
        // Try legacy single quote as fallback
        try {
          const legacyQuote = await apiClient.getZoneShippingQuote({
            postal_code: postal,
            method: 'HOME',
            subtotal: subtotal,
          })
          setShippingQuote({
            price_eur: legacyQuote.price_eur,
            zone_name: legacyQuote.zone_name,
            free_shipping: legacyQuote.free_shipping,
            source: legacyQuote.source,
          })
        } catch {
          setShippingQuote(null)
        }
      }
    } finally {
      setShippingLoading(false)
    }
  }, [cartItems, subtotal, t])

  // Pass CHECKOUT-SHIPPING-DISPLAY-01: Legacy fetch (now wraps cart quote)
  const fetchShippingQuote = useCallback(async (postal: string) => {
    fetchCartShippingQuote(postal)
  }, [fetchCartShippingQuote])

  // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Auto-fetch shipping quote when postal code is pre-filled
  // This runs when savedAddress is loaded and postalCode is set
  useEffect(() => {
    if (postalCode && postalCode.length === 5 && !shippingQuote && !shippingLoading) {
      fetchCartShippingQuote(postalCode)
    }
  }, [postalCode, savedAddress]) // eslint-disable-line react-hooks/exhaustive-deps

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
      // Pass ORDER-SHIPPING-SPLIT-01: Include quoted_shipping for mismatch detection
      const orderData = {
        items: Object.values(cartItems).map(item => ({
          product_id: parseInt(item.id.toString()),
          quantity: item.qty
        })),
        currency: 'EUR' as const,
        shipping_method: 'HOME' as const,
        payment_method: paymentMethod === 'card' ? 'CARD' as const : 'COD' as const,
        shipping_address: shippingAddress,
        notes: '',
        // Pass ORDER-SHIPPING-SPLIT-01: Include quoted shipping for mismatch detection
        quoted_shipping: cartShippingQuote?.total_shipping ?? shippingQuote?.price_eur ?? undefined,
        quoted_at: cartShippingQuote?.quoted_at ?? undefined,
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
      // Pass ORDER-SHIPPING-SPLIT-01: Handle SHIPPING_CHANGED response (HARD_BLOCK)
      if (err?.code === 'SHIPPING_CHANGED' && err?.quoted_total != null && err?.locked_total != null) {
        setShippingMismatch({
          oldAmount: err.quoted_total,
          newAmount: err.locked_total,
        })
        // Don't show error - modal will handle it
        setLoading(false)
        return
      }
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

  // Pass ORDER-SHIPPING-SPLIT-01: Handle shipping mismatch modal actions
  function handleShippingAccept() {
    // User accepts new shipping cost - re-fetch quote with new amount and re-submit
    setShippingMismatch(null)
    // Re-trigger quote fetch to get updated amount
    if (postalCode.length === 5) {
      fetchCartShippingQuote(postalCode)
    }
    // User can now click submit again with awareness of new price
  }

  function handleShippingCancel() {
    // User cancels - close modal and stay on checkout
    setShippingMismatch(null)
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

            {/* Pass ORDER-SHIPPING-SPLIT-01: Per-producer shipping breakdown */}
            <ShippingBreakdownDisplay
              producers={cartShippingQuote?.producers ?? null}
              totalShipping={cartShippingQuote?.total_shipping ?? shippingQuote?.price_eur ?? null}
              isLoading={shippingLoading}
              isPending={!postalCode || postalCode.length < 5}
              error={cartShippingError ?? undefined}
            />

            {/* Show zone info if available (fallback for single-producer) */}
            {!cartShippingQuote && shippingQuote?.zone_name && (
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

          {/* Pass PRODUCER-THRESHOLD-POSTALCODE-01: Show saved address notice */}
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
                  setPostalCode(val)
                  // Pass ORDER-SHIPPING-SPLIT-01: Debounced fetch (300ms) on valid postal code
                  if (postalDebounceRef.current) {
                    clearTimeout(postalDebounceRef.current)
                  }
                  if (val.length === 5) {
                    postalDebounceRef.current = setTimeout(() => {
                      fetchCartShippingQuote(val)
                    }, 300)
                  } else {
                    setCartShippingQuote(null)
                    setShippingQuote(null)
                    setCartShippingError(null)
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
              disabled={loading || cardProcessing || !!cartShippingError}
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
      {/* Pass ORDER-SHIPPING-SPLIT-01: Shipping changed hard-block modal */}
      <ShippingChangedModal
        isOpen={shippingMismatch !== null}
        oldAmount={shippingMismatch?.oldAmount ?? 0}
        newAmount={shippingMismatch?.newAmount ?? 0}
        onAccept={handleShippingAccept}
        onCancel={handleShippingCancel}
      />
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
