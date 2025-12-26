/**
 * Safe utility functions for order data handling
 * Prevents crashes from undefined/null values in order fields
 */

/**
 * Safely converts a value to lowercase string
 * Returns empty string if value is not a string
 */
export function safeLower(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

/**
 * Safely converts a value to display text
 * Returns placeholder "—" if value is empty/null/undefined
 */
export function safeText(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '—';
}

/**
 * Safely formats a monetary value
 * Returns placeholder "—" if value is missing/invalid
 */
export function safeMoney(value: unknown): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed.toFixed(2);
    }
  }
  return '—';
}

/**
 * Format date safely with fallback
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}

/**
 * Format date for list view (shorter)
 */
export function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}

/**
 * Format order status with safe handling
 * Returns Greek text and color class for badge
 */
export function formatStatus(status: unknown): { text: string; color: string } {
  const statusLower = safeLower(status);

  switch (statusLower) {
    case 'draft':
      return { text: 'Πρόχειρο', color: 'bg-gray-100 text-gray-800' };
    case 'pending':
      return { text: 'Εκκρεμεί', color: 'bg-yellow-100 text-yellow-800' };
    case 'paid':
      return { text: 'Πληρωμένη', color: 'bg-blue-100 text-blue-800' };
    case 'processing':
      return { text: 'Σε Επεξεργασία', color: 'bg-blue-100 text-blue-800' };
    case 'shipped':
      return { text: 'Απεστάλη', color: 'bg-purple-100 text-purple-800' };
    case 'delivered':
      return { text: 'Παραδόθηκε', color: 'bg-green-100 text-green-800' };
    case 'cancelled':
      return { text: 'Ακυρώθηκε', color: 'bg-red-100 text-red-800' };
    default:
      // Fallback for unknown or missing status
      if (statusLower) {
        return { text: statusLower, color: 'bg-gray-100 text-gray-800' };
      }
      return { text: 'Άγνωστη Κατάσταση', color: 'bg-gray-100 text-gray-800' };
  }
}
