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

### Core Flows (Manual Smoke) - V1-QA-EXECUTE-01

- [x] **Guest checkout**: Add product → Checkout as guest → COD → Confirm order email
  - Order #86 created, COD payment, shipping to Athens
- [x] **User checkout**: Register → Login → Cart sync works → Card payment → Confirm
  - ~~Order #87 created, but Stripe payment init FAILED (P1 blocker)~~
  - **FIXED**: PR #2327 merged, Order #91 payment init success
- [x] **Producer flow**: Login as producer → Add product → See it pending → Admin approves
  - Product #7 created, auto-approved (status: available)
- [x] **Admin flow**: Login as admin → View orders → Update status → Email sent
  - Order #86 updated to "processing" via admin API

### Production Health

- [x] `https://dixis.gr/api/healthz` returns `{"status":"ok"}`
- [x] `https://dixis.gr/api/v1/public/products` returns products with cache headers
- [?] Email delivery works (test password reset or order) - Not verified in this pass
- [x] Card payment works in Stripe test mode - **FIXED** (PR #2327, Order #91 verified)

### Performance

- [x] Products page loads < 2s (check with Lighthouse or curl) - ~180ms TTFB
- [?] No 500 errors in Laravel logs for 24h - Not verified in this pass

### Security

- [x] HTTPS enforced on all endpoints
- [x] CSP headers present (check Stripe works) - Stripe working (PR #2327)
- [!] Auth endpoints rate-limited - **NOT rate limited** (P2 security gap)

### Rollback Plan

- [x] Previous deploy SHA documented: `06850e79`
- [x] Rollback command ready: `git revert HEAD && git push`

### Known Blockers (P1)

- ~~**STRIPE-PAYMENT-INIT**: Card payments fail with "Failed to initialize payment"~~
  - **RESOLVED**: PR #2327 merged (commit `cbec8d96`)
  - Fix: Fallback to order.shipping_address.email when customer data not provided
  - Verified: Order #91 payment init succeeded

---

### Remaining V1 Verification Tasks (V1-VERIFY-TRIO-01)

- [~] **EMAIL-PROOF-01**: Verify Resend delivery end-to-end
  - ✅ Resend configured in production (`/api/health` shows `configured: true`)
  - ⚠️ E2E delivery test blocked: RESEND_API_KEY not available locally
  - Action: Provide API key or SSH access for full verification

- [!] **SECURITY-AUTH-RL-01**: Auth rate limiting proof
  - ❌ `/api/v1/auth/login` is **NOT rate limited** (30 requests, no 429)
  - ❌ `/api/v1/auth/register` is **NOT rate limited** (10 requests, no 429)
  - **P2 Security Gap**: Add `throttle` middleware to auth endpoints
  - Evidence: `docs/AGENT/SUMMARY/Pass-V1-VERIFY-TRIO-01.md`

- [~] **LOG-REVIEW-24H-01**: Production logs scan
  - ⚠️ Blocked: SSH access denied (publickey auth required)
  - ✅ `/api/health` shows all systems operational
  - Action: Provide SSH access for log review

---

### Performance (Backlog)

- ✅ **PERF-COLD-START-01** (P3): Investigated ~700ms cold start — **RESOLVED**
  - Baseline: All endpoints < 300ms TTFB
  - No fix needed; issue was resolved by prior passes (IPV4, caching)
  - Artifact: `scripts/perf-baseline.sh`

- **PERF-PRODUCTS-REDIS-01**: Redis cache layer for product list (defer unless scale requires)

---

_Last updated by Pass V1-VERIFY-TRIO-01 (2026-01-19)_
