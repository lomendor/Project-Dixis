export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';

export function abs(path: string): string {
  if (!path) return SITE_URL;
  // ensure path starts with /
  const p = path.startsWith('/') ? path : `/${path}`;
  return new URL(p, SITE_URL).toString();
}
