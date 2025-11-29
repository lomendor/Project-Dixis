export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';

// Internal URL for server-side API calls (avoids self-deadlock through nginx)
const INTERNAL_URL = process.env.INTERNAL_API_URL || 'http://localhost:3000';

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
