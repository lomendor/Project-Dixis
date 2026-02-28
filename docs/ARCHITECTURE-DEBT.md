# Architecture Debt & Known Issues

> Created: 2026-02-27 after debugging session (PRs #3222-#3225)
> Updated: 2026-02-28 after architecture improvement pass (PRs #3229-#3235)
> Purpose: Track architectural problems that keep causing bugs

---

## 1. ~~Dual Email System~~ — MOSTLY FIXED (PRs #3234, #3235)

**Status**: All emails now use SMTP-first transport. Resend API is fallback only.

**What was fixed**:
- PR #3234: `ProducerOrderController::updateStatus()` now calls `$emailService->sendOrderStatusNotification()`
- PR #3234: Frontend no longer makes separate Resend API call for producer status emails
- PR #3235: OTP email switched from Resend-only to SMTP-first (same pattern as all other emails)
- PR #3235: Deleted deprecated `/api/producer/orders/[id]/status` route (dead code after PR #3234)

**What remains (low priority)**:
- `lib/email.ts` still exists for: OTP email, admin Prisma order status emails, order confirmation
- Admin Prisma order emails are legacy (new orders use Laravel) — will become dead code naturally
- Full elimination of `lib/email.ts` requires migrating OTP to Laravel (adds complexity for low gain)

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

## 5. ~~Server Access~~ — FIXED (verified 2026-02-28)

**Status**: Auto-deploy via GitHub Actions is WORKING. Both PRs #3233 and #3234 deployed automatically.

**How it works**: `deploy-frontend.yml` builds standalone bundle on GitHub Actions runner, rsync to VPS, restores .env symlink, starts PM2, runs 20x health proof.

**WARNING**: Do NOT run `git pull` + `npm run build` on VPS manually. The auto-deploy uses `rsync --delete` which replaces the VPS directory with the standalone bundle. Manual `git checkout` files will be deleted on next auto-deploy. If manual deploy is needed, follow standalone pattern or just re-trigger workflow.

**Manual fallback**: `ssh dixis-prod` → `cd /var/www/dixis/current/frontend` → use PM2 restart only (not git pull + build).

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
| ~~**P1**~~ | ~~Fix auto-deploy (GitHub Actions)~~ | — | ✅ WORKING (verified 2026-02-28) |
| ~~**P2**~~ | ~~Consolidate email system~~ | — | ✅ Phase 1 DONE (PR #3234) |
| ~~**P2**~~ | ~~OTP email SMTP-first + cleanup~~ | — | ✅ DONE (PR #3235) |
| ~~**P2**~~ | ~~Fix requireProducer() routes~~ | — | ✅ FIXED (PR #3233) |
| ~~**P3**~~ | ~~Centralize CSRF handling~~ | — | ✅ Already done |
| **P3** | Checkout server-side cart validation | Medium | Low priority |
| **P3** | Standardize error responses (82 routes) | High | DX improvement |
| ~~**P3**~~ | ~~Split routes/api.php (1200+ lines)~~ | — | ✅ DONE (PRs #3236, #3237): 1228 → 517 lines |
