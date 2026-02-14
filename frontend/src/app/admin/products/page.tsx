'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import AdminLoading from '@/app/admin/components/AdminLoading'
import AdminEmptyState from '@/app/admin/components/AdminEmptyState'
import { CATEGORIES } from '@/data/categories'

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
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending:  { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Σε αναμονή' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Εγκεκριμένο' },
    rejected: { bg: 'bg-red-100',   text: 'text-red-800',   label: 'Απορρίφθηκε' },
  }
  const c = config[status] || config.pending
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      data-testid={`product-status-${status}`}
    >
      {c.label}
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

  const isDisabled = disabled || toggling

  return (
    <button
      onClick={handleToggle}
      disabled={isDisabled}
      className={`px-3 py-0.5 rounded-full text-xs font-medium text-white transition-colors ${
        isActive ? 'bg-emerald-500' : 'bg-gray-500'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
      <div className="flex gap-1 items-center">
        <input
          type="number"
          step={type === 'price' ? '0.01' : '1'}
          min="0"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={saving}
          className="w-20 p-1 border border-gray-300 rounded text-sm"
          data-testid={`edit-${type}-input`}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-2 py-0.5 bg-emerald-500 text-white rounded text-xs cursor-pointer"
          data-testid={`edit-${type}-save`}
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-2 py-0.5 bg-gray-500 text-white rounded text-xs cursor-pointer"
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
      className={`${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
      // Products load failed — handled by empty state UI
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

  return (
    <>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => { setCreateOpen(true); loadProducers() }}
          className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg cursor-pointer font-medium hover:bg-emerald-600 transition-colors"
          data-testid="create-product-btn"
        >
          + Νέο Προϊόν
        </button>
      </div>
      <form onSubmit={handleFilterSubmit} className="grid grid-cols-[1fr_160px] gap-2 mb-4">
        <input name="q" defaultValue={q} placeholder="Αναζήτηση τίτλου..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <select name="approval" defaultValue={approval} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">Όλα</option>
          <option value="pending">Σε αναμονή</option>
          <option value="approved">Εγκεκριμένα</option>
          <option value="rejected">Απορριφθέντα</option>
        </select>
        <button type="submit" className="col-span-full py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium">
          Εφαρμογή
        </button>
      </form>

      {loading ? (
        <AdminLoading />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Τίτλος</th>
                <th className="px-4 py-3 font-medium text-gray-600">Παραγωγός</th>
                <th className="px-4 py-3 font-medium text-gray-600">Τιμή</th>
                <th className="px-4 py-3 font-medium text-gray-600">Απόθεμα</th>
                <th className="px-4 py-3 font-medium text-gray-600">Ενεργό</th>
                <th className="px-4 py-3 font-medium text-gray-600">Έγκριση</th>
                <th className="px-4 py-3 font-medium text-gray-600">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" data-testid={`product-row-${p.id}`}>
                  <td className="px-4 py-3"><Link href={`/products/${p.id}`} className="text-blue-600 hover:text-blue-800">{p.title}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{p.producer?.name || 'Άγνωστος'}</td>
                  <td className="px-4 py-3">
                    <InlineEditField
                      value={Number(p.price || 0)}
                      onSave={(newPrice) => handleUpdatePrice(p.id, newPrice)}
                      type="price"
                      disabled={processingIds.has(p.id)}
                    />
                    {' / '}{p.unit}
                  </td>
                  <td className="px-4 py-3">
                    <InlineEditField
                      value={Number(p.stock || 0)}
                      onSave={(newStock) => handleUpdateStock(p.id, newStock)}
                      type="stock"
                      disabled={processingIds.has(p.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <InlineToggle
                      productId={p.id}
                      isActive={p.isActive}
                      onToggle={handleToggleActive}
                      disabled={processingIds.has(p.id)}
                    />
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.approvalStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {p.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={processingIds.has(p.id)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            data-testid={`approve-btn-${p.id}`}
                          >
                            {processingIds.has(p.id) ? '...' : 'Έγκριση'}
                          </button>
                          <button
                            onClick={() => handleRejectClick({ id: p.id, title: p.title })}
                            disabled={processingIds.has(p.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            data-testid={`reject-btn-${p.id}`}
                          >
                            Απόρριψη
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEditClick(p)}
                        disabled={processingIds.has(p.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        data-testid={`edit-btn-${p.id}`}
                      >
                        Επεξεργασία
                      </button>
                      {p.approvalStatus === 'rejected' && p.rejectionReason && (
                        <span className="text-xs text-gray-500 self-center" title={p.rejectionReason}>
                          Λόγος: {p.rejectionReason.slice(0, 20)}...
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <AdminEmptyState message="Δεν βρέθηκαν προϊόντα." colSpan={7} />
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
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
            <h3 className="text-lg font-bold text-gray-900 mb-4" data-testid="rejection-modal-title">
              Απόρριψη Προϊόντος
            </h3>
            <p className="text-gray-600 mb-4">
              Προϊόν: <strong>{productToReject?.title}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Λόγος Απόρριψης *
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Εξηγήστε γιατί απορρίπτεται το προϊόν..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y"
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
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setCreateOpen(false)}
          data-testid="create-product-modal"
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Νέο Προϊόν</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Παραγωγός *</label>
                <select name="producerId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" data-testid="create-producer-select">
                  <option value="">Επιλέξτε παραγωγό...</option>
                  {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Τίτλος *</label>
                <input name="title" required minLength={3} placeholder="Τίτλος προϊόντος..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" data-testid="create-title-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Κατηγορία *</label>
                  <select name="category" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" data-testid="create-category-input">
                    <option value="">Επιλέξτε κατηγορία...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.labelEl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Μονάδα *</label>
                  <input name="unit" required placeholder="π.χ. κιλό" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" data-testid="create-unit-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Τιμή (€) *</label>
                  <input name="price" type="number" step="0.01" min="0" required placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" data-testid="create-price-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Απόθεμα</label>
                  <input name="stock" type="number" min="0" defaultValue="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" data-testid="create-stock-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Περιγραφή</label>
                <textarea name="description" rows={3} placeholder="Περιγραφή προϊόντος..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y" data-testid="create-description-input" />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setCreateOpen(false)} disabled={creating} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors" data-testid="create-modal-cancel">
                  Ακύρωση
                </button>
                <button type="submit" disabled={creating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50" data-testid="create-modal-confirm">
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setEditModalOpen(false)}
          data-testid="edit-modal"
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4" data-testid="edit-modal-title">
              Επεξεργασία Προϊόντος
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              ID: {productToEdit?.id}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Τίτλος *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Τίτλος προϊόντος..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  data-testid="edit-title-input"
                />
                {editForm.title.length > 0 && editForm.title.length < 3 && (
                  <p className="text-red-600 text-xs mt-1">Τουλάχιστον 3 χαρακτήρες</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Περιγραφή
                </label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Περιγραφή προϊόντος..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y"
                  data-testid="edit-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Κατηγορία *
                </label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  data-testid="edit-category-input"
                >
                  <option value="">Επιλέξτε κατηγορία...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.labelEl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Μονάδα Μέτρησης *
                </label>
                <input
                  type="text"
                  value={editForm.unit}
                  onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="π.χ. κιλό, τεμάχιο..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  data-testid="edit-unit-input"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={() => { setEditModalOpen(false); setProductToEdit(null) }}
                disabled={editSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                data-testid="edit-modal-cancel"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleEditConfirm}
                disabled={editSubmitting || editForm.title.trim().length < 3 || !editForm.category.trim() || !editForm.unit.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
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
    <main className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Προϊόντα</h1>
      <Suspense fallback={<AdminLoading />}>
        <AdminProductsContent />
      </Suspense>
    </main>
  )
}
