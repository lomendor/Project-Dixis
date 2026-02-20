# Backend Architecture Audit — 2026-02-21

**Trigger**: Test order with 3 producers hit 500 (missing `features` table) + broken thank-you page.
**Scope**: Laravel 11 backend — models, controllers, routes, services, migrations.

---

## Critical Findings (Fix Now)

### BUG-01: Thank-you page broken for multi-producer orders
- **Symptom**: POST `/api/v1/public/orders` returns 201 with `CheckoutSessionResource.id = 7` (integer).
  Frontend redirects to `/thank-you?token=7`. GET `/public/orders/by-token/7` returns 400 because
  `showByToken()` expects UUID `public_token`, not integer ID.
- **Root cause**: `CheckoutSession` model has no `public_token` column. `CheckoutSessionResource` returns
  integer `id`. Frontend `useCheckout.ts` uses `order.public_token || order.id` — falls back to integer.
- **Fix**:
  1. Add migration: `public_token` UUID column on `checkout_sessions`
  2. Add `boot()` with auto-UUID generation in `CheckoutSession` model
  3. Add `public_token` to `CheckoutSessionResource`
  4. Add new route `GET /public/checkout-sessions/by-token/{token}` or update `showByToken` to check both tables
  5. Frontend: read `public_token` from response, update thank-you page to handle both order and checkout session

### BUG-02: Commission engine ON with zero rules
- **Symptom**: Feature flag `commission_engine_v1` queries `features` table (Pennant). Table was missing
  until manually migrated. Even with table present, **zero CommissionRules** exist in DB. Engine returns
  0 commission for all orders — silent data loss if rules were expected.
- **Root cause**: Pennant migration never ran. Commission engine code is deployed but not configured.
- **Fix**: Set `COMMISSION_ENGINE_ENABLED=false` in production `.env` until rules are configured.
  The Pennant feature check in `CommissionService` will then short-circuit immediately.

### BUG-03: Legacy OrderController still active
- **Routes**: Lines 222-226 in `routes/api.php` mount `Api\OrderController` (legacy):
  - `GET orders` — uses flat 10% tax, no multi-producer
  - `POST orders` — bypasses CheckoutService, no stock locking, no shipping validation
  - `POST orders/checkout` — creates from cart items with hardcoded tax
- **Risk**: Any authenticated user can hit legacy routes and create orders with wrong pricing.
- **Fix**: Comment out or remove legacy routes. Add deprecation notice.

### BUG-04: Stripe webhook lacks DB::transaction
- **File**: `StripeWebhookController::handleMultiProducerPaymentSuccess()`
- **Risk**: Updates CheckoutSession status, then iterates child orders. If crash after session update
  but before all child orders updated → partial paid state.
- **Fix**: Wrap in `DB::transaction()`.

---

## Important Findings (Fix Soon)

### IMP-01: `env()` used at runtime instead of `config()`
- **File**: `AppServiceProvider.php` line 34: `env('COMMISSION_ENGINE_ENABLED', false)`
- **File**: `routes/api.php` line 1105: `env('OPS_TOKEN')`
- **Problem**: `env()` returns `null` when config is cached (`php artisan config:cache`).
- **Fix**: Add to `config/app.php` or `config/payments.php`, reference via `config()`.

### IMP-02: Ops routes without rate limiting or constant-time auth
- **Routes**: `/ops/commission/preview`, `/ops/db/slow-queries`
- **Problem**: Token comparison via `!==` (timing-side-channel). No rate limiting.
- **Fix**: Use `hash_equals()`, add throttle middleware.

### IMP-03: 1,200-line routes file
- **Not blocking**: But increasingly hard to maintain. Consider splitting into route files
  (`routes/api/admin.php`, `routes/api/producer.php`, etc.).

---

## Good Architecture (No Changes Needed)

- Clean V1 controller hierarchy with proper service delegation
- `CheckoutService` handles multi-producer split with DB::transaction + stock locking
- Orders have UUID `public_token` for safe public access (auto-generated in boot)
- Proper Sanctum auth with admin/producer role guards
- Comprehensive logging throughout the payment flow
- Idempotent webhook handling (checks `payment_status` before updating)

---

## Fix Priority Order

1. **BUG-01** — Thank-you page (user-facing, blocks all multi-producer orders)
2. **BUG-02** — Disable commission engine (safety: prevent silent 0% commission)
3. **BUG-03** — Remove legacy routes (security: prevent wrong-price orders)
4. **BUG-04** — Stripe webhook transaction (data integrity)
5. **IMP-01** — env() → config() (reliability)
6. **IMP-02** — Rate limit ops routes (security hardening)
