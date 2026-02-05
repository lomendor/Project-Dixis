/**
 * Shared loading spinner for admin pages.
 * Usage: <AdminLoading /> or <AdminLoading text="Αναζήτηση..." />
 */
export default function AdminLoading({ text = 'Φόρτωση...' }: { text?: string }) {
  return (
    <div
      style={{ textAlign: 'center', padding: 32, opacity: 0.6 }}
      data-testid="admin-loading"
    >
      {text}
    </div>
  )
}
