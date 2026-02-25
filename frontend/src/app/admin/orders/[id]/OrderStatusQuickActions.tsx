'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface Props {
  orderId: string
  currentStatus: string
  paymentMethod?: string | null
  paymentStatus?: string | null
}

const statusLabels: Record<string, string> = {
  PENDING: 'Εκκρεμής',
  PAID: 'Πληρωμένη',
  PACKING: 'Συσκευασία',
  SHIPPED: 'Απεστάλη',
  DELIVERED: 'Παραδόθηκε',
  CANCELLED: 'Ακυρώθηκε'
}

const ALL_STATUSES = ['PENDING', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

export function OrderStatusQuickActions({ orderId, currentStatus, paymentMethod, paymentStatus }: Props) {
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [paidConfirmed, setPaidConfirmed] = useState(
    (paymentStatus || '').toLowerCase() === 'completed'
  )
  const [showOverride, setShowOverride] = useState(false)
  const [overrideTarget, setOverrideTarget] = useState('')

  // Pass COD-COMPLETE: Confirm COD payment
  const handleConfirmPayment = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Payment confirm failed')
      setPaidConfirmed(true)
      showSuccess('Η πληρωμή επιβεβαιώθηκε')
      window.location.reload()
    } catch {
      showError('Σφάλμα κατά την επιβεβαίωση πληρωμής')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string, force = false) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...(force ? { force: true } : {}) })
      })

      if (!res.ok) {
        throw new Error('Status change failed')
      }

      setStatus(newStatus)
      setShowOverride(false)
      showSuccess(`Κατάσταση → ${statusLabels[newStatus.toUpperCase()] || newStatus}`)
      window.location.reload()
    } catch {
      showError('Σφάλμα κατά την αλλαγή κατάστασης')
    } finally {
      setLoading(false)
    }
  }

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const showPacking = ['PENDING', 'PAID'].includes(status.toUpperCase())
  const showShipped = status.toUpperCase() === 'PACKING'
  // T2-04: Show cancel button for cancellable statuses
  const showCancel = ['PENDING', 'PAID', 'PACKING'].includes(status.toUpperCase())
  // Pass COD-COMPLETE: Show confirm payment for COD orders with pending payment
  const isCod = (paymentMethod || '').toUpperCase() === 'COD'
  const showConfirmPayment = isCod && !paidConfirmed

  const hasQuickActions = showPacking || showShipped || showConfirmPayment || showCancel
  const otherStatuses = ALL_STATUSES.filter(s => s !== status.toUpperCase())

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      {/* Quick Actions (normal flow) */}
      {hasQuickActions && (
        <>
          <p className="text-sm text-gray-600 mb-3">Γρήγορες ενέργειες:</p>
          <div className="space-y-2">
            {showConfirmPayment && (
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                data-testid="qa-confirm-payment"
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Επιβεβαίωση...' : 'Επιβεβαίωση Πληρωμής (Αντικαταβολή)'}
              </button>
            )}
            {paidConfirmed && isCod && (
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium text-center">
                Η πληρωμή έχει επιβεβαιωθεί
              </div>
            )}
            {showPacking && (
              <button
                onClick={() => handleStatusChange('PACKING')}
                disabled={loading}
                data-testid="qa-packing"
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Αλλαγή...' : 'Συσκευασία'}
              </button>
            )}
            {showShipped && (
              <button
                onClick={() => handleStatusChange('SHIPPED')}
                disabled={loading}
                data-testid="qa-shipped"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Αλλαγή...' : 'Απεστάλη'}
              </button>
            )}
            {showCancel && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={loading}
                data-testid="qa-cancel"
                className="w-full px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ακύρωση Παραγγελίας
              </button>
            )}
            {showCancelConfirm && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <p className="text-sm text-red-800 font-medium">
                  Σίγουρα θέλετε να ακυρώσετε; Το απόθεμα θα επιστραφεί αυτόματα.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowCancelConfirm(false); handleStatusChange('CANCELLED'); }}
                    disabled={loading}
                    data-testid="qa-cancel-confirm"
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? 'Ακύρωση...' : 'Ναι, ακύρωσε'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-sm"
                  >
                    Όχι
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Current status */}
      <div className={`${hasQuickActions ? 'mt-3' : ''} text-sm text-gray-500`}>
        Τρέχουσα κατάσταση: <span className="font-medium">{statusLabels[status.toUpperCase()] || status}</span>
      </div>

      {/* Admin Override — always visible */}
      <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
        {!showOverride ? (
          <button
            onClick={() => setShowOverride(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="admin-override-toggle"
          >
            ⚙ Αλλαγή κατάστασης (admin override)
          </button>
        ) : (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2" data-testid="admin-override-panel">
            <p className="text-xs text-orange-700 font-medium">
              ⚠ Admin Override — παρακάμπτει τους κανόνες μετάβασης
            </p>
            <div className="flex gap-2 items-center">
              <select
                value={overrideTarget}
                onChange={(e) => setOverrideTarget(e.target.value)}
                className="flex-1 border border-orange-300 rounded-lg px-3 py-2 text-sm bg-white"
                data-testid="admin-override-select"
              >
                <option value="">Επιλέξτε κατάσταση...</option>
                {otherStatuses.map(s => (
                  <option key={s} value={s}>{statusLabels[s] || s}</option>
                ))}
              </select>
              <button
                onClick={() => overrideTarget && handleStatusChange(overrideTarget, true)}
                disabled={loading || !overrideTarget}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                data-testid="admin-override-apply"
              >
                {loading ? 'Αλλαγή...' : 'Εφαρμογή'}
              </button>
              <button
                onClick={() => { setShowOverride(false); setOverrideTarget('') }}
                className="px-3 py-2 border rounded-lg text-sm text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
