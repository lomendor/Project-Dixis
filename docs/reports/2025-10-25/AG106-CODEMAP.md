# AG106 — CODEMAP

## New Files

### frontend/src/server/cache/facets.cache.ts
Simple in-memory TTL cache for facets totals (PG path only).

**Features**:
- **Singleton pattern**: Uses `globalThis` for Next.js hot-reload safety
- **TTL-based expiration**: Default 60s, configurable via `DIXIS_CACHE_TTL_MS`
- **Privacy-safe keys**: Query length only, not actual search text
- **Auto-cleanup**: Expired entries removed on access

**Core Functions**:
```typescript
makeKey(q: FacetQuery): string
  // Creates cache key from query params (privacy-safe)
  // Example: "v1|pending|qLen:5|from|-|-"

get(key: string): CacheValue | undefined
  // Returns cached value if not expired, undefined otherwise
  // Auto-deletes expired entries

set(key: string, value: CacheValue, ttlMs?: number)
  // Stores value with TTL (default 60000ms = 60s)

clear()
  // Clears entire cache (useful for testing/invalidation)
```

**Cache Key Structure**:
```
v1|{status}|qLen:{length}|{fromDate}|{toDate}|{sort}
```

Examples:
- `v1|pending|qLen:5|from|-|-` - Status pending, 5-char search, from date set
- `v1|any|qLen:0|-|-|-` - No filters, no search
- `v1|shipped|qLen:0|from|to|createdAt` - Shipped status with date range

## Modified Files

### frontend/src/app/api/admin/orders/facets/route.ts

**Changes**:
1. **Import cache helpers** (line 7):
   ```typescript
   import { get as getCache, set as setCache, makeKey, DEFAULT_TTL_MS } from '../../../../server/cache/facets.cache';
   ```

2. **Add cache logic** (lines 33-46):
   - Check cache when `DIXIS_CACHE=1`
   - Return cached result if hit
   - Call provider and cache result if miss
   - Fallback to direct call when cache disabled

3. **Add debug header** (line 59):
   - `X-Dixis-Cache: hit` - Result from cache
   - `X-Dixis-Cache: miss` - Fresh database query
   - `X-Dixis-Cache: off` - Cache disabled (not set when DIXIS_CACHE != 1)

**Code Flow**:
```typescript
if (DIXIS_CACHE === '1') {
  const key = makeKey(q);
  const hit = getCache(key);
  if (hit) {
    // Cache hit - return immediately
    totals = hit.totals;
    total = hit.total;
    cacheHdr = 'hit';
  } else {
    // Cache miss - query provider and cache result
    const res = await provider.getFacetTotals(q);
    totals = res.totals;
    total = res.total;
    cacheHdr = 'miss';
    setCache(key, { totals, total }, DEFAULT_TTL_MS);
  }
} else {
  // Cache disabled - direct provider call
  const res = await provider.getFacetTotals(q);
  totals = res.totals;
  total = res.total;
}
```

## Why This Change

### Performance Benefits
- **Reduced database load**: Cache hits avoid expensive `groupBy` queries
- **Faster response times**: Memory lookup (~1ms) vs database query (~40ms)
- **Scalability**: Handles concurrent requests for same query efficiently

### Common Query Patterns
Facets are typically queried:
- **On page load**: Users land on /admin/orders
- **Filter changes**: Status filter updates
- **Pagination**: Moving between pages (same facets)
- **Refresh**: Users F5 to refresh data

With 60s cache, repeated queries within that window are served from memory.

### Cache Hit Scenarios
1. **User lands on page, then filters** - Initial query cached, filter changes miss
2. **Multiple admins view same data** - Second admin gets cache hit
3. **User refreshes quickly** - Refresh within 60s gets cache hit
4. **Pagination** - Same facets used across all pages

## Impact

- ✅ **Zero API contract change**: Response format identical
- ✅ **Opt-in**: Requires `DIXIS_CACHE=1` environment variable
- ✅ **Observable**: `X-Dixis-Cache` header shows hit/miss status
- ✅ **Configurable**: TTL adjustable via `DIXIS_CACHE_TTL_MS`
- ✅ **Privacy-safe**: Cache keys don't contain PII
- ✅ **Memory-efficient**: Simple Map with auto-cleanup

## Configuration

```bash
# Enable cache with default 60s TTL
DIXIS_CACHE=1

# Custom TTL (30 seconds)
DIXIS_CACHE=1 DIXIS_CACHE_TTL_MS=30000

# Disable cache (default)
# DIXIS_CACHE not set or != '1'
```

## Testing Cache Behavior

```bash
# Enable cache + metrics
DIXIS_AGG_PROVIDER=pg DIXIS_CACHE=1 DIXIS_METRICS=1 npm run dev

# First request (cache miss)
curl -i http://localhost:3001/api/admin/orders/facets
# X-Dixis-Cache: miss
# [AG105][facets] provider=pg ms=42.3 ...

# Second request within 60s (cache hit)
curl -i http://localhost:3001/api/admin/orders/facets
# X-Dixis-Cache: hit
# [AG105][facets] provider=pg ms=1.2 ...  (much faster!)

# Request after 60s (cache miss - expired)
sleep 61
curl -i http://localhost:3001/api/admin/orders/facets
# X-Dixis-Cache: miss
# [AG105][facets] provider=pg ms=41.8 ...
```
