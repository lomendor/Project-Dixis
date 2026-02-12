/**
 * Shared empty state for admin tables/lists.
 * Usage: <AdminEmptyState message="Δεν βρέθηκαν προϊόντα." />
 * or:    <AdminEmptyState message="Δεν βρέθηκαν αποτελέσματα." colSpan={7} />
 */
export default function AdminEmptyState({
  message = 'Δεν βρέθηκαν αποτελέσματα.',
  colSpan,
}: {
  message?: string
  colSpan?: number
}) {
  const content = (
    <div
      className="text-center py-8 text-gray-500"
      data-testid="admin-empty-state"
    >
      <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )

  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan}>{content}</td>
      </tr>
    )
  }

  return content
}
