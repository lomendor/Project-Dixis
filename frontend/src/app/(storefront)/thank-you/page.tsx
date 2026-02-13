'use client'
import { useState, useEffect } from 'react'
import { apiClient, ShippingLine } from '@/lib/api'

interface OrderItem {
  id: string
  qty: number
  price: number
  titleSnap: string
}

// Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: Enhanced order interface for multi-producer checkout
// Pass TRACKING-DISPLAY-01: Added public_token for tracking link
interface Order {
  id: string
  status: string
  total: number
  subtotal?: number
  shipping?: number
  codFee?: number // Pass COD-FEE-FIX-01: COD surcharge
  vat?: number
  zone?: string
  email: string | null
  name: string | null
  items: OrderItem[]
  isMultiProducer?: boolean
  shippingLines?: ShippingLine[] // Per-producer shipping breakdown
  publicToken?: string // Pass TRACKING-DISPLAY-01: For tracking link
}

export default function ThankYouPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  // SECURITY FIX: Use token (UUID) instead of sequential ID for order lookup
  const orderToken = searchParams?.token || searchParams?.id || ''
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' })

  useEffect(() => {
    if (!orderToken) {
      setError('Δεν βρέθηκε κωδικός παραγγελίας')
      setLoading(false)
      return
    }

    async function fetchOrder() {
      try {
        // SECURITY FIX: Fetch by UUID token instead of sequential ID
        const laravelOrder = await apiClient.getOrderByToken(orderToken)

        // Transform Laravel order format to thank-you page format
        const orderItems = laravelOrder.items || laravelOrder.order_items || []
        // Pass MP-MULTI-PRODUCER-CHECKOUT-02: Prefer shipping_total (multi-producer sum)
        // over shipping_amount (single-producer). Backend provides shipping_total when
        // order has multiple producers with separate shipments.
        const shippingAmount = laravelOrder.shipping_total
          ? parseFloat(laravelOrder.shipping_total)
          : (parseFloat(laravelOrder.shipping_amount) || laravelOrder.shipping_cost || 0)
        // Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: Include per-producer shipping lines
        // Pass TRACKING-DISPLAY-01: Include public_token for tracking link
        const transformedOrder: Order = {
          id: String(laravelOrder.id),
          status: laravelOrder.status,
          total: parseFloat(laravelOrder.total_amount) || 0,
          subtotal: parseFloat(laravelOrder.subtotal) || 0,
          shipping: shippingAmount,
          codFee: parseFloat(laravelOrder.cod_fee) || 0,
          vat: parseFloat(laravelOrder.tax_amount) || 0,
          zone: 'mainland', // Default, could be derived from shipping_address if needed
          email: null, // Not exposed in public order response for privacy
          name: null,
          isMultiProducer: laravelOrder.is_multi_producer || false,
          shippingLines: laravelOrder.shipping_lines || [],
          publicToken: laravelOrder.public_token || undefined,
          items: orderItems.map((item) => ({
            id: String(item.id),
            qty: item.quantity,
            price: parseFloat(item.unit_price || item.price) || 0,
            titleSnap: item.product_name || 'Προϊόν',
          })),
        }
        setOrder(transformedOrder)
      } catch (err) {
        console.error('Fetch order error:', err)
        setError('Αποτυχία φόρτωσης παραγγελίας')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderToken])

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
                {/* Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: Show per-producer shipping for multi-producer orders */}
                {order.isMultiProducer && order.shippingLines && order.shippingLines.length > 1 ? (
                  <>
                    <div className="text-gray-600 font-medium pt-1">Μεταφορικά ανά παραγωγό:</div>
                    {order.shippingLines.map((line, idx) => (
                      <div key={idx} className="flex justify-between pl-3 text-gray-600">
                        <span>{line.producer_name}:</span>
                        <span>
                          {line.free_shipping_applied
                            ? 'Δωρεάν'
                            : fmt.format(parseFloat(line.shipping_cost) || 0)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t border-gray-200 pt-1">
                      <span>Σύνολο μεταφορικών:</span>
                      <span>{fmt.format(order.shipping || 0)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>
                      Αποστολή ({order.zone === 'islands' ? 'Νησιά' : 'Ηπειρωτική Ελλάδα'}):
                    </span>
                    <span>{fmt.format(order.shipping || 0)}</span>
                  </div>
                )}
{/* Pass COD-FEE-FIX-01: COD surcharge line */}
                {order.codFee != null && order.codFee > 0 && (
                  <div className="flex justify-between">
                    <span>Αντικαταβολή:</span>
                    <span>{fmt.format(order.codFee)}</span>
                  </div>
                )}
{/* VAT only shown when implemented (currently not calculated by backend) */}
                {order.vat != null && order.vat > 0 && (
                  <div className="flex justify-between">
                    <span>ΦΠΑ (24%):</span>
                    <span>{fmt.format(order.vat)}</span>
                  </div>
                )}
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

            {/* Pass TRACKING-DISPLAY-01: Tracking link for customer */}
            {order.publicToken && (
              <div className="border-t pt-4 mt-4 bg-emerald-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Παρακολουθήστε την παραγγελία σας:
                </p>
                <a
                  href={`/track/${order.publicToken}`}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  data-testid="tracking-link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Σελίδα παρακολούθησης
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  Μπορείτε να αποθηκεύσετε αυτόν τον σύνδεσμο για να ελέγχετε την κατάσταση της παραγγελίας σας.
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
