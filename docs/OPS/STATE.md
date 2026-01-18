# OPS STATE

**Last Updated**: 2026-01-19 (Pass PERF-PRODUCTS-AUDIT-01)

> **Archive Policy**: Keep last ~10 passes (~2 days). Older entries auto-archived to `STATE-ARCHIVE/`.
> **Current size**: ~300 lines (target ≤250).

## 2026-01-19 — Pass PERF-PRODUCTS-AUDIT-01: Products Page Performance Audit

**Status**: ✅ DONE (Audit Only)

Audited `/products` page performance. No code changes — findings documented for future FIX passes.

### Key Findings

- Frontend uses `cache: 'no-store'` — every page view hits backend
- Backend API returns `Cache-Control: no-cache` — no CDN caching
- TTFB: ~285ms (backend), ~245ms (frontend)
- Cold start penalty: ~700ms on first request

### Recommended Fixes

1. **P1**: Add `revalidate: 60` to frontend fetch
2. **P2**: Add `Cache-Control: s-maxage=60` to backend API
3. **P3**: Redis cache layer (if scale requires)

### Docs

- `docs/AGENT/PASSES/TASK-Pass-PERF-PRODUCTS-AUDIT-01.md`
- `docs/AGENT/PASSES/SUMMARY-Pass-PERF-PRODUCTS-AUDIT-01.md`

---

## 2026-01-18 — Pass EMAIL-VERIFY-01: Email Verification Flow

**Status**: ✅ CLOSED (Production Deployed)

Implemented complete email verification flow for user registration.

### Changes

- **Backend**: `EmailVerificationController` with verify/resend endpoints
- **Mail**: `VerifyEmailMail` with Greek template (via Resend)
- **DB**: `email_verification_tokens` table (hashed tokens, 24h expiry)
- **Frontend**: `/auth/verify-email` page with all states
- **i18n**: Greek + English translations
- **Tests**: 11 backend + 2 E2E

### Configuration

```env
EMAIL_VERIFICATION_REQUIRED=true   # Enable verification requirement
EMAIL_NOTIFICATIONS_ENABLED=true   # Enable email sending (already set)
```

Default: `EMAIL_VERIFICATION_REQUIRED=false` (backwards compatible, auto-verify)

### Production Deploy

- **Date**: 2026-01-18 22:35 UTC
- **Commit**: `04aefc91`
- **Backend Deploy**: Run ID 21118201989 (success)
- **Frontend Deploy**: Run ID 21118202544 (success)
- **Migration**: `php artisan migrate --force` (manual SSH)

### Evidence

```bash
# Health check
curl -sf https://dixis.gr/api/healthz
# {"status":"ok","database":"connected",...}

# Resend endpoint
curl -X POST https://dixis.gr/api/v1/auth/email/resend -d '{"email":"test@example.com"}'
# {"message":"If an account exists with this email and is not yet verified, you will receive a verification link."}

# Verify endpoint
curl -X POST https://dixis.gr/api/v1/auth/email/verify -d '{"email":"test@example.com","token":"invalid"}'
# {"message":"Invalid or expired verification token."}
```

### PRs

- #2312 (feat: Pass EMAIL-VERIFY-01 email verification flow) — merged

---

## 2026-01-18 — Pass PERF-IPV4-PREFER-01: Fix 9.5s Backend Latency

**Status**: ✅ CLOSED

Fixed critical 9.5s backend latency by adding IPv4 preference to bypass broken IPv6 path to Neon DB.

### Root Cause

VPS (Hostinger, Frankfurt) attempted IPv6 connections first to Neon DB (AWS eu-central-1). IPv6 path was broken, causing 9.2s timeout before falling back to IPv4 (which connected in 4ms).

### Fix

Added to `/etc/gai.conf` on VPS:
```
precedence ::ffff:0:0/96  100
```

Then reloaded PHP-FPM to pick up new address resolution settings.

### Results

| Endpoint | BEFORE | AFTER | Improvement |
|----------|--------|-------|-------------|
| `/api/health` | 9.27-9.33s | 71-80ms | ~130x faster |
| `/api/v1/public/products` | 9.30-9.41s | 121-188ms | ~65x faster |

### Rollback

```bash
cp /etc/gai.conf.backup.perf-ipv4-20260118 /etc/gai.conf && systemctl reload php8.2-fpm
```

