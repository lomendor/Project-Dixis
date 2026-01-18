# TASK: Pass PERF-PRODUCTS-AUDIT-01 — Products Page Performance Audit

**Created**: 2026-01-19
**Status**: ✅ DONE (Audit Only)

---

## Objective

Investigate and document root causes of slow `/products` page load. Identify actionable fixes for future implementation passes.

## Baseline Measurements

### Commands Used

```bash
# Backend API (production)
curl -w "\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\nSize: %{size_download} bytes\n" \
  -o /dev/null -s "https://dixis.gr/api/v1/public/products?page=1&per_page=12"

# Frontend /products (production)
curl -w "\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\nSize: %{size_download} bytes\n" \
  -o /dev/null -s "https://dixis.gr/products"

# Response headers
curl -sI "https://dixis.gr/products" | grep -iE "cache|content-type|x-|etag|age|vary"
curl -sI "https://dixis.gr/api/v1/public/products" | grep -iE "cache|content-type|x-|etag|age|vary"
```

### Results (3 runs each, median reported)

| Endpoint | TTFB | Total | Size |
|----------|------|-------|------|
| Backend API `/api/v1/public/products` | 288ms | 289ms | 6.6 KB |
| Frontend `/products` | 243ms | 345ms | 61 KB |

**Note**: First backend call was 976ms (cold start), subsequent calls ~285ms.

### Caching Headers

| Endpoint | Cache-Control |
|----------|---------------|
| Backend API | `no-cache, private` |
| Frontend | `private, no-cache, no-store, max-age=0, must-revalidate` |

**Finding**: No caching at either layer. Every request hits the database.

---

## Backend Audit

### Files Inspected

- `backend/app/Http/Controllers/Public/ProductController.php`
- `backend/app/Models/Product.php`
- `backend/app/Http/Resources/ProductResource.php`

### Findings

1. **Eager Loading Present** ✅
   - `Product::query()->with(['categories', 'images', 'producer'])` — No N+1 on relations

2. **No Response Caching** ⚠️
   - Every request executes full query + FTS ranking
   - No HTTP cache headers set
   - No application-level cache (Redis/memory)

3. **Heavy Transform in Loop** ⚠️
   - `$products->getCollection()->transform()` runs for each product
   - `number_format()` and `toArray()` on every item

4. **FTS Query on Every Request**
   - Even without search param, FTS vector is still in schema (minor overhead)

5. **Cold Start Penalty** (~700ms)
   - First request after idle shows 976ms vs 285ms subsequent
   - Likely OPcache warming + DB connection pool

---

## Frontend Audit

### Files Inspected

- `frontend/src/app/(storefront)/products/page.tsx`
- `frontend/src/components/CategoryStrip.tsx`
- `frontend/next.config.ts`

### Findings

1. **SSR with `cache: 'no-store'`** ⚠️
   - Line 39: `fetch(..., { cache: 'no-store' })`
   - Every page view triggers fresh backend request
   - No ISR or static generation

2. **No Stale-While-Revalidate**
   - Could use `next: { revalidate: 60 }` for 1-minute cache
   - Would reduce backend load significantly

3. **Demo Fallback Always Available** ✅
   - Good resilience if API fails

4. **CategoryStrip is Client Component**
   - Uses `useSearchParams()` → requires client hydration
   - Not a bottleneck but adds JS bundle

5. **Image Optimization Configured** ✅
   - `formats: ['image/avif', 'image/webp']`
   - Remote patterns configured

---

## Ranked Fix Proposals

| Priority | Fix | Expected Impact | Risk | Files to Touch |
|----------|-----|-----------------|------|----------------|
| **P1** | Add `revalidate: 60` to products fetch | ~10x cache hit ratio, 80% fewer backend calls | Low | `products/page.tsx` |
| **P2** | Add `Cache-Control: s-maxage=60, stale-while-revalidate` to API | CDN caching, sub-50ms responses for cached | Low | `ProductController.php` |
| **P3** | Implement Redis/memory cache for product list | Eliminate DB query on cache hit | Medium | `ProductController.php`, new cache service |
| **P4** | Move transform logic to Resource class | Cleaner code, minor perf gain | Low | `ProductResource.php`, `ProductController.php` |
| **P5** | Warm OPcache on deploy | Eliminate cold start penalty | Low | Deploy script / cron |

---

## Recommended Next Passes

1. **PERF-PRODUCTS-CACHE-01**: Add `revalidate: 60` to frontend + `Cache-Control` headers to API
2. **PERF-PRODUCTS-REDIS-01**: Add Redis caching layer (if load requires it)
3. **PERF-COLD-START-01**: Warm OPcache + keep-alive on deploy

---

_Pass: PERF-PRODUCTS-AUDIT-01 | Author: Claude_
