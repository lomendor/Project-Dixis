'use client'
import { OrderStatus, STATUS_ORDER, EL_LABEL, getStatusIndex, normalizeStatus } from '@/lib/tracking/status'

interface StatusHistoryEntry {
  status: string
  changed_at: string
  note: string | null
}

interface TimelineProps {
  currentStatus: OrderStatus
  history?: StatusHistoryEntry[]
  orderCreatedAt?: string
}

/**
 * Backend statuses → frontend status mapping.
 * Backend uses: pending, confirmed, processing, shipped, delivered, cancelled
 * Frontend uses: PAID, PACKING, SHIPPED, DELIVERED, CANCELLED
 */
function mapBackendStatus(s: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    pending: 'PAID',
    confirmed: 'PACKING',
    processing: 'PACKING',
    shipped: 'SHIPPED',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  }
  return map[s.toLowerCase()] ?? normalizeStatus(s)
}

/**
 * Format ISO date to short Greek display: "17/02 14:30"
 */
function fmtDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month} ${hours}:${mins}`
}

export default function Timeline({ currentStatus, history, orderCreatedAt }: TimelineProps) {
  const currentIdx = getStatusIndex(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'

  // Build a map: frontend status → timestamp (from history)
  const statusTimestamps: Partial<Record<OrderStatus, string>> = {}

  // Order creation = PAID timestamp
  if (orderCreatedAt) {
    statusTimestamps.PAID = orderCreatedAt
  }

  // Map history entries to frontend statuses
  if (history && history.length > 0) {
    for (const entry of history) {
      const frontendStatus = mapBackendStatus(entry.status)
      // Keep earliest timestamp for each status
      if (!statusTimestamps[frontendStatus]) {
        statusTimestamps[frontendStatus] = entry.changed_at
      }
    }
  }

  return (
    <div className="py-5">
      <ol role="list" className="flex items-start relative" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {STATUS_ORDER.map((status, idx) => {
          const isCompleted = !isCancelled && idx <= currentIdx
          const isCurrent = status === currentStatus && !isCancelled
          const timestamp = statusTimestamps[status]

          return (
            <li key={status} role="listitem" aria-current={isCurrent ? 'step' : undefined} className="flex-1 relative flex flex-col items-center">
              {/* Connecting line */}
              {idx < STATUS_ORDER.length - 1 && (
                <div
                  className="absolute top-4 left-1/2 w-full h-0.5"
                  style={{ backgroundColor: isCompleted ? '#16a34a' : '#e5e7eb', zIndex: 0 }}
                />
              )}

              {/* Status node */}
              <div
                className="flex items-center justify-center relative"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#16a34a' : '#e5e7eb',
                  border: isCurrent ? '3px solid #16a34a' : 'none',
                  zIndex: 1,
                }}
              >
                {isCompleted && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <div
                className="mt-2 text-center"
                style={{
                  fontSize: '12px',
                  color: isCompleted ? '#16a34a' : '#6b7280',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  maxWidth: '80px',
                }}
              >
                {EL_LABEL[status]}
              </div>

              {/* T1-05: Timestamp below label */}
              {timestamp && (
                <div className="mt-1 text-center" style={{ fontSize: '10px', color: '#9ca3af', maxWidth: '80px' }}>
                  {fmtDate(timestamp)}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {/* Cancelled status indicator */}
      {isCancelled && (
        <div
          role="alert"
          className="mt-5 p-3 text-center font-bold"
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
          }}
        >
          {EL_LABEL.CANCELLED}
        </div>
      )}
    </div>
  )
}
