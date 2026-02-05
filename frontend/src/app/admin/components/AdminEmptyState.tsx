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
      style={{ opacity: 0.7, textAlign: 'center', padding: 16 }}
      data-testid="admin-empty-state"
    >
      {message}
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
