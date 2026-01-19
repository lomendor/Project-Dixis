# Next 7 Days

**Period**: 2026-01-19 to 2026-01-26
**Updated**: 2026-01-19

---

## Completed

### Performance Fixes (from PERF-PRODUCTS-AUDIT-01)

- ✅ **PERF-PRODUCTS-CACHE-01** (P1): Add `revalidate: 60` to frontend fetch + `Cache-Control` headers to backend API
  - PR #2317 merged, commit `dcd0fdd2`
  - Production deployed (Backend Run 21120676076, Frontend Run 21120676337)

### MVP Verification

- ✅ **MVP-CHECKLIST-01**: Gap analysis of MVP requirements
  - PR #2320 merged
  - 40 requirements mapped, 39 implemented (97.5%)

- ✅ **EMAIL-EVENTS-01**: Order email verification
  - Verified Pass 53 already implements order emails
  - Consumer + Producer notifications working in production
  - Corrected MVP-CHECKLIST gap count: 2 → 1

- ✅ **CART-SYNC-01**: Backend cart sync for logged-in users
  - PR #2322 merged
  - `POST /api/v1/cart/sync` endpoint with transactional merge
  - Frontend triggers sync on login, replaces localStorage with server cart
  - **MVP now 100% complete (40/40 requirements)**

### CI Reliability

- ✅ **SMOKE-FLAKE-01**: Increased healthz probe timeouts
  - PR #2319 merged
  - maxAttempts: 6 → 8, timeoutMs: 15s → 20s

## Upcoming Work

### MVP Gaps (0 remaining)

🟢 **All MVP gaps have been closed. V1 Launch Ready.**

---

## V1 Launch QA Checklist

Pre-launch verification before announcing V1:

### Core Flows (Manual Smoke)

- [ ] **Guest checkout**: Add product → Checkout as guest → COD → Confirm order email
- [ ] **User checkout**: Register → Login → Cart sync works → Card payment → Confirm
- [ ] **Producer flow**: Login as producer → Add product → See it pending → Admin approves
- [ ] **Admin flow**: Login as admin → View orders → Update status → Email sent

### Production Health

- [ ] `https://dixis.gr/api/healthz` returns `{"status":"ok"}`
- [ ] `https://dixis.gr/api/v1/public/products` returns products with cache headers
- [ ] Email delivery works (test password reset or order)
- [ ] Card payment works in Stripe test mode

### Performance

- [ ] Products page loads < 2s (check with Lighthouse or curl)
- [ ] No 500 errors in Laravel logs for 24h

### Security

- [ ] HTTPS enforced on all endpoints
- [ ] CSP headers present (check Stripe works)
- [ ] Auth endpoints rate-limited

### Rollback Plan

- [ ] Previous deploy SHA documented: `____________`
- [ ] Rollback command ready: `git revert HEAD && git push`

---

### Performance (Backlog)

- ✅ **PERF-COLD-START-01** (P3): Investigated ~700ms cold start — **RESOLVED**
  - Baseline: All endpoints < 300ms TTFB
  - No fix needed; issue was resolved by prior passes (IPV4, caching)
  - Artifact: `scripts/perf-baseline.sh`

- **PERF-PRODUCTS-REDIS-01**: Redis cache layer for product list (defer unless scale requires)

---

_Last updated by Pass PERF-COLD-START-01 (2026-01-19)_
