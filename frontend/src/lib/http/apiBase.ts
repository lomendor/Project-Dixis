export function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return base ? base.replace(/\/+$/, '') : '';
}

export function apiUrl(path: string) {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const base = apiBase();
  return base ? (base + path) : path; // internal when empty
}
