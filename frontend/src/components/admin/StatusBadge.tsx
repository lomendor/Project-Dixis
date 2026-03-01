'use client'

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: '#eab308', label: 'Εκκρεμεί' },
  CONFIRMED: { bg: '#2563eb', label: 'Επιβεβαιωμένη' },
  PAID: { bg: '#2563eb', label: 'Πληρωμή' },
  PROCESSING: { bg: '#a16207', label: 'Σε Επεξεργασία' },
  PACKING: { bg: '#a16207', label: 'Συσκευασία' },
  SHIPPED: { bg: '#1d4ed8', label: 'Απεστάλη' },
  DELIVERED: { bg: '#16a34a', label: 'Παραδόθηκε' },
  CANCELLED: { bg: '#dc2626', label: 'Ακυρώθηκε' },
}

export default function StatusBadge({ status }: { status?: string }) {
  const s = String(status || '').toUpperCase()
  const config = STATUS_CONFIG[s]
  const bg = config?.bg || '#6b7280'
  const label = config?.label || s

  return (
    <span style={{ background: bg, color: '#fff', padding: '4px 8px', borderRadius: 999, fontSize: 12 }}>
      {label}
    </span>
  )
}
