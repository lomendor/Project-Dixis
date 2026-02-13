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
 * Payment method code to Greek label mapping
 */
const PAYMENT_METHOD_LABELS: Record<string, { text: string; icon: string }> = {
  COD: { text: 'Αντικαταβολή', icon: '💵' },
  CARD: { text: 'Κάρτα', icon: '💳' },
  BANK_TRANSFER: { text: 'Τραπεζική Μεταφορά', icon: '🏦' },
  STRIPE: { text: 'Κάρτα', icon: '💳' },
};

/**
 * Format payment method with safe handling
 * Maps API codes (COD, CARD, BANK_TRANSFER) to Greek labels
 */
export function formatPaymentMethod(method: unknown): string {
  if (typeof method === 'string' && method.trim()) {
    const key = method.trim().toUpperCase();
    const mapping = PAYMENT_METHOD_LABELS[key];
    if (mapping) {
      return `${mapping.icon} ${mapping.text}`;
    }
    // Fallback: return the original value with capitalization
    return method;
  }
  return '—';
}

/**
 * Shipping method code to Greek label mapping
 */
const SHIPPING_METHOD_LABELS: Record<string, string> = {
  HOME: 'Παράδοση στο σπίτι',
  PICKUP: 'Παραλαβή από κατάστημα',
  COURIER: 'Μεταφορική εταιρεία',
};

/**
 * Format shipping method with safe handling
 * Prefers API-provided label, falls back to local mapping
 */
export function formatShippingMethod(method: unknown, apiLabel?: string): string {
  // Prefer API-provided label if available
  if (apiLabel && typeof apiLabel === 'string' && apiLabel.trim()) {
    return apiLabel;
  }
  // Fallback to local mapping
  if (typeof method === 'string' && method.trim()) {
    return SHIPPING_METHOD_LABELS[method.toUpperCase()] || method;
  }
  return '—';
}

/**
 * Shipping address type (can be object or legacy string)
 */
export interface ShippingAddressObj {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postal_code?: string;
  region?: string;
  country?: string;
}

/**
 * Format shipping address for display
 * Handles both structured object and legacy string formats
 * Returns null if address is empty/invalid (hide section)
 */
export function formatShippingAddress(address: unknown): string | null {
  // Handle null/undefined
  if (!address) {
    return null;
  }

  // Handle legacy string format
  if (typeof address === 'string') {
    return address.trim() || null;
  }

  // Handle structured object
  if (typeof address === 'object') {
    const addr = address as ShippingAddressObj;
    const parts: string[] = [];

    // Build address string from parts
    if (addr.name) parts.push(addr.name);
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);

    // City + postal code on same line
    const cityLine = [addr.city, addr.postal_code].filter(Boolean).join(' ');
    if (cityLine) parts.push(cityLine);

    if (addr.region) parts.push(addr.region);
    if (addr.phone) parts.push(`Τηλ: ${addr.phone}`);

    return parts.length > 0 ? parts.join('\n') : null;
  }

  return null;
}

/**
 * Check if shipping address has displayable content
 */
export function hasShippingAddress(address: unknown): boolean {
  return formatShippingAddress(address) !== null;
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
