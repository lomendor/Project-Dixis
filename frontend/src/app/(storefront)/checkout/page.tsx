'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, cartTotalCents } from '@/lib/cart'
import { apiClient } from '@/lib/api'
import PaymentMethodSelector, { type PaymentMethod } from '@/components/checkout/PaymentMethodSelector'

function CheckoutContent() {
  const router = useRouter()
  const cartItems = useCart(s => s.items)
  const clear = useCart(s => s.clear)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [cardProcessing, setCardProcessing] = useState(false)
  // Fix React error #418: Prevent hydration mismatch by waiting for client mount
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  // Calculate subtotal from cart items (for display only)
  const subtotalCents = cartTotalCents(cartItems)
  const subtotal = subtotalCents / 100

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
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

      // Handle card payment via Stripe
      if (paymentMethod === 'card') {
        setCardProcessing(true)
        try {
          const paymentSession = await apiClient.createPaymentCheckout(order.id)
          clear()
          // Redirect to Stripe Checkout
          window.location.href = paymentSession.redirect_url
          return
        } catch (paymentErr) {
          console.error('Card payment init failed:', paymentErr)
          setError('Σφάλμα κατά την εκκίνηση πληρωμής με κάρτα. Παρακαλώ δοκιμάστε ξανά.')
          setCardProcessing(false)
          return
        }
      }

      // COD: Clear cart and redirect to thank-you page
      clear()
      router.push(`/thank-you?id=${order.id}`)
    } catch (err) {
      console.error('Order creation failed:', err)
      setError('Σφάλμα κατά τη δημιουργία παραγγελίας. Παρακαλώ δοκιμάστε ξανά.')
    } finally {
      setLoading(false)
    }
  }

  // Fix React error #418: Show loading during SSR/hydration
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </main>
    )
  }

  // If cart is empty, show message
  if (Object.keys(cartItems).length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600 mb-4">Το καλάθι σας είναι κενό</p>
          <a href="/products" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 active:opacity-90 touch-manipulation">
            Προβολή Προϊόντων
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4" data-testid="checkout-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Checkout</h1>

        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Στοιχεία Παραγγελίας</h2>
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
              <span>Υποσύνολο:</span>
              <span>{fmt.format(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Τα μεταφορικά και ο ΦΠΑ θα υπολογιστούν στο επόμενο βήμα
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6" data-testid="checkout-form">
          <h2 className="font-semibold mb-4">Στοιχεία Αποστολής</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="checkout-name" className="block text-sm font-medium mb-1">Ονοματεπώνυμο</label>
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
              <label htmlFor="checkout-phone" className="block text-sm font-medium mb-1">Τηλέφωνο</label>
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
              <label htmlFor="checkout-email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="w-full h-11 px-4 border rounded-lg text-base"
                data-testid="checkout-email"
              />
            </div>

            <div>
              <label htmlFor="checkout-address" className="block text-sm font-medium mb-1">Διεύθυνση</label>
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
              <label htmlFor="checkout-city" className="block text-sm font-medium mb-1">Πόλη</label>
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
              <label htmlFor="checkout-postcode" className="block text-sm font-medium mb-1">Ταχυδρομικός Κώδικας</label>
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
                ? 'Μεταφορά στη σελίδα πληρωμής...'
                : loading
                  ? 'Επεξεργασία...'
                  : paymentMethod === 'card'
                    ? 'Συνέχεια στην Πληρωμή'
                    : 'Ολοκλήρωση Παραγγελίας'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
