'use client'
import { useState, useEffect } from 'react'

interface OrderItem {
  id: string
  qty: number
  price: number
  titleSnap: string
}

interface Order {
  id: string
  status: string
  total: number
  subtotal?: number
  shipping?: number
  vat?: number
  zone?: string
  email: string | null
  name: string | null
  items: OrderItem[]
}

export default function ThankYouPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  const orderId = searchParams?.id || ''
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' })

  useEffect(() => {
    if (!orderId) {
      setError('Δεν βρέθηκε κωδικός παραγγελίας')
      setLoading(false)
      return
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch order')
        }
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        console.error('Fetch order error:', err)
        setError('Αποτυχία φόρτωσης παραγγελίας')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-red-600 mb-4">{error || 'Δεν βρέθηκε η παραγγελία'}</p>
          <a href="/products" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            Συνέχεια στα προϊόντα
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4" data-testid="thank-you-page">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="mb-6">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-emerald-600 mb-2">Ευχαριστούμε!</h1>
            <p className="text-gray-600">Η παραγγελία σας καταχωρήθηκε επιτυχώς.</p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-6 mb-6 text-left">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 mb-1">Αριθμός παραγγελίας:</p>
              <p className="text-xl font-bold font-mono text-emerald-600" data-testid="order-id">{order.id}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Στοιχεία Παραγγελίας</h3>
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

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Υποσύνολο:</span>
                  <span>{fmt.format(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Αποστολή ({order.zone === 'islands' ? 'Νησιά' : 'Ηπειρωτική Ελλάδα'}):</span>
                  <span>{fmt.format(order.shipping || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ΦΠΑ (24%):</span>
                  <span>{fmt.format(order.vat || 0)}</span>
                </div>
              </div>

              <div className="border-t mt-3 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Σύνολο:</span>
                  <span data-testid="order-total">{fmt.format(order.total)}</span>
                </div>
              </div>
            </div>

            {order.email && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600">
                  Θα λάβετε email επιβεβαίωσης στο <span className="font-medium">{order.email}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <a
              href="/products"
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium"
            >
              Συνέχεια στα προϊόντα
            </a>
            <a
              href="/"
              className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Αρχική σελίδα
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
