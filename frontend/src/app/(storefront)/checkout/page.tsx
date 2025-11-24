'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, cartTotalCents } from '@/lib/cart'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCart(s => s.items)
  const clear = useCart(s => s.clear)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalCents = cartTotalCents(items)
  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
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

      // Clear cart and redirect to success
      clear()
      router.push(`/checkout/success?orderId=${data.orderId}`)
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (Object.keys(items).length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600 mb-4">Το καλάθι σας είναι άδειο.</p>
          <a href="/products" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            Συνέχεια αγορών
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
          <p className="text-sm text-gray-600 mb-4">
            Σύνολο: <span className="font-bold">{fmt.format(totalCents / 100)}</span>
          </p>
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
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
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
