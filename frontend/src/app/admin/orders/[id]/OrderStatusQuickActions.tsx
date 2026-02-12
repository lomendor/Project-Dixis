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

export function OrderStatusQuickActions({ orderId, currentStatus, paymentMethod, paymentStatus }: Props) {
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [paidConfirmed, setPaidConfirmed] = useState(
    (paymentStatus || '').toLowerCase() === 'completed'
  )

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
    } catch (e) {
      console.error('Payment confirm error:', e)
      showError('Σφάλμα κατά την επιβεβαίωση πληρωμής')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        throw new Error('Status change failed')
      }

      setStatus(newStatus)

      // Reload page to show updated data
      window.location.reload()
    } catch (e) {
      console.error('Status change error:', e)
      showError('Σφάλμα κατά την αλλαγή κατάστασης')
    } finally {
      setLoading(false)
    }
  }

  const showPacking = ['PENDING', 'PAID'].includes(status.toUpperCase())
  const showShipped = status.toUpperCase() === 'PACKING'
  // Pass COD-COMPLETE: Show confirm payment for COD orders with pending payment
  const isCod = (paymentMethod || '').toUpperCase() === 'COD'
  const showConfirmPayment = isCod && !paidConfirmed

  if (!showPacking && !showShipped && !showConfirmPayment) {
    return null
  }

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
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
      </div>
      <div className="mt-3 text-sm text-gray-500">
        Τρέχουσα κατάσταση: <span className="font-medium">{statusLabels[status.toUpperCase()] || status}</span>
      </div>
    </div>
  )
}
