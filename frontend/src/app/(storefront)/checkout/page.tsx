'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/cart'

interface OrderItem {
  id: string
  productId: string
  qty: number
  price: number
  titleSnap: string
}

interface Order {
  id: string
  status: string
  total: number
  items: OrderItem[]
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const clear = useCart(s => s.clear)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')

  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  useEffect(() => {
    if (!orderId) {
      setFetchError('Δεν βρέθηκε κωδικός παραγγελίας')
      return
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/order-intents/${orderId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch order')
        }
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        console.error('Fetch order error:', err)
        setFetchError('Αποτυχία φόρτωσης παραγγελίας')
      }
    }

    fetchOrder()
  }, [orderId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!orderId) {
      setError('Δεν βρέθηκε κωδικός παραγγελίας')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      phone: formData.get('phone') || ''
    }

    try {
      const res = await fetch(`/api/order-intents/${orderId}`, {
        method: 'PATCH',
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
      router.push(`/thank-you?id=${data.id}`)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Παρουσιάστηκε σφάλμα')
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-red-600 mb-4">{fetchError}</p>
          <a href="/cart" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            Επιστροφή στο καλάθι
          </a>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600">Φόρτωση παραγγελίας...</p>
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
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.titleSnap} x {item.qty}
                </span>
                <span className="font-medium">
                  {fmt.format(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold">
              <span>Σύνολο:</span>
              <span>{fmt.format(order.total)}</span>
            </div>
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
