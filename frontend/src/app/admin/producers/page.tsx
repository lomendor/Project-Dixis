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
  region: string
  category: string
  isActive: boolean
  approvalStatus: string
  rejectionReason: string | null
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'background-color: #fef3c7; color: #92400e;',
    approved: 'background-color: #d1fae5; color: #065f46;',
    rejected: 'background-color: #fee2e2; color: #991b1b;'
  }
  const labels: Record<string, string> = {
    pending: 'Σε αναμονή',
    approved: 'Εγκεκριμένος',
    rejected: 'Απορρίφθηκε'
  }
  return (
    <span
      style={{ padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, ...parseStyle(styles[status] || '') }}
      data-testid={`producer-status-${status}`}
    >
      {labels[status] || status}
    </span>
  )
}

function parseStyle(s: string): React.CSSProperties {
  const obj: any = {}
  s.split(';').forEach(p => {
    const [k, v] = p.split(':').map(x => x.trim())
    if (k && v) obj[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v
  })
  return obj
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

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [producerToReject, setProducerToReject] = useState<{ id: string; name: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // PR-CRUD-01: Create producer modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Filters
  const q = searchParams.get('q') || ''
  const active = searchParams.get('active') || ''
  const sort = searchParams.get('sort') || 'name-asc'

  useEffect(() => {
    loadProducers()
  }, [q, active, sort])

  async function loadProducers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (active) params.set('active', active)
      if (sort) params.set('sort', sort)

      const res = await fetch(`/api/admin/producers?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setProducers(data?.items || data || [])
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
    } catch (err: any) {
      showError(err.message || 'Αποτυχία έγκρισης παραγωγού')
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
    } catch (err: any) {
      showError(err.message || 'Αποτυχία απόρριψης παραγωγού')
    } finally {
      setSubmitting(false)
      if (producerToReject) {
        setProcessingIds(prev => { const s = new Set(prev); s.delete(producerToReject.id); return s })
      }
    }
  }

  function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const newQ = fd.get('q') as string
    const newActive = fd.get('active') as string
    const newSort = fd.get('sort') as string
    if (newQ) params.set('q', newQ)
    if (newActive) params.set('active', newActive)
    if (newSort) params.set('sort', newSort)
    router.push(`/admin/producers?${params.toString()}`)
  }

  // PR-CRUD-01: Create producer
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      slug: (fd.get('name') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      region: fd.get('region') as string,
      category: fd.get('category') as string,
      email: fd.get('email') as string || undefined,
      phone: fd.get('phone') as string || undefined,
    }
    try {
      const res = await fetch('/api/admin/producers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Αποτυχία δημιουργίας')
      }
      showSuccess('Ο παραγωγός δημιουργήθηκε επιτυχώς')
      setCreateOpen(false)
      await loadProducers()
    } catch (err: any) {
      showError(err.message || 'Σφάλμα δημιουργίας παραγωγού')
    } finally {
      setCreating(false)
    }
  }

  return (
    <main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Παραγωγοί</h1>
        <button
          onClick={() => setCreateOpen(true)}
          style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          data-testid="create-producer-btn"
        >
          + Νέος Παραγωγός
        </button>
      </div>

      <form onSubmit={handleFilterSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: 8, marginBottom: 16 }}>
        <input name="q" defaultValue={q} placeholder="Αναζήτηση ονόματος…" style={{ padding: 8 }} />
        <select name="active" defaultValue={active} style={{ padding: 8 }}>
          <option value="">Όλοι</option>
          <option value="only">Μόνο ενεργοί</option>
        </select>
        <select name="sort" defaultValue={sort} style={{ padding: 8 }}>
          <option value="name-asc">Όνομα ↑</option>
          <option value="name-desc">Όνομα ↓</option>
        </select>
        <button type="submit" style={{ gridColumn: '1 / -1', padding: 8, cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}>
          Εφαρμογή
        </button>
      </form>

      {loading ? (
        <AdminLoading />
      ) : (
        <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
              <th>Όνομα</th>
              <th>Περιοχή</th>
              <th>Κατηγορία</th>
              <th>Κατάσταση</th>
              <th>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {producers.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }} data-testid={`producer-row-${p.id}`}>
                <td>{p.name || '—'}</td>
                <td>{p.region || '—'}</td>
                <td>{p.category || '—'}</td>
                <td><StatusBadge status={p.approvalStatus} /></td>
                <td>
                  {p.approvalStatus === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={processingIds.has(p.id)}
                        style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: processingIds.has(p.id) ? 0.5 : 1 }}
                        data-testid={`approve-btn-${p.id}`}
                      >
                        {processingIds.has(p.id) ? '...' : 'Έγκριση'}
                      </button>
                      <button
                        onClick={() => handleRejectClick({ id: p.id, name: p.name })}
                        disabled={processingIds.has(p.id)}
                        style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: processingIds.has(p.id) ? 0.5 : 1 }}
                        data-testid={`reject-btn-${p.id}`}
                      >
                        Απόρριψη
                      </button>
                    </div>
                  )}
                  {p.approvalStatus === 'rejected' && p.rejectionReason && (
                    <span style={{ fontSize: 12, color: '#666' }} title={p.rejectionReason}>
                      Λόγος: {p.rejectionReason.slice(0, 20)}...
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {producers.length === 0 && (
              <AdminEmptyState message="Δεν βρέθηκαν αποτελέσματα." colSpan={5} />
            )}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 16 }}>
        <Link href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Επιστροφή στο Admin
        </Link>
      </div>

      {/* PR-CRUD-01: Create Producer Modal */}
      {createOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setCreateOpen(false)}
          data-testid="create-producer-modal"
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 480, width: '100%', margin: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 'bold' }}>Νέος Παραγωγός</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 500 }}>
                Όνομα *
                <input name="name" required minLength={2} style={{ display: 'block', width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, marginTop: 4, boxSizing: 'border-box' }} />
              </label>
              <label style={{ fontSize: 14, fontWeight: 500 }}>
                Περιοχή *
                <input name="region" required minLength={2} style={{ display: 'block', width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, marginTop: 4, boxSizing: 'border-box' }} />
              </label>
              <label style={{ fontSize: 14, fontWeight: 500 }}>
                Κατηγορία *
                <input name="category" required minLength={2} style={{ display: 'block', width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, marginTop: 4, boxSizing: 'border-box' }} />
              </label>
              <label style={{ fontSize: 14, fontWeight: 500 }}>
                Email
                <input name="email" type="email" style={{ display: 'block', width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, marginTop: 4, boxSizing: 'border-box' }} />
              </label>
              <label style={{ fontSize: 14, fontWeight: 500 }}>
                Τηλέφωνο
                <input name="phone" style={{ display: 'block', width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, marginTop: 4, boxSizing: 'border-box' }} />
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                  style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ padding: '10px 16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: creating ? 0.5 : 1 }}
                  data-testid="create-producer-submit"
                >
                  {creating ? 'Δημιουργία...' : 'Δημιουργία'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setRejectModalOpen(false)}
          data-testid="rejection-modal"
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 400, width: '100%', margin: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 'bold' }} data-testid="rejection-modal-title">
              Απόρριψη Παραγωγού
            </h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Παραγωγός: <strong>{producerToReject?.name}</strong>
            </p>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Λόγος Απόρριψης *
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Εξηγήστε γιατί απορρίπτεται ο παραγωγός..."
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }}
              data-testid="rejection-reason-input"
            />
            {rejectionReason.length > 0 && rejectionReason.length < 5 && (
              <p style={{ color: '#dc2626', fontSize: 14, marginTop: 4 }}>Τουλάχιστον 5 χαρακτήρες</p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => { setRejectModalOpen(false); setRejectionReason('') }}
                disabled={submitting}
                style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, backgroundColor: 'white', cursor: 'pointer' }}
                data-testid="rejection-modal-cancel"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={submitting || rejectionReason.length < 5}
                style={{ padding: '10px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: (submitting || rejectionReason.length < 5) ? 0.5 : 1 }}
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
