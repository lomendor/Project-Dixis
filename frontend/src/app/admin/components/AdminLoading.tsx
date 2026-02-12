/**
 * Shared loading spinner for admin pages.
 * Usage: <AdminLoading /> or <AdminLoading text="Αναζήτηση..." />
 */
export default function AdminLoading({ text = 'Φόρτωση…' }: { text?: string }) {
  return (
    <div
      className="text-center py-8 text-gray-400"
      data-testid="admin-loading"
    >
      <svg className="w-6 h-6 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm">{text}</p>
    </div>
  )
}
