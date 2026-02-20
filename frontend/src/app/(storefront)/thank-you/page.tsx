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
        // Pass CHECKOUT-TOKEN-FIX-01: showByToken now returns either OrderResource
        // or CheckoutSessionResource (for multi-producer orders)
        const laravelOrder = await apiClient.getOrderByToken(orderToken)

        // Detect if this is a CheckoutSession (multi-producer) or single Order
        const isCheckoutSession = (laravelOrder as any).type === 'checkout_session'

        if (isCheckoutSession) {
          // Multi-producer: flatten child orders into a single thank-you view
          const session = laravelOrder as any
          const allItems: OrderItem[] = []

          // Collect items from all child orders
          const childOrders = session.orders || []
          for (const childOrder of childOrders) {
            const items = childOrder.items || childOrder.order_items || []
            for (const item of items) {
              allItems.push({
                id: String(item.id),
                qty: item.quantity,
                price: parseFloat(item.unit_price || item.price) || 0,
                titleSnap: item.product_name || 'Προϊόν',
              })
            }
          }

          const transformedOrder: Order = {
            id: String(session.id),
            status: session.status,
            total: parseFloat(session.total) || 0,
            subtotal: parseFloat(session.subtotal) || 0,
            shipping: parseFloat(session.shipping_total) || 0,
            codFee: parseFloat(session.cod_fee) || 0,
            vat: 0,
            zone: 'mainland',
            email: null,
            name: null,
            isMultiProducer: session.is_multi_producer || false,
            shippingLines: session.shipping_lines || [],
            publicToken: session.public_token || undefined,
            items: allItems,
          }
          setOrder(transformedOrder)
        } else {
          // Single-producer: existing logic
          const orderItems = laravelOrder.items || laravelOrder.order_items || []
          const shippingAmount = laravelOrder.shipping_total
            ? parseFloat(laravelOrder.shipping_total)
            : (parseFloat(laravelOrder.shipping_amount) || laravelOrder.shipping_cost || 0)
          const transformedOrder: Order = {
            id: String(laravelOrder.id),
            status: laravelOrder.status,
            total: parseFloat(laravelOrder.total_amount) || 0,
            subtotal: parseFloat(laravelOrder.subtotal) || 0,
            shipping: shippingAmount,
            codFee: parseFloat(laravelOrder.cod_fee) || 0,
            vat: parseFloat(laravelOrder.tax_amount) || 0,
            zone: 'mainland',
            email: null,
            name: null,
            isMultiProducer: laravelOrder.is_multi_producer || false,
            shippingLines: laravelOrder.shipping_lines || [],
            publicToken: laravelOrder.public_token || undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: orderItems.map((item: any) => ({
              id: String(item.id),
              qty: item.quantity,
              price: parseFloat(item.unit_price || item.price) || 0,
              titleSnap: item.product_name || 'Προϊόν',
            })),
          }
          setOrder(transformedOrder)
        }
      } catch {
        setError('Αποτυχία φόρτωσης παραγγελίας')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderToken])

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-neutral-600">Φόρτωση...</p>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center">
          <p className="text-red-600 mb-4">{error || 'Δεν βρέθηκε η παραγγελία'}</p>
          <a href="/products" className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light">
            Συνέχεια στα προϊόντα
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-8 px-4" data-testid="thank-you-page">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="mb-6">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-primary mb-2">Ευχαριστούμε!</h1>
            <p className="text-neutral-600">Η παραγγελία σας καταχωρήθηκε επιτυχώς.</p>
          </div>

          <div className="bg-neutral-50 border rounded-lg p-6 mb-6 text-left">
            <div className="text-center mb-4">
              <p className="text-sm text-neutral-500 mb-1">Αριθμός παραγγελίας:</p>
              <p className="text-xl font-bold font-mono text-primary" data-testid="order-id">{order.id}</p>
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
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 my-2" data-testid="multi-producer-notice">
                      <svg className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-amber-800">
                        Θα λάβετε <strong>ξεχωριστά δέματα</strong> από κάθε παραγωγό.
                      </p>
                    </div>
                    <div className="text-neutral-600 font-medium pt-1">Μεταφορικά ανά παραγωγό:</div>
                    {order.shippingLines.map((line, idx) => (
                      <div key={idx} className="flex justify-between pl-3 text-neutral-600">
                        <span>{line.producer_name}:</span>
                        <span>
                          {line.free_shipping_applied
                            ? 'Δωρεάν'
                            : fmt.format(parseFloat(line.shipping_cost) || 0)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t border-neutral-200 pt-1">
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
                <p className="text-sm text-neutral-600">
                  Θα λάβετε email επιβεβαίωσης στο <span className="font-medium">{order.email}</span>
                </p>
              </div>
            )}

            {/* Pass TRACKING-DISPLAY-01: Tracking link for customer */}
            {order.publicToken && (
              <div className="border-t pt-4 mt-4 bg-primary-pale -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                <p className="text-sm text-neutral-700 mb-2">
                  Παρακολουθήστε την παραγγελία σας:
                </p>
                <a
                  href={`/track/${order.publicToken}`}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-medium"
                  data-testid="tracking-link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Σελίδα παρακολούθησης
                </a>
                <p className="text-xs text-neutral-500 mt-2">
                  Μπορείτε να αποθηκεύσετε αυτόν τον σύνδεσμο για να ελέγχετε την κατάσταση της παραγγελίας σας.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <a
              href="/products"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light font-medium"
            >
              Συνέχεια στα προϊόντα
            </a>
            <a
              href="/"
              className="inline-block border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-50"
            >
              Αρχική σελίδα
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
