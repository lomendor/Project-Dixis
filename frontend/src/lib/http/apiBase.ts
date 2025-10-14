export function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return base ? base.replace(/\/+$/, '') : '';
}

export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.DIXIS_ENV === 'local' ? 'http://127.0.0.1:3001' : '');
  if (!base) return path; // client-side θα το χειριστεί ο browser
  if (path.startsWith('http')) return path;
  return base.replace(/\/$/,'') + (path.startsWith('/')?path:('/'+path));
}
