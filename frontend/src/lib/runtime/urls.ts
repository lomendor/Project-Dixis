/**
 * apiPath: SSR-safe URL builder for fetch
 *
 * SSR context (Node.js):
 *   - Returns absolute URL (required for fetch in Node)
 *   - Uses NEXT_PUBLIC_API_BASE_URL or defaults to http://127.0.0.1:8001
 *
 * CSR context (browser):
 *   - Returns relative path (works with proxy/same-origin)
 *   - Falls back to NEXT_PUBLIC_API_BASE_URL if configured
 *
 * Usage:
 *   const url = apiPath('/api/public/products');
 *   const res = await fetch(url);
 */

export function apiPath(path: string): string {
  // Normalize path to start with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const isServer = typeof window === 'undefined';
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (isServer) {
    // SSR: Must use absolute URL for Node.js fetch
    const absoluteBase = base || 'http://127.0.0.1:8001';
    return absoluteBase.replace(/\/+$/, '') + path;
  } else {
    // CSR: Prefer relative path, fallback to base if configured
    return base ? (base.replace(/\/+$/, '') + path) : path;
  }
}