---

## 2026-01-18 — Pass CSP-STRIPE-01: Fix CSP for Stripe Elements

**Status**: ✅ CLOSED

Fixed Content-Security-Policy header that was blocking Stripe Elements iframe.

### Root Cause

CSP in `frontend/next.config.ts` was missing `frame-src` directive, causing iframes to fall back to `default-src 'self'` which blocked Stripe domains.

### Fix

Added minimal Stripe allowlist to CSP:
- `script-src`: `https://js.stripe.com`
- `connect-src`: `https://api.stripe.com`, `https://r.stripe.com`
- `frame-src`: `https://js.stripe.com`, `https://hooks.stripe.com`

### PRs

- #2304 (fix: add Stripe domains to CSP) — merged

---

## 2026-01-18 — Pass STRIPE-E2E-TIMEOUT-01: Deterministic Stripe E2E Test

**Status**: ✅ CLOSED

Made Stripe Elements E2E test deterministic by replacing blind waits with network interception.

### Changes

- Wait for order creation response (201)
- Wait for payment init response (200) with client_secret validation
- Extended timeout (90s) for Stripe iframe after payment init

### Evidence

```
Running 1 test using 1 worker
  ✓ Stripe Elements card payment flow (2.2m)
  1 passed
```

---

## 2026-01-18 — Pass PAYMENTS-STRIPE-ELEMENTS-01: Stripe Elements Integration

**Status**: ✅ CLOSED

Replaced Stripe Checkout redirect with embedded Stripe Elements card form.

### Changes

1. **Checkout page**: Integrated `StripeProvider` + `StripePaymentForm` for inline card payment
2. **API client**: Fixed paths to match backend (`/payments/orders/{id}/init`)
3. **E2E test**: Updated to work with new Stripe Elements flow

### Flow

```
Checkout form → Submit → initPayment → Stripe Elements → Pay → confirmPayment → Success
```

### PRs

- #2300 (feat: Pass PAYMENTS-STRIPE-ELEMENTS-01) — merged

### Files Changed

- `frontend/src/app/(storefront)/checkout/page.tsx`
- `frontend/src/lib/api/payment.ts`
- `frontend/tests/e2e/card-payment-real-auth.spec.ts`

---

## 2026-01-18 — Pass PAYMENTS-CARD-REAL-01: Card Payment E2E with Real Auth

**Status**: ✅ CLOSED

Enabled repeatable card payment E2E verification and fixed deploy workflow env persistence.

### Changes

1. **E2E Test with Real Auth**: UI login with secure credentials (e2e-card-test@dixis.gr)
2. **Deploy Workflow**: Stripe publishable key at build time (line 55)
3. **GitHub Secret**: `STRIPE_PUBLIC_KEY` for CI/CD build embedding
4. **Test Stabilization**: Fixed selector issues for CI mock auth state

### Evidence (Final Run)

```
Running 4 tests using 1 worker

  ✓ UI login with real credentials (21.8s)
  ✓ add product to cart and reach checkout
  ✓ card payment option visible for authenticated user
    Payment options: { cod: true, card: true }
  ○ Stripe test card payment flow [skipped - needs rebuild with key]

  1 skipped, 3 passed (2.2m)
```

### Test Fixes Applied

- Auth state clearing before login to avoid CI mock interference
- Hydration wait (500ms) before clicking login button
- Auth indicator selector fixed for "Logout" button text

### PRs

- #2290 (feat: Pass PAYMENTS-CARD-REAL-01) — merged
- #2292 (fix: stabilize E2E tests) — merged
- #2295 (docs: final state update) — merged

### Note on Stripe Elements Test

The "Stripe test card payment flow" test **correctly skips** because Stripe Elements (actual card input form) is **not yet implemented**. The current scope covers:
- ✅ Card payment option visible for authenticated users
- ⏭️ Stripe Elements card form - future pass

---

## 2026-01-18 — Pass ENV-FRONTEND-PAYMENTS-01: Frontend VPS Env for Card Payments

**Status**: ✅ CLOSED

Configured VPS frontend environment to enable card payments by adding missing Stripe variables.

### Issues Fixed

