'use client'
import { OrderStatus, STATUS_ORDER, EL_LABEL, getStatusIndex } from '@/lib/tracking/status'

interface TimelineProps {
  currentStatus: OrderStatus
}

export default function Timeline({ currentStatus }: TimelineProps) {
  const currentIdx = getStatusIndex(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {STATUS_ORDER.map((status, idx) => {
          const isCompleted = !isCancelled && idx <= currentIdx
          const isCurrent = status === currentStatus && !isCancelled

          return (
            <div key={status} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Connecting line */}
              {idx < STATUS_ORDER.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '50%',
                  width: '100%',
                  height: '2px',
                  backgroundColor: isCompleted ? '#16a34a' : '#e5e7eb',
                  zIndex: 0
                }} />
              )}

              {/* Status node */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#16a34a' : '#e5e7eb',
                border: isCurrent ? '3px solid #16a34a' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                position: 'relative'
              }}>
                {isCompleted && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Label */}
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: isCompleted ? '#16a34a' : '#6b7280',
                fontWeight: isCurrent ? 'bold' : 'normal',
                textAlign: 'center',
                maxWidth: '80px'
              }}>
                {EL_LABEL[status]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cancelled status indicator */}
      {isCancelled && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {EL_LABEL.CANCELLED}
        </div>
      )}
    </div>
  )
}
