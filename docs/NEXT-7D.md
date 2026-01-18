# Next 7 Days

**Period**: 2026-01-19 to 2026-01-26
**Updated**: 2026-01-19

---

## Upcoming Work

### Performance Fixes (from PERF-PRODUCTS-AUDIT-01)

- **PERF-PRODUCTS-CACHE-01** (P1): Add `revalidate: 60` to frontend fetch + `Cache-Control` headers to backend API
  - Files: `products/page.tsx`, `ProductController.php`
  - Expected: 80% fewer backend hits, sub-50ms cached responses

- **PERF-COLD-START-01** (P3): Warm OPcache on deploy to eliminate ~700ms cold start penalty
  - Files: Deploy script / cron job

### Backlog

- **PERF-PRODUCTS-REDIS-01**: Redis cache layer for product list (defer unless scale requires)

---

_Last updated by Pass PERF-PRODUCTS-AUDIT-01_