1. **Permission blocker**: Removed `node_modules/.cache/jiti` (owned by root)
2. **Missing .env**: Restored after rsync `--delete` removed it
3. **Missing Stripe vars**: Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_PAYMENTS_CARD_FLAG`

### Evidence

| Endpoint | Field | Value |
|----------|-------|-------|
| /api/healthz | card.flag | enabled |
| /api/healthz | card.stripe_configured | true |
| /api/healthz | keys_present.secret | true |
| /api/healthz | keys_present.public | true |

### Deploy

- Run ID: 21102358766
- Status: SUCCESS
- Duration: 3m50s

### PRs

- #2289 (docs: Pass ENV-FRONTEND-PAYMENTS-01 audit trail)

---

## 2026-01-18 — Pass CARD-PAYMENT-SMOKE-01: Card Payment E2E Smoke Test

**Status**: ✅ CLOSED

Created E2E smoke tests for Stripe card payment infrastructure.

### Backend Stripe Config (Verified)

| Key | Status |
|-----|--------|
| STRIPE_KEY | present |
| STRIPE_SECRET | present |
| STRIPE_WEBHOOK_SECRET | present |
| card.flag via /api/health | enabled |
| card.stripe_configured | true |

### Tests Added

- `card-payment-smoke.spec.ts` - 3 tests (CI-safe with graceful skips)

### PRs

- #2288 (feat: Pass CARD-PAYMENT-SMOKE-01) — merged

---

## 2026-01-17 — Pass PROD-UNBLOCK-01: Production Auth & Products Verification

**Status**: ✅ CLOSED

Investigated reported production issues ("products not visible" + "register/login not working"). Found all APIs working correctly.

### Root Cause

The perceived auth failure was caused by **shell escaping**, not a server issue:
- zsh escapes `!` to `\!` in command-line strings
- JSON payload with `"Password1\!"` is invalid
- Laravel's `json_decode` fails, `$request->all()` returns empty
- Testing with passwords without `!` succeeded immediately

### Evidence

| Test | Result |
|------|--------|
| Products API | ✅ Returns 5 products |
| Register | ✅ Creates user, returns token |
| Login | ✅ Authenticates, returns token |
| AuthController import | ✅ `Illuminate\Http\Request` |

### Files Verified (MD5 match)

| File | Match |
|------|-------|
| AuthController.php | ✅ |
| routes/api.php | ✅ |

### PRs

- None required (all APIs working, no code changes)

---

## 2026-01-17 — Pass EMAIL-SMOKE-01: VPS → Resend End-to-End Smoke Test

**Status**: ✅ CLOSED

Verified end-to-end email sending from VPS production backend via Resend.

### Mail Configuration (No Secrets)

| Config | Value |
|--------|-------|
| MAIL_MAILER | resend |
| MAIL_FROM_ADDRESS | info@dixis.gr |
| MAIL_FROM_NAME | Dixis |

### Evidence

**Test 1: Artisan Command**
```
$ ssh dixis-prod 'php artisan dixis:email:test --to=kourkoutisp@gmail.com'
[OK] Test email sent successfully to kourkoutisp@gmail.com
```

**Test 2: Password Reset Endpoint**
```
$ curl -s -X POST "https://dixis.gr/api/v1/auth/password/forgot" ...
{"message":"If an account exists with this email, you will receive a password reset link."}
```

### PRs

- #TBD (docs: Pass EMAIL-SMOKE-01 VPS email smoke test) — pending

---


## Archive

Older entries moved to archive for faster agent boot. **Cutoff**: Keep last 10 passes (~2 days).

| Archive | Period | Link |
|---------|--------|------|
| 2026-01-17 (Early) | Jan 17 early | [STATE-2026-01-17-early.md](STATE-ARCHIVE/STATE-2026-01-17-early.md) |
| 2026-01-16 | Jan 16 | [STATE-2026-01-16.md](STATE-ARCHIVE/STATE-2026-01-16.md) |
| 2026-01-14 to 2026-01-15 | Jan 14-15 | [STATE-2026-01-14-15.md](STATE-ARCHIVE/STATE-2026-01-14-15.md) |
| 2026 Q1 (Early) | Jan 4-12 | [STATE-2026-Q1-EARLY.md](STATE-ARCHIVE/STATE-2026-Q1-EARLY.md) |

See [STATE-ARCHIVE/INDEX.md](STATE-ARCHIVE/INDEX.md) for full list.
