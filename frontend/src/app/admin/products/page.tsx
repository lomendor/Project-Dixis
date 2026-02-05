'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

interface Product {
  id: string
  title: string
  description: string | null
  category: string
  price: number
  unit: string
  stock: number
  isActive: boolean
  approvalStatus: string
  rejectionReason: string | null
  producer?: {
    id: string
    name: string
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'background-color: #fef3c7; color: #92400e;',
    approved: 'background-color: #d1fae5; color: #065f46;',
    rejected: 'background-color: #fee2e2; color: #991b1b;'
  }
  const labels: Record<string, string> = {
    pending: 'Σε αναμονή',
    approved: 'Εγκεκριμένο',
    rejected: 'Απορρίφθηκε'
  }
  const parseStyle = (s: string): React.CSSProperties => {
    const obj: Record<string, string> = {}
    s.split(';').forEach(p => {
      const [k, v] = p.split(':').map(x => x.trim())
      if (k && v) obj[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v
    })
    return obj
  }
  return (
    <span
      style={{ padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, ...parseStyle(styles[status] || '') }}
      data-testid={`product-status-${status}`}
    >
      {labels[status] || status}
    </span>
  )
}

function InlineToggle({ productId, isActive, onToggle, disabled }: { productId: string; isActive: boolean; onToggle: (id: string, value: boolean) => Promise<void>; disabled: boolean }) {
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    try {
      await onToggle(productId, !isActive)
    } finally {
      setToggling(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || toggling}
      style={{
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
        border: 'none',
        cursor: disabled || toggling ? 'not-allowed' : 'pointer',
        opacity: disabled || toggling ? 0.5 : 1,
        backgroundColor: isActive ? '#10b981' : '#6b7280',
        color: 'white'
      }}
      data-testid={`toggle-active-${productId}`}
    >
      {toggling ? '...' : isActive ? 'Ενεργό' : 'Ανενεργό'}
    </button>
  )
}

function InlineEditField({ value, onSave, type, disabled }: { value: number; onSave: (newValue: number) => Promise<void>; type: 'price' | 'stock'; disabled: boolean }) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(String(value))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const parsed = type === 'price' ? parseFloat(inputValue) : parseInt(inputValue)
    if (isNaN(parsed) || parsed < 0) return

    setSaving(true)
    try {
      await onSave(parsed)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setInputValue(String(value))
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input
          type="number"
          step={type === 'price' ? '0.01' : '1'}
          min="0"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={saving}
          style={{ width: 80, padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
          data-testid={`edit-${type}-input`}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '2px 8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
          data-testid={`edit-${type}-save`}
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          style={{ padding: '2px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
          data-testid={`edit-${type}-cancel`}
        >
          ✗
        </button>
      </div>
    )
  }

  return (
    <span
      onClick={() => !disabled && setEditing(true)}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      title={disabled ? '' : 'Κλικ για επεξεργασία'}
      data-testid={`edit-${type}-display`}
    >
      {type === 'price' ? new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(value) : value}
    </span>
  )
}

function AdminProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSuccess, showError } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [productToReject, setProductToReject] = useState<{ id: string; title: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', unit: '' })
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [producers, setProducers] = useState<{ id: string; name: string }[]>([])

  const q = searchParams.get('q') || ''
  const approval = searchParams.get('approval') || ''

  useEffect(() => {
    loadProducts()
  }, [q, approval])

  async function loadProducts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (approval) params.set('approval', approval)

      const res = await fetch(`/api/admin/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setProducts(data?.items || data || [])
    } catch {
      console.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function loadProducers() {
    try {
      const res = await fetch('/api/admin/producers?active=only')
      if (!res.ok) return
      const data = await res.json()
      setProducers((data?.items || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
    } catch { /* ignore */ }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)
    try {
      const fd = new FormData(e.currentTarget)
      const body = {
        title: fd.get('title') as string,
        category: fd.get('category') as string,
        price: parseFloat(fd.get('price') as string) || 0,
        unit: fd.get('unit') as string,
        stock: parseInt(fd.get('stock') as string) || 0,
        description: fd.get('description') as string || undefined,
        producerId: fd.get('producerId') as string,
      }
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Αποτυχία' }))
        throw new Error(err.error || 'Αποτυχία δημιουργίας')
      }
      showSuccess('Το προϊόν δημιουργήθηκε επιτυχώς')
      setCreateOpen(false)
      await loadProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Αποτυχία δημιουργίας προϊόντος'
      showError(message)
    } finally {
      setCreating(false)
    }
  }

  async function handleApprove(productId: string) {
    setProcessingIds(prev => new Set([...prev, productId]))
    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Το προϊόν εγκρίθηκε επιτυχώς')
      await loadProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Αποτυχία έγκρισης προϊόντος'
      showError(message)
    } finally {
      setProcessingIds(prev => { const s = new Set(prev); s.delete(productId); return s })
    }
  }

  function handleRejectClick(product: { id: string; title: string }) {
    setProductToReject(product)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  async function handleRejectConfirm() {
    if (!productToReject || rejectionReason.length < 5) return
    setSubmitting(true)
    setProcessingIds(prev => new Set([...prev, productToReject.id]))
    try {
      const res = await fetch(`/api/admin/products/${productToReject.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Το προϊόν απορρίφθηκε')
      setRejectModalOpen(false)
      setProductToReject(null)
      await loadProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Αποτυχία απόρριψης προϊόντος'
      showError(message)
    } finally {
      setSubmitting(false)
      if (productToReject) {
        setProcessingIds(prev => { const s = new Set(prev); s.delete(productToReject.id); return s })
      }
    }
  }

  function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const newQ = fd.get('q') as string
    const newApproval = fd.get('approval') as string
    if (newQ) params.set('q', newQ)
    if (newApproval) params.set('approval', newApproval)
    router.push(`/admin/products?${params.toString()}`)
  }

  async function handleToggleActive(productId: string, newIsActive: boolean) {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Η κατάσταση ενημερώθηκε επιτυχώς')
      await loadProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης κατάστασης'
      showError(message)
    }
  }

