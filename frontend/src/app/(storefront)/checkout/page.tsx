'use client'
import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, cartTotalCents } from '@/lib/cart'

function CheckoutContent() {
  const router = useRouter()
  const cartItems = useCart(s => s.items)
  const clear = useCart(s => s.clear)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      items
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Checkout failed')
        return
      }

      // Clear cart and redirect to thank-you
      clear()
      router.push(`/thank-you?id=${data.orderId}`)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Παρουσιάστηκε σφάλμα')
    } finally {
      setLoading(false)
    }
  }

  // If cart is empty, show message
  if (Object.keys(cartItems).length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600 mb-4">Το καλάθι σας είναι κενό</p>
          <a href="/products" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            Προβολή Προϊόντων
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4" data-testid="checkout-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

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
              <label className="block text-sm font-medium mb-1">Ονοματεπώνυμο</label>
              <input
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Τηλέφωνο</label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="+30 210 1234567"
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Διεύθυνση</label>
              <input
                name="address"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Πόλη</label>
              <input
                name="city"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ταχυδρομικός Κώδικας</label>
              <input
                name="postcode"
                required
                pattern="[0-9]{5}"
                placeholder="10671"
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-postcode"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm" data-testid="checkout-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg"
              data-testid="checkout-submit"
            >
              {loading ? 'Επεξεργασία...' : 'Ολοκλήρωση Παραγγελίας'}
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
