'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import AdminLoading from '@/app/admin/components/AdminLoading'
import AdminEmptyState from '@/app/admin/components/AdminEmptyState'

interface Producer {
  id: string
  name: string
  businessName: string
  region: string
  email: string
  phone: string
  description: string
  city: string
  taxId: string
  isActive: boolean
  approvalStatus: string
  rejectionReason: string | null
  createdAt: string
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending:  { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Σε αναμονή' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Εγκεκριμένος' },
    rejected: { bg: 'bg-red-100',   text: 'text-red-800',   label: 'Απορρίφθηκε' },
  }
  const c = config[status] || config.pending
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      data-testid={`producer-status-${status}`}
    >
      {c.label}
    </span>
  )
}

export default function AdminProducersPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminProducersContent />
    </Suspense>
  )
}

function AdminProducersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSuccess, showError } = useToast()

  const [producers, setProducers] = useState<Producer[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [producerToReject, setProducerToReject] = useState<{ id: string; name: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const statusFilter = searchParams.get('status') || 'all'
  const q = searchParams.get('q') || ''

  useEffect(() => {
    loadProducers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, q])

  async function loadProducers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/producers?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      let items: Producer[] = data?.items || data || []

      // Client-side search filter
      if (q) {
        const lower = q.toLowerCase()
        items = items.filter(p =>
          (p.name || '').toLowerCase().includes(lower) ||
          (p.businessName || '').toLowerCase().includes(lower) ||
          (p.email || '').toLowerCase().includes(lower) ||
          (p.region || '').toLowerCase().includes(lower)
        )
      }

      setProducers(items)
    } catch {
      showError('Αποτυχία φόρτωσης παραγωγών')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(producerId: string) {
    setProcessingIds(prev => new Set([...prev, producerId]))
    try {
      const res = await fetch(`/api/admin/producers/${producerId}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Ο παραγωγός εγκρίθηκε επιτυχώς')
      await loadProducers()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Αποτυχία έγκρισης παραγωγού')
    } finally {
      setProcessingIds(prev => { const s = new Set(prev); s.delete(producerId); return s })
    }
  }

  function handleRejectClick(producer: { id: string; name: string }) {
    setProducerToReject(producer)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  async function handleRejectConfirm() {
    if (!producerToReject || rejectionReason.length < 5) return
    setSubmitting(true)
    setProcessingIds(prev => new Set([...prev, producerToReject.id]))
    try {
      const res = await fetch(`/api/admin/producers/${producerToReject.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Ο παραγωγός απορρίφθηκε')
      setRejectModalOpen(false)
      setProducerToReject(null)
      await loadProducers()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Αποτυχία απόρριψης παραγωγού')
    } finally {
      setSubmitting(false)
      if (producerToReject) {
        setProcessingIds(prev => { const s = new Set(prev); s.delete(producerToReject.id); return s })
      }
    }
  }

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    router.push(`/admin/producers?${params.toString()}`)
  }

  const pendingCount = producers.filter(p => p.approvalStatus === 'pending').length

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Παραγωγοί</h1>
          <p className="text-sm text-gray-500 mt-1">Διαχείριση αιτήσεων και εγκρίσεων παραγωγών</p>
        </div>
        {pendingCount > 0 && statusFilter === 'all' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {pendingCount} σε αναμονή
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          defaultValue={q}
          placeholder="Αναζήτηση ονόματος, email..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyDown={e => { if (e.key === 'Enter') handleFilterChange('q', (e.target as HTMLInputElement).value) }}
          data-testid="producer-search"
        />
        <select
          value={statusFilter}
          onChange={e => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          data-testid="producer-status-filter"
        >
          <option value="all">Όλοι</option>
          <option value="pending">Σε αναμονή</option>
          <option value="active">Εγκεκριμένοι</option>
          <option value="inactive">Απορρίφθηκαν</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <AdminLoading />
      ) : producers.length === 0 ? (
        <AdminEmptyState message="Δεν βρέθηκαν παραγωγοί." />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Όνομα</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Περιοχή</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Κατάσταση</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {producers.map(p => (
                <React.Fragment key={p.id}>
                  <tr
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${expandedId === p.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    data-testid={`producer-row-${p.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.name || '—'}</div>
                      {p.businessName && p.businessName !== p.name && (
                        <div className="text-xs text-gray-500">{p.businessName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.region || p.city || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.approvalStatus} /></td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {p.approvalStatus === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={processingIds.has(p.id)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            data-testid={`approve-btn-${p.id}`}
                          >
                            {processingIds.has(p.id) ? '...' : 'Έγκριση'}
                          </button>
                          <button
                            onClick={() => handleRejectClick({ id: p.id, name: p.name })}
                            disabled={processingIds.has(p.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            data-testid={`reject-btn-${p.id}`}
                          >
                            Απόρριψη
                          </button>
                        </div>
                      )}
                      <span className="text-xs text-gray-400 ml-2">
                        {expandedId === p.id ? '▲' : '▼'}
                      </span>
                    </td>
                  </tr>

                  {/* Expandable detail row */}
                  {expandedId === p.id && (
                    <tr className="bg-blue-50/50" data-testid={`producer-detail-${p.id}`}>
                      <td colSpan={4} className="px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          <Detail label="Email" value={p.email} />
                          <Detail label="Τηλέφωνο" value={p.phone} />
                          <Detail label="Πόλη" value={p.city} />
                          <Detail label="Περιοχή" value={p.region} />
                          <Detail label="ΑΦΜ" value={p.taxId} />
                          <Detail label="Εγγραφή" value={p.createdAt ? new Date(p.createdAt).toLocaleDateString('el-GR') : ''} />
                          {p.description && (
                            <div className="sm:col-span-2">
                              <span className="text-gray-500">Περιγραφή: </span>
                              <span className="text-gray-900">{p.description}</span>
                            </div>
                          )}
                          {p.rejectionReason && (
                            <div className="sm:col-span-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                              <span className="text-red-700 font-medium">Λόγος απόρριψης: </span>
                              <span className="text-red-800">{p.rejectionReason}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Επιστροφή στο Admin
        </Link>
      </div>

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setRejectModalOpen(false)}
          data-testid="rejection-modal"
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1" data-testid="rejection-modal-title">
              Απόρριψη Παραγωγού
            </h3>
            <p className="text-gray-600 mb-4">
              Παραγωγός: <strong>{producerToReject?.name}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Λόγος Απόρριψης *
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Εξηγήστε γιατί απορρίπτεται ο παραγωγός..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              data-testid="rejection-reason-input"
            />
            {rejectionReason.length > 0 && rejectionReason.length < 5 && (
              <p className="text-red-600 text-sm mt-1">Τουλάχιστον 5 χαρακτήρες</p>
            )}
            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={() => { setRejectModalOpen(false); setRejectionReason('') }}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                data-testid="rejection-modal-cancel"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={submitting || rejectionReason.length < 5}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                data-testid="rejection-modal-confirm"
              >
                {submitting ? 'Απόρριψη...' : 'Απόρριψη'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}
