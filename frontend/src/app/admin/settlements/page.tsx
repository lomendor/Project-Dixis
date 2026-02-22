'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'

/**
 * Pass PAYOUT-03: Admin settlement dashboard.
 * Lists pending/paid settlements per producer with mark-as-paid action.
 */

interface Settlement {
  id: number
  producer_id: number
  period_start: string
  period_end: string
  total_sales_cents: number
  commission_cents: number
  net_payout_cents: number
  order_count: number
  status: string
  paid_at: string | null
  notes: string | null
  producer?: { id: number; name: string; iban?: string; bank_account_holder?: string }
}

interface Summary {
  pending_count: number; pending_total_eur: number
  paid_count: number; paid_total_eur: number
}

const API = '/api/admin/settlements'
const eur = (cents: number) => (cents / 100).toFixed(2)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('el-GR', { year: 'numeric', month: 'short', day: 'numeric' })

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } })
  const d = await res.json()
  if (!res.ok) throw new Error(d?.error || d?.message || 'Error')
  return d
}

export default function AdminSettlementsPage() {
  const { showSuccess, showError } = useToast()
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('PENDING')
  const [payModal, setPayModal] = useState<Settlement | null>(null)
  const [payNotes, setPayNotes] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { load(); loadSummary() }, [filter])

  async function loadSummary() {
    try { const d = await api(`${API}/summary`); setSummary(d.summary) } catch {}
  }

  async function load() {
    setLoading(true)
    try {
      const params = filter ? `?status=${filter}` : ''
      const d = await api(`${API}${params}`)
      setSettlements(d.settlements || [])
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Αποτυχία φόρτωσης εκκαθαρίσεων')
    } finally { setLoading(false) }
  }

  async function handleMarkPaid() {
    if (!payModal) return
    setBusy(true)
    try {
      await api(`${API}/${payModal.id}/pay`, {
        method: 'POST', body: JSON.stringify({ notes: payNotes || null })
      })
      showSuccess(`Εκκαθάριση #${payModal.id} σημειώθηκε ως πληρωμένη`)
      setPayModal(null); setPayNotes(''); load(); loadSummary()
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Σφάλμα')
    } finally { setBusy(false) }
  }

  const statusBadge = (s: string) => {
    const cls = s === 'PENDING' ? 'bg-amber-100 text-amber-800'
      : s === 'PAID' ? 'bg-emerald-100 text-emerald-800'
      : 'bg-red-100 text-red-800'
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{s}</span>
  }

  return (
    <div className="space-y-6" data-testid="admin-settlements-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Εκκαθαρίσεις</h1>
        <a href="/admin/commissions" className="text-sm text-primary hover:underline">Κανόνες Προμηθειών →</a>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Εκκρεμείς" value={summary.pending_count} sub={`€${summary.pending_total_eur.toFixed(2)}`} color="amber" />
          <SummaryCard label="Πληρωμένες" value={summary.paid_count} sub={`€${summary.paid_total_eur.toFixed(2)}`} color="emerald" />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        {['PENDING', 'PAID', 'CANCELLED', ''].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-t text-sm font-medium ${filter === s ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            {s || 'Όλες'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-neutral-200 rounded" />)}
        </div>
      ) : settlements.length === 0 ? (
        <p className="text-neutral-500 text-center py-8">Δεν βρέθηκαν εκκαθαρίσεις</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 uppercase">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Παραγωγός</th>
                <th className="py-2 px-3">Περίοδος</th>
                <th className="py-2 px-3 text-right">Πωλήσεις</th>
                <th className="py-2 px-3 text-right">Προμήθεια</th>
                <th className="py-2 px-3 text-right">Πληρωτέο</th>
                <th className="py-2 px-3 text-center">Παραγγ.</th>
                <th className="py-2 px-3">Κατάσταση</th>
                <th className="py-2 px-3">IBAN</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {settlements.map(s => (
                <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-2 px-3 font-mono text-xs">{s.id}</td>
                  <td className="py-2 px-3 font-medium">{s.producer?.name || `#${s.producer_id}`}</td>
                  <td className="py-2 px-3 text-xs">{fmtDate(s.period_start)} – {fmtDate(s.period_end)}</td>
                  <td className="py-2 px-3 text-right font-mono">€{eur(s.total_sales_cents)}</td>
                  <td className="py-2 px-3 text-right font-mono text-neutral-500">€{eur(s.commission_cents)}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">€{eur(s.net_payout_cents)}</td>
                  <td className="py-2 px-3 text-center">{s.order_count}</td>
                  <td className="py-2 px-3">{statusBadge(s.status)}</td>
                  <td className="py-2 px-3 font-mono text-xs truncate max-w-[120px]" title={s.producer?.iban || ''}>
                    {s.producer?.iban || <span className="text-red-400">—</span>}
                  </td>
                  <td className="py-2 px-3">
                    {s.status === 'PENDING' && (
                      <button onClick={() => { setPayModal(s); setPayNotes('') }}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                        Πληρωμή
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Επιβεβαίωση Πληρωμής</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Παραγωγός:</strong> {payModal.producer?.name}</p>
              <p><strong>Ποσό:</strong> €{eur(payModal.net_payout_cents)}</p>
              <p><strong>IBAN:</strong> <span className="font-mono">{payModal.producer?.iban || 'Δεν έχει οριστεί!'}</span></p>
              <p><strong>Δικαιούχος:</strong> {payModal.producer?.bank_account_holder || '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Σημειώσεις (π.χ. αρ. τραπ. εντολής)</label>
              <input type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                placeholder="REF-2026-001" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleMarkPaid} disabled={busy}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
                {busy ? 'Αποθήκευση...' : 'Σημείωσε ως Πληρωμένη'}
              </button>
              <button onClick={() => setPayModal(null)} disabled={busy}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-sm">
                Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  const bg = color === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
  return (
    <div className={`p-4 rounded-lg border ${bg}`}>
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-neutral-600">{sub}</p>
    </div>
  )
}
