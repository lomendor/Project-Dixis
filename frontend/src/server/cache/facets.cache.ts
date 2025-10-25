// AG106 — simple in-memory TTL cache for facets totals (PG path only)
export type CacheValue = { totals: Record<string, number>; total: number }
type Entry = { expiresAt: number; value: CacheValue }

const globalForCache = globalThis as unknown as { __dixisFacetsCache?: Map<string, Entry> }
const store = (globalForCache.__dixisFacetsCache ??= new Map<string, Entry>())

export const DEFAULT_TTL_MS = Number(process.env.DIXIS_CACHE_TTL_MS ?? 60000)

export function makeKey(q: {
  status?: string; q?: string; fromDate?: string; toDate?: string; sort?: string;
}) {
  // Μην βάζεις την πλήρη q για PII· βάλε μόνο το length.
  const qLen = q.q ? q.q.length : 0
  return [
    'v1', // schema version
    q.status ?? 'any',
    `qLen:${qLen}`,
    q.fromDate ? 'from' : '-',
    q.toDate ? 'to' : '-',
    q.sort ?? '-',
  ].join('|')
}

export function get(key: string, now = Date.now()): CacheValue | undefined {
  const e = store.get(key)
  if (!e) return undefined
  if (e.expiresAt <= now) { store.delete(key); return undefined }
  return e.value
}

export function set(key: string, value: CacheValue, ttlMs = DEFAULT_TTL_MS, now = Date.now()) {
  store.set(key, { value, expiresAt: now + ttlMs })
}

export function clear() { store.clear() }
