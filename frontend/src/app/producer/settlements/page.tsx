'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiUrl } from '@/lib/api'

/**
 * Pass PAYOUT-04: Producer payout history page.
 * Shows settlement history with status, amounts, and summary.
 */

interface Settlement {
  id: number
  period_start: string
  period_end: string
  total_sales_eur: number
  commission_eur: number
  net_payout_eur: number
  order_count: number
  status: string
  paid_at: string | null
}

interface Summary {
  pending_count: number; pending_total_eur: number
  paid_count: number; paid_total_eur: number
  lifetime_total_eur: number
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('el-GR', { year: 'numeric', month: 'short' })
const fmtEur = (n: number) => `€${n.toFixed(2)}`

export default function ProducerSettlementsPage() {
  return <SettlementsContent />
}

function SettlementsContent() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(apiUrl('producer/settlements'), { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSettlements(d.settlements || [])
          setSummary(d.summary || null)
        } else {
          setError(d.error || 'Σφάλμα')
        }
      })
      .catch(() => setError('Σφάλμα φόρτωσης'))
      .finally(() => setLoading(false))
  }, [])

  const statusLabel = (s: string) => {
    if (s === 'PENDING') return { text: 'Εκκρεμεί', cls: 'bg-amber-100 text-amber-800' }
    if (s === 'PAID') return { text: 'Πληρώθηκε', cls: 'bg-emerald-100 text-emerald-800' }
    return { text: 'Ακυρώθηκε', cls: 'bg-red-100 text-red-800' }
  }

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-200 rounded animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Εκκαθαρίσεις Πωλήσεων</h1>
          <Link href="/producer/settings" className="text-sm text-primary hover:underline">
            Τραπεζικά Στοιχεία →
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500 mb-1">Εκκρεμείς</p>
              <p className="text-xl font-bold text-amber-600">{fmtEur(summary.pending_total_eur)}</p>
              <p className="text-xs text-neutral-400">{summary.pending_count} εκκαθαρίσεις</p>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500 mb-1">Πληρωμένες</p>
              <p className="text-xl font-bold text-emerald-600">{fmtEur(summary.paid_total_eur)}</p>
              <p className="text-xs text-neutral-400">{summary.paid_count} εκκαθαρίσεις</p>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-4 col-span-2 md:col-span-1">
              <p className="text-xs text-neutral-500 mb-1">Σύνολο</p>
              <p className="text-xl font-bold">{fmtEur(summary.lifetime_total_eur)}</p>
              <p className="text-xs text-neutral-400">Από την αρχή</p>
            </div>
          </div>
        )}

        {/* Info box for IBAN */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
          Βεβαιωθείτε ότι έχετε συμπληρώσει το IBAN στις{' '}
          <Link href="/producer/settings" className="font-medium underline">Ρυθμίσεις</Link>{' '}
          για να λαμβάνετε πληρωμές.
        </div>

        {/* Settlements List */}
        {settlements.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <p className="text-neutral-500">Δεν υπάρχουν εκκαθαρίσεις ακόμα.</p>
            <p className="text-sm text-neutral-400 mt-1">
              Οι εκκαθαρίσεις δημιουργούνται αυτόματα κάθε μήνα μετά από 14 ημέρες από την παράδοση.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-xs text-neutral-500 uppercase border-b">
                  <th className="py-3 px-4 text-left">Περίοδος</th>
                  <th className="py-3 px-4 text-right">Πωλήσεις</th>
                  <th className="py-3 px-4 text-right">Προμήθεια</th>
                  <th className="py-3 px-4 text-right">Πληρωτέο</th>
                  <th className="py-3 px-4 text-center">Παραγγ.</th>
                  <th className="py-3 px-4 text-left">Κατάσταση</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(s => {
                  const st = statusLabel(s.status)
                  return (
                    <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">{fmtDate(s.period_start)} – {fmtDate(s.period_end)}</td>
                      <td className="py-3 px-4 text-right font-mono">{fmtEur(s.total_sales_eur)}</td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-400">{fmtEur(s.commission_eur)}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">{fmtEur(s.net_payout_eur)}</td>
                      <td className="py-3 px-4 text-center">{s.order_count}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.cls}`}>{st.text}</span>
                        {s.paid_at && (
                          <span className="block text-xs text-neutral-400 mt-0.5">
                            {new Date(s.paid_at).toLocaleDateString('el-GR')}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
