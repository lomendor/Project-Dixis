'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface Producer {
  id: string
  name: string
  businessName: string
  email: string
  phone: string
  description: string
  address: string
  city: string
  region: string
  postalCode: string
  taxId: string
  taxOffice: string
  iban: string | null
  bankAccountHolder: string | null
  beekeeperRegistryNumber: string | null
  cpnpNotificationNumber: string | null
  responsiblePersonName: string | null
}

// Fields the admin can edit, grouped by section
const FIELD_GROUPS = [
  {
    title: 'Στοιχεία Επικοινωνίας',
    fields: [
      { key: 'name', label: 'Όνομα', apiKey: 'name' },
      { key: 'businessName', label: 'Επωνυμία', apiKey: 'business_name' },
      { key: 'email', label: 'Email', apiKey: 'email', type: 'email' },
      { key: 'phone', label: 'Τηλέφωνο', apiKey: 'phone' },
    ],
  },
  {
    title: 'Διεύθυνση',
    fields: [
      { key: 'address', label: 'Οδός', apiKey: 'address' },
      { key: 'city', label: 'Πόλη', apiKey: 'city' },
      { key: 'region', label: 'Περιοχή', apiKey: 'region' },
      { key: 'postalCode', label: 'Τ.Κ.', apiKey: 'postal_code' },
    ],
  },
  {
    title: 'Φορολογικά',
    fields: [
      { key: 'taxId', label: 'ΑΦΜ', apiKey: 'tax_id' },
      { key: 'taxOffice', label: 'ΔΟΥ', apiKey: 'tax_office' },
    ],
  },
  {
    title: 'Τραπεζικά',
    fields: [
      { key: 'iban', label: 'IBAN', apiKey: 'iban' },
      { key: 'bankAccountHolder', label: 'Δικαιούχος', apiKey: 'bank_account_holder' },
    ],
  },
  {
    title: 'Ειδικά Πεδία',
    fields: [
      { key: 'beekeeperRegistryNumber', label: 'Αρ. Μητρώου Μελισσοκόμου', apiKey: 'beekeeper_registry_number' },
      { key: 'cpnpNotificationNumber', label: 'CPNP', apiKey: 'cpnp_notification_number' },
      { key: 'responsiblePersonName', label: 'Υπεύθυνο Πρόσωπο', apiKey: 'responsible_person_name' },
    ],
  },
] as const

type FieldKey = (typeof FIELD_GROUPS)[number]['fields'][number]['key']

export default function ProducerEditForm({
  producer,
  onSaved,
  onCancel,
}: {
  producer: Producer
  onSaved: (updated: Partial<Producer>) => void
  onCancel: () => void
}) {
  const { showSuccess, showError } = useToast()
  const [saving, setSaving] = useState(false)

  // Initialize form state from producer
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const group of FIELD_GROUPS) {
      for (const field of group.fields) {
        init[field.key] = (producer[field.key as FieldKey] as string) || ''
      }
    }
    init.description = producer.description || ''
    return init
  })

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Build payload with only changed fields (snake_case for Laravel)
      const payload: Record<string, string | null> = {}
      let hasChanges = false

      for (const group of FIELD_GROUPS) {
        for (const field of group.fields) {
          const oldVal = (producer[field.key as FieldKey] as string) || ''
          const newVal = form[field.key] || ''
          if (oldVal !== newVal) {
            payload[field.apiKey] = newVal || null
            hasChanges = true
          }
        }
      }

      // Description (separate, uses textarea)
      if ((producer.description || '') !== (form.description || '')) {
        payload.description = form.description || null
        hasChanges = true
      }

      if (!hasChanges) {
        showSuccess('Δεν υπάρχουν αλλαγές')
        onCancel()
        return
      }

      const res = await fetch(`/api/admin/producers/${producer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || 'Αποτυχία αποθήκευσης')
      }

      // Map back to camelCase for local state update
      const updated: Partial<Producer> = {}
      for (const group of FIELD_GROUPS) {
        for (const field of group.fields) {
          if (field.apiKey in payload) {
            (updated as any)[field.key] = form[field.key] || ''
          }
        }
      }
      if ('description' in payload) updated.description = form.description || ''

      showSuccess('Τα στοιχεία ενημερώθηκαν')
      onSaved(updated)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Σφάλμα αποθήκευσης')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4" data-testid={`producer-edit-${producer.id}`}>
      {FIELD_GROUPS.map(group => (
        <div key={group.title}>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {group.title}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs text-gray-500 mb-0.5">{field.label}</label>
                <input
                  type={('type' in field && field.type) || 'text'}
                  value={form[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid={`edit-${field.key}-${producer.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Description - textarea */}
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">Περιγραφή</label>
        <textarea
          value={form.description || ''}
          onChange={e => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          data-testid={`edit-description-${producer.id}`}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Ακύρωση
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          data-testid={`save-producer-${producer.id}`}
        >
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
      </div>
    </div>
  )
}
