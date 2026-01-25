'use client'
import { Suspense, useState, useEffect } from 'react'
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
  const [orderTotal, setOrderTotal] = useState<number>(0)

  // Guest checkout: email is required for order confirmation
  const isGuest = !isAuthenticated

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  // Calculate subtotal from cart items (for display only)
  const subtotalCents = cartTotalCents(cartItems)
  const subtotal = subtotalCents / 100

  // Handle successful Stripe payment
  async function handleStripePaymentSuccess(paymentIntentId: string) {
    if (!pendingOrderId) return

    try {
      // Confirm payment with backend
      await paymentApi.confirmPayment(pendingOrderId, paymentIntentId)
      // Show success toast ONLY after backend confirms payment
      // (Fix: Previously toast was shown in StripePaymentForm before backend confirmation)
      showToast('success', 'Η πληρωμή ολοκληρώθηκε επιτυχώς')
      // Clear cart and redirect to success page
      clear()
      router.push(`/thank-you?id=${pendingOrderId}`)
    } catch (err) {
      console.error('Payment confirmation failed:', err)
      setError(t('checkoutPage.cardPaymentError'))
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
    setOrderTotal(0)
    setCardProcessing(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

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

      // Calculate shipping cost based on postal code zone (simplified: €3.50 default for HOME)
      // TODO: Call /api/v1/public/shipping/quote for accurate zone-based pricing
      const shippingCost = 3.50;

      const orderData = {
        items: Object.values(cartItems).map(item => ({
          product_id: parseInt(item.id.toString()),
          quantity: item.qty
        })),
        currency: 'EUR' as const,
        shipping_method: 'HOME' as const,
        payment_method: paymentMethod === 'card' ? 'CARD' as const : 'COD' as const,
        shipping_address: shippingAddress,
        shipping_cost: shippingCost,
        notes: ''
      };

      const order = await apiClient.createOrder(orderData);

      // Store customer details for order confirmation/email
      sessionStorage.setItem('dixis:last-order-customer', JSON.stringify(body.customer));

      // Handle card payment via Stripe Elements
      if (paymentMethod === 'card') {
        setCardProcessing(true)
        try {
          // Initialize payment intent to get client_secret for Stripe Elements
          const paymentInit = await paymentApi.initPayment(order.id, {
            customer: {
              email: body.customer.email,
              firstName: body.customer.name.split(' ')[0],
              lastName: body.customer.name.split(' ').slice(1).join(' ') || undefined,
            },
            return_url: `${window.location.origin}/thank-you?id=${order.id}`,
          })

          // Store order info and show Stripe Elements form
          setPendingOrderId(order.id)
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
      router.push(`/thank-you?id=${order.id}`)
    } catch (err) {
      console.error('Order creation failed:', err)
      setError(t('checkoutPage.orderError'))
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

          <div className="border-t pt-3">
            <div className="flex justify-between font-medium">
              <span>{t('checkoutPage.subtotal')}:</span>
              <span>{fmt.format(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('checkoutPage.shippingNote')}
            </p>
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
