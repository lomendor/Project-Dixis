import StatusBadge from '@/components/admin/StatusBadge'
import { getServerApiUrl } from '@/env'
import Timeline from './components/Timeline'
import { normalizeStatus } from '@/lib/tracking/status'

/**
 * Pass TRACKING-DISPLAY-01: Public order tracking page using Laravel API
 *
 * Fetches order status by public token (UUID) from Laravel backend.
 * No authentication required - safe for sharing with customers.
 */

/**
 * Stable date formatter for Server Components (avoids hydration mismatch).
 */
function formatDateStable(date: string | Date | null): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

interface StatusHistoryEntry {
  status: string
  changed_at: string
  note: string | null
}

interface TrackingOrder {
  id: number
  status: string
  payment_status: string
  created_at: string
  updated_at: string
  items_count: number
  total: number
  status_history?: StatusHistoryEntry[]
  shipment?: {
    status: string
    carrier_code: string | null
    tracking_code: string | null
    tracking_url: string | null
    shipped_at: string | null
    delivered_at: string | null
    estimated_delivery: string | null
  }
}

interface TrackingResponse {
  ok: boolean
  order: TrackingOrder
}

async function fetchTrackingData(token: string): Promise<TrackingOrder | null> {
  try {
    // Pass TRACKING-DISPLAY-01: Use Laravel API (single source of truth)
    const apiBase = getServerApiUrl()
    const res = await fetch(`${apiBase}/public/orders/track/${token}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })
    if (!res.ok) return null
    const data: TrackingResponse = await res.json()
    return data.order
  } catch {
    return null
  }
}

export default async function TrackPage({ params }: { params: { token: string } }) {
  const order = await fetchTrackingData(params.token)

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-4 sm:p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Παραγγελία δεν βρέθηκε</h1>
          <p className="text-neutral-600">
            Ο σύνδεσμος παρακολούθησης δεν είναι έγκυρος ή η παραγγελία δεν υπάρχει.
          </p>
        </div>
      </div>
    )
  }

  const fmt = (n: number) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n)

  // Status labels in Greek
  const statusLabels: Record<string, string> = {
    pending: 'Εκκρεμεί',
    processing: 'Σε επεξεργασία',
    shipped: 'Απεστάλη',
    delivered: 'Παραδόθηκε',
    completed: 'Ολοκληρώθηκε',
    cancelled: 'Ακυρώθηκε',
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">Παρακολούθηση Παραγγελίας</h1>

          {/* Order Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-neutral-600">Κωδικός:</span>
              <span className="font-mono font-semibold text-lg">#{order.id}</span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-neutral-600">Κατάσταση:</span>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-neutral-600">Ημερομηνία:</span>
              <span>{formatDateStable(order.created_at)}</span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-neutral-600">Προϊόντα:</span>
              <span>{order.items_count} τεμάχια</span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-neutral-600">Σύνολο:</span>
              <span className="font-semibold text-primary">{fmt(order.total)}</span>
            </div>
          </div>

          {/* T1-05: Status Timeline */}
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Πρόοδος Παραγγελίας</h2>
            <Timeline
              currentStatus={normalizeStatus(order.status)}
              history={order.status_history}
              orderCreatedAt={order.created_at}
            />
          </div>

          {/* Shipment Info */}
          {order.shipment && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Πληροφορίες Αποστολής</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Κατάσταση αποστολής:</span>
                  <span className="capitalize">{statusLabels[order.shipment.status] || order.shipment.status}</span>
                </div>

                {order.shipment.carrier_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Μεταφορέας:</span>
                    <span className="uppercase">{order.shipment.carrier_code}</span>
                  </div>
                )}

                {order.shipment.tracking_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Αριθμός Αποστολής:</span>
                    <span className="font-mono">{order.shipment.tracking_code}</span>
                  </div>
                )}

                {order.shipment.tracking_url && (
                  <div className="mt-4">
                    <a
                      href={order.shipment.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                    >
                      Παρακολούθηση στον Μεταφορέα
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}

                {order.shipment.shipped_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Ημ/νία αποστολής:</span>
                    <span>{formatDateStable(order.shipment.shipped_at)}</span>
                  </div>
                )}

                {order.shipment.estimated_delivery && !order.shipment.delivered_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Εκτιμώμενη παράδοση:</span>
                    <span>{formatDateStable(order.shipment.estimated_delivery)}</span>
                  </div>
                )}

                {order.shipment.delivered_at && (
                  <div className="flex items-center justify-between text-primary">
                    <span>Παραδόθηκε:</span>
                    <span>{formatDateStable(order.shipment.delivered_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-neutral-500">
              Αυτός ο σύνδεσμος είναι μόνο για ενημέρωση κατάστασης.
            </p>
            <a href="/" className="text-primary hover:underline text-sm mt-2 inline-block">
              Επιστροφή στην αρχική
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
