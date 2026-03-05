'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface FieldDef { key: string; label: string; required?: boolean; type?: string }

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Όνομα / Επωνυμία', required: true },
  { key: 'business_name', label: 'Επωνυμία επιχείρησης' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Τηλέφωνο', type: 'tel' },
  { key: 'city', label: 'Πόλη' },
  { key: 'region', label: 'Περιοχή' },
  { key: 'address', label: 'Διεύθυνση' },
  { key: 'postal_code', label: 'Τ.Κ.' },
  { key: 'tax_id', label: 'ΑΦΜ' },
  { key: 'tax_office', label: 'ΔΟΥ' },
  { key: 'iban', label: 'IBAN' },
  { key: 'bank_account_holder', label: 'Δικαιούχος λογαριασμού' },
]

interface Props {
  onCreated: () => void
  onCancel: () => void
}

export default function CreateProducerForm({ onCreated, onCancel }: Props) {
  const { showSuccess, showError } = useToast()
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [description, setDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.name?.trim()) {
      showError('Το όνομα είναι υποχρεωτικό')
      return
    }

    setSaving(true)
    try {
      const body: Record<string, string> = {}
      for (const [k, v] of Object.entries(values)) {
        if (v.trim()) body[k] = v.trim()
      }
      if (description.trim()) body.description = description.trim()

      const res = await fetch('/api/admin/producers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Creation failed')
      }

      showSuccess('Ο παραγωγός δημιουργήθηκε')
      onCreated()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Νέος Παραγωγός</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {f.label}{f.required ? ' *' : ''}
            </label>
            <input
              type={f.type || 'text'}
              value={values[f.key] || ''}
              onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={f.required}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Περιγραφή</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          disabled={saving}
        >
          Ακύρωση
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {saving ? 'Αποθήκευση...' : 'Δημιουργία'}
        </button>
      </div>
    </form>
  )
}
