'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'

interface Rule { id: number; scope_channel: string; percent: string; fixed_fee_cents: number | null; tier_min_amount_cents: number; tier_max_amount_cents: number | null; vat_mode: string; rounding_mode: string; effective_from: string; effective_to: string | null; priority: number; active: boolean; scope_producer_id: number | null; scope_category_id: number | null }

const EMPTY: Record<string, string> = { scope_channel: 'B2C', percent: '10', fixed_fee_cents: '', tier_min_amount_cents: '0', tier_max_amount_cents: '', vat_mode: 'INCLUDE', rounding_mode: 'NEAREST', effective_from: new Date().toISOString().slice(0, 10), effective_to: '', priority: '10', scope_producer_id: '', scope_category_id: '' }
const API = '/api/admin/commission-rules'
const BE = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1') + '/admin/commission-rules'
const cls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } })
  const d = await res.json(); if (!res.ok) throw new Error(d?.message || d?.error || 'Σφάλμα'); return d
}

export default function AdminCommissionsPage() {
  const { showSuccess, showError } = useToast()
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [f, setF] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [pa, setPa] = useState(''); const [pc, setPc] = useState('B2C')
  const [pr, setPr] = useState<Record<string, unknown> | null>(null); const [pv, setPv] = useState(false)

  useEffect(() => { load() }, [])
  async function load() { setLoading(true); try { setRules((await api(API)).rules || []) } catch {} finally { setLoading(false) } }
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }))
  const fc = (c: number) => (c / 100).toFixed(2)

  function openCreate() { setEditId(null); setF(EMPTY); setModal(true) }
  function openEdit(r: Rule) {
    setEditId(r.id); setModal(true)
    setF({ scope_channel: r.scope_channel, percent: String(r.percent), fixed_fee_cents: r.fixed_fee_cents != null ? String(r.fixed_fee_cents) : '', tier_min_amount_cents: String(r.tier_min_amount_cents), tier_max_amount_cents: r.tier_max_amount_cents != null ? String(r.tier_max_amount_cents) : '', vat_mode: r.vat_mode, rounding_mode: r.rounding_mode, effective_from: r.effective_from?.slice(0, 10) || '', effective_to: r.effective_to?.slice(0, 10) || '', priority: String(r.priority), scope_producer_id: r.scope_producer_id != null ? String(r.scope_producer_id) : '', scope_category_id: r.scope_category_id != null ? String(r.scope_category_id) : '' })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const body = { scope_channel: f.scope_channel, percent: parseFloat(f.percent), fixed_fee_cents: f.fixed_fee_cents ? parseInt(f.fixed_fee_cents) : null, tier_min_amount_cents: parseInt(f.tier_min_amount_cents) || 0, tier_max_amount_cents: f.tier_max_amount_cents ? parseInt(f.tier_max_amount_cents) : null, vat_mode: f.vat_mode, rounding_mode: f.rounding_mode, effective_from: f.effective_from, effective_to: f.effective_to || null, priority: parseInt(f.priority) || 0, scope_producer_id: f.scope_producer_id ? parseInt(f.scope_producer_id) : null, scope_category_id: f.scope_category_id ? parseInt(f.scope_category_id) : null }
      if (editId) { await api(`${BE}/${editId}`, { method: 'PATCH', body: JSON.stringify(body) }); showSuccess('Ο κανόνας ενημερώθηκε') }
      else { await api(API, { method: 'POST', body: JSON.stringify(body) }); showSuccess('Ο κανόνας δημιουργήθηκε') }
      setModal(false); await load()
    } catch (e: unknown) { showError(e instanceof Error ? e.message : 'Σφάλμα') } finally { setSaving(false) }
  }

  async function toggle(id: number) { try { await api(`${BE}/${id}/toggle`, { method: 'POST' }); showSuccess('Κατάσταση άλλαξε'); await load() } catch (e: unknown) { showError(e instanceof Error ? e.message : 'Σφάλμα') } }

  async function preview() {
    if (!pa) return; setPv(true)
    try { setPr((await api(`${BE}/preview?${new URLSearchParams({ amount: pa, channel: pc })}`)).preview) }
    catch (e: unknown) { showError(e instanceof Error ? e.message : 'Σφάλμα') } finally { setPv(false) }
  }

  const Sel = ({ k, opts }: { k: string; opts: string[] }) => <select value={f[k]} onChange={set(k)} className={cls + ' bg-white'}>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>
  const Inp = ({ k, ...p }: { k: string } & React.InputHTMLAttributes<HTMLInputElement>) => <input value={f[k]} onChange={set(k)} className={cls} {...p} />
  const Lbl = ({ t, children }: { t: string; children: React.ReactNode }) => <div><label className="block text-xs font-medium text-gray-700 mb-1">{t}</label>{children}</div>

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Κανόνες Προμηθειών</h1>
        <button onClick={openCreate} className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg cursor-pointer font-medium hover:bg-emerald-600">+ Νέος Κανόνας</button>
      </div>
      {loading ? <div className="text-center py-12 text-gray-500">Φόρτωση...</div> : (
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b-2 border-gray-200 text-left">
              {['Κανάλι','Ποσοστό(%)','Σταθ.Χρέωση','Εύρος','Προτ.','ΦΠΑ','Κατάσταση','Ενέργειες'].map(h => <th key={h} className="px-3 py-3 font-medium text-gray-600">{h}</th>)}
            </tr></thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3">{r.scope_channel}</td>
                  <td className="px-3 py-3">{r.percent}%</td>
                  <td className="px-3 py-3">{r.fixed_fee_cents != null ? fc(r.fixed_fee_cents) : '-'}</td>
                  <td className="px-3 py-3">{fc(r.tier_min_amount_cents)} - {r.tier_max_amount_cents != null ? fc(r.tier_max_amount_cents) : 'max'}</td>
                  <td className="px-3 py-3">{r.priority}</td>
                  <td className="px-3 py-3">{r.vat_mode}</td>
                  <td className="px-3 py-3"><button onClick={() => toggle(r.id)} className={`px-3 py-0.5 rounded-full text-xs font-medium text-white cursor-pointer ${r.active ? 'bg-emerald-500' : 'bg-gray-400'}`}>{r.active ? 'Ενεργό' : 'Ανενεργό'}</button></td>
                  <td className="px-3 py-3"><button onClick={() => openEdit(r)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer">Επεξεργασία</button></td>
                </tr>
              ))}
              {rules.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Δεν υπάρχουν κανόνες.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <section className="mt-8 p-4 bg-white border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Προεπισκόπηση Προμήθειας</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div><label className="block text-xs text-gray-600 mb-1">Ποσό</label><input type="number" step="0.01" min="0" value={pa} onChange={e => setPa(e.target.value)} placeholder="0.00" className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Κανάλι</label><select value={pc} onChange={e => setPc(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option>B2C</option><option>B2B</option><option>ALL</option></select></div>
          <button onClick={preview} disabled={pv || !pa} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer">{pv ? '...' : 'Υπολογισμός'}</button>
        </div>
        {pr && <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
          <p><strong>Προμήθεια:</strong> {typeof pr.commission_cents === 'number' ? fc(pr.commission_cents as number) : '-'}</p>
          <p><strong>Κανόνας ID:</strong> {pr.rule_id != null ? String(pr.rule_id) : 'Κανένας'}</p>
          {pr.breakdown && <p className="text-gray-500 text-xs mt-1">{typeof pr.breakdown === 'string' ? pr.breakdown : JSON.stringify(pr.breakdown)}</p>}
        </div>}
      </section>

      <div className="mt-4"><Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">&larr; Επιστροφή στο Admin</Link></div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Επεξεργασία Κανόνα' : 'Νέος Κανόνας'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Lbl t="Κανάλι *"><Sel k="scope_channel" opts={['B2C','B2B','ALL']} /></Lbl>
              <Lbl t="Ποσοστό (%) *"><Inp k="percent" type="number" step="0.01" min="0" max="100" /></Lbl>
              <Lbl t="Σταθ. Χρέωση (cents)"><Inp k="fixed_fee_cents" type="number" min="0" placeholder="0" /></Lbl>
              <Lbl t="Προτεραιότητα *"><Inp k="priority" type="number" min="0" /></Lbl>
              <Lbl t="Min Ποσό (cents) *"><Inp k="tier_min_amount_cents" type="number" min="0" /></Lbl>
              <Lbl t="Max Ποσό (cents)"><Inp k="tier_max_amount_cents" type="number" min="0" placeholder="Χωρίς όριο" /></Lbl>
              <Lbl t="ΦΠΑ *"><Sel k="vat_mode" opts={['INCLUDE','EXCLUDE','NONE']} /></Lbl>
              <Lbl t="Στρογγυλοποίηση *"><Sel k="rounding_mode" opts={['NEAREST','UP','DOWN']} /></Lbl>
              <Lbl t="Από *"><Inp k="effective_from" type="date" /></Lbl>
              <Lbl t="Έως"><Inp k="effective_to" type="date" /></Lbl>
              <Lbl t="Producer ID"><Inp k="scope_producer_id" type="number" min="0" placeholder="Κενό = Όλοι" /></Lbl>
              <Lbl t="Category ID"><Inp k="scope_category_id" type="number" min="0" placeholder="Κενό = Όλες" /></Lbl>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setModal(false)} disabled={saving} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer">Ακύρωση</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer">{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
