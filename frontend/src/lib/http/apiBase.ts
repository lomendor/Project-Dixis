/**
 * @deprecated Use imports from '@/env' instead:
 *   import { API_BASE_URL, apiUrl } from '@/env';
 * This module is a legacy duplicate. SSOT is src/env.ts.
 */
export function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return base ? base.replace(/\/+$/, '') : '';
}

/** @deprecated Use `import { apiUrl } from '@/env'` instead. */
export function apiUrl(path: string) {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const base = apiBase();
  return base ? (base + path) : path; // internal when empty
}
