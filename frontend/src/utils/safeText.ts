/**
 * Safe Text Utilities (Minimal)
 * Essential text safety functions only
 */

/**
 * Safely handle null/undefined text values
 */
export function safeText(text: unknown, fallback: string = ''): string {
  if (text === null || text === undefined) return fallback;
  if (typeof text === 'string') return text.trim();
  if (typeof text === 'number' || typeof text === 'boolean') return String(text);
  return fallback;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | null | undefined, length: number): string {
  const safeInput = safeText(text);
  return safeInput.length <= length ? safeInput : safeInput.substring(0, length - 3) + '...';
}

/**
 * Remove HTML tags
 */
export function stripHtmlTags(html: string | null | undefined): string {
  return safeText(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Basic sanitization
 */
export function sanitizeText(text: string | null | undefined): string {
  return safeText(text)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Escape HTML
 */
export function escapeHtml(text: string | null | undefined): string {
  return safeText(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}