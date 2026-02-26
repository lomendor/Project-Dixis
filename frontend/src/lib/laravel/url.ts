/**
 * laravel/url.ts — Safe URL builder for Next.js → Laravel proxy calls
 *
 * PROBLEM: getLaravelInternalUrl() returns a base that already includes /api/v1.
 * Manually concatenating paths risks double prefixes (e.g. /api/v1/api/v1/...).
 * This helper joins paths safely and catches common mistakes.
 *
 * USAGE:
 *   import { laravelUrl } from '@/lib/laravel/url'
 *   const url = laravelUrl('admin/products')        // → http://127.0.0.1:8001/api/v1/admin/products
 *   const url = laravelUrl('public/products', { page: '1' })  // → ...?page=1
 *
 * ANTI-PATTERNS it catches:
 *   laravelUrl('/api/v1/products')   → strips double /api/v1 prefix
 *   laravelUrl('/api/products')      → strips /api prefix
 *
 * Created after PR #3192 (double /api/ prefix bug).
 */

import { getLaravelInternalUrl } from '@/env';

/**
 * Build a full URL to a Laravel API endpoint.
 *
 * @param path  - Relative path after /api/v1 (e.g. 'admin/products', 'public/products/21')
 * @param query - Optional query params as Record<string, string>
 * @returns     - Full URL object ready for fetch()
 */
export function laravelUrl(path: string, query?: Record<string, string>): URL {
  const base = getLaravelInternalUrl().replace(/\/+$/, ''); // trim trailing slashes

  // Safety: strip accidental /api/v1 or /api/ prefix from path
  let cleanPath = path.replace(/^\/+/, ''); // trim leading slashes
  cleanPath = cleanPath.replace(/^api\/v1\//, ''); // strip /api/v1/ if someone included it
  cleanPath = cleanPath.replace(/^api\//, '');      // strip /api/ if someone included it

  const url = new URL(`${base}/${cleanPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url;
}
