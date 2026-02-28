# Architecture Debt & Known Issues

> Created: 2026-02-27 after debugging session (PRs #3222-#3225)
> Updated: 2026-02-28 after architecture improvement pass (PRs #3229-#3234)
> Purpose: Track architectural problems that keep causing bugs

---

## 1. ~~Dual Email System~~ — PARTIALLY FIXED (PR #3234)

**Status**: Producer status emails now go through Laravel queue (ARCH-FIX-02).

**What was fixed**:
- `ProducerOrderController::updateStatus()` now calls `$emailService->sendOrderStatusNotification()`
- Frontend no longer makes separate Resend API call for status emails
- All order status emails (admin + producer initiated) use same path

**What remains**:
- OTP admin email still uses Next.js `lib/email.ts` → Resend API (needs separate migration)
- `lib/email.ts` still exists in frontend (delete after OTP migration)
- Next.js route `/api/producer/orders/[id]/status` still exists (deprecated, no longer called)

**Phase 2**: Move OTP email to Laravel + delete frontend email code.

---

## 2. ~~Auth Mismatch: Sanctum vs dixis_jwt~~ — FIXED (PRs #3225, #3233)

**Status**: ALL producer routes now use `verifySanctumProducer()` + Sanctum cookie forwarding.

**Fixed in PR #3225**: Analytics routes, settlements, order status email
**Fixed in PR #3233**: `/api/me/products` (GET, POST), `/api/me/products/[id]` (GET, PUT, DELETE)

The old `requireProducer()` helper is no longer imported anywhere.
Only `requireAdmin()` still uses `dixis_jwt` — this is correct (admins use OTP → JWT flow).

---

## 3. ~~CSRF Token Handling~~ — ALREADY CENTRALIZED

**Status**: `apiClient.request()` already:
- Reads XSRF-TOKEN from cookie and sends as `X-XSRF-TOKEN` on every request
- On 401, retries once after refreshing CSRF cookie
- Uses `credentials: 'include'` for all requests

No additional work needed. The original concern was route-specific, but the centralized handling was already in place.

---

## 4. Race Conditions on Checkout (MODERATE) — MITIGATED

**Status**: PR #3222 added guards. The underlying architecture issue remains:
- Cart state is in localStorage (client)
- Checkout validation needs server state
- No single source of truth during page load

**Recommendation**: Checkout should fetch cart + shipping in ONE server call.
**Priority**: Low — not causing user-visible bugs currently.

---

## 5. Server Access (OPERATIONAL) — ONGOING

**Problem**:
- SSH access works via `ssh dixis-prod` (alias)
- GitHub Actions auto-deploy still broken (SSH precheck fails, exit 255)
- Manual deploy: `ssh dixis-prod` → `git pull` → `npm run build` → `pm2 restart`

**Recommendation**:
- Fix GitHub Actions SSH key/config for auto-deploy
- Add uptime monitoring

---

## 6. ~~Ops Routes Security~~ — ALREADY FIXED

**Status**: Both ops routes already have `hash_equals()` + `throttle:10,1`:
- `/ops/commission/preview` — timing-safe token comparison + throttle
- `/ops/db/slow-queries` — timing-safe token comparison + throttle

Fixed in CHECKOUT-TOKEN-FIX-01 pass.

---

## 7. Resend Rate Limits (LOW, mitigated)

**Status**: Laravel Path A has staggered delays. Path B risk eliminated by PR #3234 (producer emails now go through Path A).

Only remaining risk: OTP emails have no rate limiting (admin auth, very low volume).

---

## Remaining Architecture Items

| Priority | Issue | Effort | Status |
|----------|-------|--------|--------|
| ~~**P0**~~ | ~~Fix SSH access~~ | — | Works via alias |
| ~~**P1**~~ | ~~Unify auth~~ | — | ✅ FIXED (PR #3233) |
| **P1** | Fix auto-deploy (GitHub Actions) | Medium | SSH key issue |
| ~~**P2**~~ | ~~Consolidate email system~~ | — | ✅ Phase 1 DONE (PR #3234) |
| **P2** | Move OTP email to Laravel | Low | Phase 2 |
| ~~**P2**~~ | ~~Fix requireProducer() routes~~ | — | ✅ FIXED (PR #3233) |
| ~~**P3**~~ | ~~Centralize CSRF handling~~ | — | ✅ Already done |
| **P3** | Checkout server-side cart validation | Medium | Low priority |
| **P3** | Standardize error responses (82 routes) | High | DX improvement |
| **P3** | Split routes/api.php (1200+ lines) | Medium | DX improvement |
