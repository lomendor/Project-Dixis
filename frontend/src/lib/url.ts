/**
 * @deprecated Use `import { SITE_URL, getServerApiUrl } from '@/env'` instead.
 * This module is a legacy duplicate. SSOT is src/env.ts.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';

// Internal URL for server-side API calls (avoids self-deadlock through nginx)
// NEVER use localhost fallback - use empty string for relative URL if env not set
const INTERNAL_URL = process.env.INTERNAL_API_URL || '';

export function abs(path: string): string {
  if (!path) return SITE_URL;
  // ensure path starts with /
  const p = path.startsWith('/') ? path : `/${path}`;

  // On server-side, use localhost to avoid deadlock through nginx
  // The app would otherwise call itself through https://dixis.gr which
  // goes through nginx and back to the same app that's still starting
  if (typeof window === 'undefined') {
    return `${INTERNAL_URL}${p}`;
  }

  return new URL(p, SITE_URL).toString();
}