  async function handleUpdatePrice(productId: string, newPrice: number) {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Η τιμή ενημερώθηκε επιτυχώς')
      await loadProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης τιμής'
      showError(message)
    }
  }

  async function handleUpdateStock(productId: string, newStock: number) {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Το απόθεμα ενημερώθηκε επιτυχώς')
      await loadProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης αποθέματος'
      showError(message)
    }
  }

  function handleEditClick(product: Product) {
    setProductToEdit(product)
    setEditForm({
      title: product.title,
      description: product.description || '',
      category: product.category,
      unit: product.unit
    })
    setEditModalOpen(true)
  }

  async function handleEditConfirm() {
    if (!productToEdit || editForm.title.trim().length < 3) return
    setEditSubmitting(true)
    setProcessingIds(prev => new Set([...prev, productToEdit.id]))
    try {
      const res = await fetch(`/api/admin/products/${productToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία')
      showSuccess('Το προϊόν ενημερώθηκε επιτυχώς')
      setEditModalOpen(false)
      setProductToEdit(null)
      await loadProducts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης προϊόντος'
      showError(message)
    } finally {
      setEditSubmitting(false)
      if (productToEdit) {
        setProcessingIds(prev => { const s = new Set(prev); s.delete(productToEdit.id); return s })
      }
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => { setCreateOpen(true); loadProducers() }}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
          data-testid="create-product-btn"
        >
          + Νέο Προϊόν
        </button>
      </div>
      <form onSubmit={handleFilterSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 8, marginBottom: 16 }}>
        <input name="q" defaultValue={q} placeholder="Αναζήτηση τίτλου…" style={{ padding: 8 }} />
        <select name="approval" defaultValue={approval} style={{ padding: 8 }}>
          <option value="">Όλα</option>
          <option value="pending">Σε αναμονή</option>
          <option value="approved">Εγκεκριμένα</option>
          <option value="rejected">Απορριφθέντα</option>
        </select>
        <button type="submit" style={{ gridColumn: '1 / -1', padding: 8, cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}>
          Εφαρμογή
        </button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, opacity: 0.6 }}>Φόρτωση...</div>
      ) : (
        <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
              <th>Τίτλος</th>
              <th>Παραγωγός</th>
              <th>Τιμή</th>
              <th>Απόθεμα</th>
              <th>Ενεργό</th>
              <th>Έγκριση</th>
              <th>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }} data-testid={`product-row-${p.id}`}>
                <td><Link href={`/products/${p.id}`}>{p.title}</Link></td>
                <td>{p.producer?.name || 'Άγνωστος'}</td>
                <td>
                  <InlineEditField
                    value={Number(p.price || 0)}
                    onSave={(newPrice) => handleUpdatePrice(p.id, newPrice)}
                    type="price"
                    disabled={processingIds.has(p.id)}
                  />
                  {' / '}{p.unit}
                </td>
                <td>
                  <InlineEditField
                    value={Number(p.stock || 0)}
                    onSave={(newStock) => handleUpdateStock(p.id, newStock)}
                    type="stock"
                    disabled={processingIds.has(p.id)}
                  />
                </td>
                <td>
                  <InlineToggle
                    productId={p.id}
                    isActive={p.isActive}
                    onToggle={handleToggleActive}
                    disabled={processingIds.has(p.id)}
                  />
                </td>
                <td><StatusBadge status={p.approvalStatus} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {p.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={processingIds.has(p.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: processingIds.has(p.id) ? 0.5 : 1 }}
                          data-testid={`approve-btn-${p.id}`}
                        >
                          {processingIds.has(p.id) ? '...' : 'Έγκριση'}
                        </button>
                        <button
                          onClick={() => handleRejectClick({ id: p.id, title: p.title })}
                          disabled={processingIds.has(p.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: processingIds.has(p.id) ? 0.5 : 1 }}
                          data-testid={`reject-btn-${p.id}`}
                        >
                          Απόρριψη
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEditClick(p)}
                      disabled={processingIds.has(p.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: processingIds.has(p.id) ? 0.5 : 1 }}
                      data-testid={`edit-btn-${p.id}`}
                    >
                      Επεξεργασία
                    </button>
                    {p.approvalStatus === 'rejected' && p.rejectionReason && (
                      <span style={{ fontSize: 12, color: '#666', alignSelf: 'center' }} title={p.rejectionReason}>
                        Λόγος: {p.rejectionReason.slice(0, 20)}...
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} style={{ opacity: 0.7, textAlign: 'center', padding: 16 }}>
                  Δεν βρέθηκαν προϊόντα.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 16 }}>
        <Link href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Επιστροφή στο Admin
        </Link>
      </div>

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
              Απόρριψη Προϊόντος
            </h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Προϊόν: <strong>{productToReject?.title}</strong>
            </p>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Λόγος Απόρριψης *
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Εξηγήστε γιατί απορρίπτεται το προϊόν..."
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

      {/* Create Product Modal */}
      {createOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setCreateOpen(false)}
          data-testid="create-product-modal"
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 500, width: '100%', margin: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 'bold' }}>Νέο Προϊόν</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Παραγωγός *</label>
                <select name="producerId" required style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} data-testid="create-producer-select">
                  <option value="">Επιλέξτε παραγωγό...</option>
                  {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Τίτλος *</label>
                <input name="title" required minLength={3} placeholder="Τίτλος προϊόντος..." style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} data-testid="create-title-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Κατηγορία *</label>
                  <input name="category" required placeholder="π.χ. Λάδι" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} data-testid="create-category-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Μονάδα *</label>
                  <input name="unit" required placeholder="π.χ. κιλό" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} data-testid="create-unit-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Τιμή (€) *</label>
                  <input name="price" type="number" step="0.01" min="0" required placeholder="0.00" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} data-testid="create-price-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Απόθεμα</label>
                  <input name="stock" type="number" min="0" defaultValue="0" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} data-testid="create-stock-input" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Περιγραφή</label>
                <textarea name="description" rows={3} placeholder="Περιγραφή προϊόντος..." style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} data-testid="create-description-input" />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setCreateOpen(false)} disabled={creating} style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, backgroundColor: 'white', cursor: 'pointer' }} data-testid="create-modal-cancel">
                  Ακύρωση
                </button>
                <button type="submit" disabled={creating} style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: creating ? 0.5 : 1 }} data-testid="create-modal-confirm">
                  {creating ? 'Δημιουργία...' : 'Δημιουργία'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setEditModalOpen(false)}
          data-testid="edit-modal"
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 500, width: '100%', margin: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 'bold' }} data-testid="edit-modal-title">
              Επεξεργασία Προϊόντος
            </h3>
            <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>
              ID: {productToEdit?.id}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Τίτλος *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Τίτλος προϊόντος..."
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }}
                  data-testid="edit-title-input"
                />
                {editForm.title.length > 0 && editForm.title.length < 3 && (
                  <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>Τουλάχιστον 3 χαρακτήρες</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Περιγραφή
                </label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Περιγραφή προϊόντος..."
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }}
                  data-testid="edit-description-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Κατηγορία *
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Κατηγορία προϊόντος..."
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }}
                  data-testid="edit-category-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Μονάδα Μέτρησης *
                </label>
                <input
                  type="text"
                  value={editForm.unit}
                  onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="π.χ. κιλό, τεμάχιο..."
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }}
                  data-testid="edit-unit-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => { setEditModalOpen(false); setProductToEdit(null) }}
                disabled={editSubmitting}
                style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, backgroundColor: 'white', cursor: 'pointer' }}
                data-testid="edit-modal-cancel"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleEditConfirm}
                disabled={editSubmitting || editForm.title.trim().length < 3 || !editForm.category.trim() || !editForm.unit.trim()}
                style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: (editSubmitting || editForm.title.trim().length < 3 || !editForm.category.trim() || !editForm.unit.trim()) ? 0.5 : 1 }}
                data-testid="edit-modal-confirm"
              >
                {editSubmitting ? 'Αποθήκευση...' : 'Αποθήκευση'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function AdminProductsPage() {
  return (
    <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Προϊόντα</h1>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 32, opacity: 0.6 }}>Φόρτωση...</div>}>
        <AdminProductsContent />
      </Suspense>
    </main>
  )
}
