# OPS STATE

**Last Updated**: 2026-01-26 (CHECKOUT-COPY-02)

> **Archive Policy**: Keep last ~10 passes (~2 days). Older entries auto-archived to `STATE-ARCHIVE/`.
> **Current size**: ~550 lines (target ≤250). ⚠️

---

## 2026-01-26 — Pass CHECKOUT-COPY-02: Remove Hardcoded Prices from Note

**Status**: ✅ COMPLETE (i18n fix)

**Problem**: Previous fix (CHECKOUT-COPY-01) added hardcoded "€3.50 / free over €35" which is NOT business-approved policy.

**Fix**:
- EL: "Τα μεταφορικά θα υπολογιστούν στο checkout (ενδέχεται να διαφέρουν ανά παραγωγό)"
- EN: "Shipping will be calculated at checkout (may vary per producer)"
- Test now asserts NO hardcoded prices + NO VAT mention

**Next**: Shipping Settings v1 (per-producer configurable rates)

---

## 2026-01-26 — Pass CHECKOUT-COPY-01: Fix Misleading Shipping/VAT Note

**Status**: ⚠️ SUPERSEDED by CHECKOUT-COPY-02

**Problem**: Checkout note claimed "VAT will be calculated next step" but VAT is not implemented.

**Issue**: Fix introduced hardcoded prices (€3.50/€35) which are not business-approved.

---

## 2026-01-26 — Pass MULTI-PRODUCER-SHIPPING-AUDIT-01: Investigation Complete

**Status**: ✅ AUDIT COMPLETE (Read-Only)

**Findings Summary**:

| Aspect | Current State |
|--------|--------------|
| **Shipping** | €3.50 flat per producer, free ≥€35 per producer |
| **Tax/VAT** | NOT IMPLEMENTED (always 0.00) |
| **Order Split** | 1 CheckoutSession → N child Orders (one per producer) |
| **UI Message** | Stale - claims VAT "calculated next step" but it never is |

**Key Discovery**: `TaxService` exists (`backend/app/Services/TaxService.php`) but is **never called** from `CheckoutService`. All orders have `tax_amount: 0.00`.

**Recommendations**:
1. Update UI message to remove VAT mention (or implement VAT)
2. Add E2E test for 2-producer shipping (€7.00 = 2 × €3.50)

**Report**: `docs/AGENT/FINDINGS/Pass-MULTI-PRODUCER-SHIPPING-AUDIT-01.md`

---

## 2026-01-26 — Pass PAYMENT-INIT-ORDER-ID-01: Fix 404 on Payment Init (Multi-Producer)

**Status**: ✅ FIXED — MERGED (PR #2490) — PROD DEPLOYED

**Problem**:
`POST /api/v1/payments/orders/{id}/init` was called with CheckoutSession ID instead of Order ID, returning 404 "Order not found".

**Root Cause**:
- Multi-producer checkout returns `CheckoutSession` (id=6) with child `Orders` (id=115, 116)
- Frontend treated `checkout_session.id` as `order.id` for payment initialization
- Backend `Order::findOrFail(6)` failed because no Order with ID 6 exists

**Fix** (PR #2490):
- Backend: Add `payment_order_id` to `CheckoutSessionResource` (first child order ID)
- Frontend: Use `payment_order_id` for `initPayment`, CheckoutSession ID for thank-you redirect
- Frontend: Handle 409 (stock conflict) with Greek error message
- Frontend: Clear stale payment state on order creation failure

**Evidence** (Production API, 2026-01-26):
```json
{
  "id": 6,
  "type": "checkout_session",
  "is_multi_producer": true,
  "payment_order_id": 115,
  "first_child_order_id": 115
}
```

**Verification**:
- ✅ PR merged: https://github.com/lomendor/Project-Dixis/pull/2490
- ✅ Deploy Backend (VPS): success
- ✅ `payment_order_id` matches `first_child_order_id`

**Docs**:
- Tasks: `docs/AGENT/TASKS/Pass-PAYMENT-INIT-ORDER-ID-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-PAYMENT-INIT-ORDER-ID-01.md`

---

## 2026-01-26 — Pass PROD-CHECKOUT-SAFETY-01: Multi-Producer shipping_lines Aggregation

**Status**: ✅ FIXED — MERGED (PR #2488) — PROD VERIFIED

**Title**: Multi-producer shipping_lines aggregation at top-level response

**Root Cause**:
`CheckoutSessionResource` returned child orders with their own `shipping_lines`, but the **top-level response** did not aggregate them. Frontend/tests accessed `data.shipping_lines` expecting aggregated data, got `[]`.

**Fix** (PR #2488, commit `7b0eca26`):
- `CheckoutSessionResource.php`: Added `shipping_lines` field that aggregates all shipping lines from child orders
- `CheckoutService.php`: Use nested eager loading (`orders.shippingLines`) to ensure relation is available

**Evidence** (Production API canary, 2026-01-26T09:40 UTC):
```json
{
  "type": "checkout_session",
  "is_multi_producer": true,
  "order_count": 2,
  "shipping_lines_count": 2,
  "shipping_lines": [
    {"producer_id": 1, "producer_name": "Green Farm Co.", "shipping_cost": "3.50"},
    {"producer_id": 4, "producer_name": "Test Producer B", "shipping_cost": "3.50"}
  ],
  "shipping_total": "7.00"
}
```

**Verification**:
- ✅ `shipping_lines_count == 2` (= number of producers)
- ✅ `shipping_total == "7.00"` (= 2 × €3.50)
- ✅ CI required checks: `build-and-test`, `Analyze (javascript)`, `quality-gates` all PASS

**Docs**:
- Tasks: `docs/AGENT/TASKS/Pass-PROD-CHECKOUT-SAFETY-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-PROD-CHECKOUT-SAFETY-01.md`

---

## 2026-01-26 — Analysis: Multi-Producer Order Data Issues

**Status**: ✅ ANALYZED — NO CODE BUG (Legacy Data Issue)

**Investigation Summary**:
Orders 94-103 show incorrect data (`is_multi_producer: false`, `shipping_lines: []`) because they were created **before** CheckoutService deployment (#2476, #2479).

**Evidence**:
- Order #103 created at `2026-01-24T10:47:22` (before CheckoutService merge)
- CheckoutService merged on 2026-01-25 (PR #2476, #2479)
- All 23 backend multi-producer tests pass (122 assertions)
- Production sanity workflow run #21349228961: PASSED with warning for legacy order

**Backend Tests Verified**:
```
✓ multi_producer_checkout_creates_checkout_session
✓ multi_producer_checkout_creates_child_orders
✓ each_child_order_has_shipping_line
✓ shipping_total_equals_sum_of_line_costs
```

**Conclusion**:
- Current code is CORRECT
- New multi-producer orders will have proper data
- Legacy orders (94-103) have incorrect data (expected, pre-feature)

**Follow-up**: Optional data migration for legacy orders if business requires.

---

## 2026-01-25 — Pass GUARDRAILS-CRITICAL-FLOWS-01: Checkout Regression Guardrails

**Status**: ✅ COMPLETE (PR #2484)

Added automated guardrails to catch checkout regressions before users see broken flows.

**Problem**: Despite `curl` returning HTTP 200, production order data was incorrect:
- Order #103: `is_multi_producer: false` for 2-producer order
- `shipping_lines: []` empty
- `shipping_total: "0.00"` instead of €7.00

**Solution**:
- GUARDRAIL #1: `prod-sanity-orders.yml` workflow (daily + manual)
- GUARDRAIL #2: `checkout-golden-path.spec.ts` E2E tests (@smoke)
- Documentation: `SHIPPING-AND-TAXES-MVP.md` spec

**Evidence**:
- Workflow checks order data integrity (not just HTTP 200)
- E2E tests verify shipping_lines populated for multi-producer orders
- Spec documents €3.50/producer shipping + VAT rules

**Docs**:
- Tasks: `docs/AGENT/TASKS/Pass-GUARDRAILS-CRITICAL-FLOWS-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-GUARDRAILS-CRITICAL-FLOWS-01.md`
- Spec: `docs/PRODUCT/SHIPPING-AND-TAXES-MVP.md`

---

## 2026-01-25 — Pass ORDERS-500-HYDRATION-01: Fix Orders Endpoint 500 Error

**Status**: ✅ FIXED

**Incident**: `GET /api/v1/public/orders` returned HTTP 500 with HTML error page instead of JSON.

**Root Cause**: `vps-migrate.yml` workflow used wrong path `/var/www/dixis/backend` instead of `/var/www/dixis/current/backend`. Migrations from multi-producer checkout (PR #2456, #2476, #2477) never ran on production.

**Missing Tables/Columns**:
- `order_shipping_lines` table
- `checkout_sessions` table
- `orders.checkout_session_id` column
- `orders.is_child_order` column

**Fix**:
- PR #2482: Corrected path in `vps-migrate.yml`
- Ran `vps-migrate` workflow with `migrate` action

**Evidence**:
- Before: 3 migrations PENDING
- After: All migrations RAN (batch 7)
- `curl https://dixis.gr/api/v1/public/orders` → HTTP 200 + valid JSON

**Docs**:
- Tasks: `docs/AGENT/TASKS/Pass-ORDERS-500-HYDRATION-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-ORDERS-500-HYDRATION-01.md`

---

## 2026-01-25 — Pass PROD-DEPLOY-VERIFY-01: Production Deploy + Verification

**Status**: ✅ VERIFIED

Deployed PR #2479 (multi-producer checkout) to production and verified with E2E tests.

**Evidence**:
- Deploy workflow `21339083020` SUCCESS (3m42s)
- `https://dixis.gr/api/healthz` → status: ok, database: connected
- E2E tests: 3/3 PASS (17.2s)
  - MPC1: Multi-producer checkout form accessible
  - MPC2: Single-producer checkout works
  - MPC3: Multi-producer COD checkout completes

**Docs**:
- Plan: `docs/AGENT/PLANS/Pass-PROD-DEPLOY-VERIFY-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-PROD-DEPLOY-VERIFY-01.md`

---

## 2026-01-25 — Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: Enable Multi-Producer Checkout

**Status**: ✅ COMPLETE

Enabled multi-producer checkout by removing HOTFIX blocks. Backend CheckoutService handles order splitting with per-producer shipping.

**Changes**:
- REMOVED: Frontend HOTFIX blocks in `checkout/page.tsx` (render-time + submit-time)
- ADDED: Per-producer shipping breakdown display in `thank-you/page.tsx`
- REPLACED: `multi-producer-checkout-blocked.spec.ts` → `multi-producer-checkout.spec.ts`

**Behavior**:
- Multi-producer carts → CheckoutSession + N child Orders (one per producer)
- Single-producer carts → Single Order (backward compatible)
- Email timing: COD at creation, CARD after payment confirmation
- Shipping: €3.50 per producer, free if subtotal >= €35

**Tests**: 34 backend tests (157 assertions) + 3 E2E tests

**Evidence**:
- Plan: `docs/AGENT/PLANS/Pass-MP-SHIPPING-BREAKDOWN-TRUTH-01.md`
- Tasks: `docs/AGENT/TASKS/Pass-MP-SHIPPING-BREAKDOWN-TRUTH-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-MP-SHIPPING-BREAKDOWN-TRUTH-01.md`

---

## 2026-01-25 — Pass CI-SMOKE-E2E-STABILIZE-01: E2E Test Stabilization

**Status**: ✅ COMPLETE

Fixed failing CI smoke/E2E tests to make required checks green.

**Changes**:
- FIXED: `notifications.spec.ts` - accept mock auth state in CI
- FIXED: `i18n-checkout-orders.spec.ts` - dynamic cookie domain from baseURL
- FIXED: `smoke.spec.ts` - accept `timestamp` or `ts` field in healthz
- REMOVED: `pass-56-single-producer-cart.spec.ts` - obsolete (cart conflict modal removed in PR #2444)
- FIXED: `card-payment-real-auth.spec.ts` - removed @smoke tag (requires real credentials)

**Results**: 89 passed, 6 skipped, 0 failed (38s)

**Evidence**:
- Plan: `docs/AGENT/PLANS/Pass-CI-SMOKE-E2E-STABILIZE-01.md`
- Tasks: `docs/AGENT/TASKS/Pass-CI-SMOKE-E2E-STABILIZE-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-CI-SMOKE-E2E-STABILIZE-01.md`

---

## 2026-01-25 — Pass MP-PAYMENT-EMAIL-TRUTH-01: Payment Email Timing

**Status**: ✅ COMPLETE

Ensures emails only sent after successful payment confirmation for CARD payments.

**Changes**:
- MODIFIED: `StripeWebhookController` handles multi-producer CheckoutSessions
- MODIFIED: `PaymentController` sends emails for all sibling orders
- NEW: `MultiProducerPaymentEmailTest` with 8 tests

**Email Rules**:
- COD: Email at creation (immediate)
- CARD single: Email after payment confirmation
- CARD multi-producer: Email for all sibling orders after confirmation

**Tests**: 8 passed (24 assertions) + all 23 multi-producer tests pass

**Evidence**:
- Tasks: `docs/AGENT/TASKS/Pass-MP-PAYMENT-EMAIL-TRUTH-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-MP-PAYMENT-EMAIL-TRUTH-01.md`

---

## 2026-01-25 — Pass MP-ORDERS-SPLIT-01: Order Splitting (Phase 2)

**Status**: ✅ COMPLETE

Phase 2 of multi-producer order splitting: Backend order splitting implementation.

**Changes**:
- NEW: `CheckoutService` handles order splitting logic
- NEW: `CheckoutSessionResource` for API response
- MODIFIED: `OrderController` uses CheckoutService
- MODIFIED: `OrderResource` includes checkout_session_id, is_child_order

**Behavior**:
- Multi-producer carts → CheckoutSession + N child Orders
- Single-producer carts → Order (backward compatible)

**Tests**: 23 passed (118 assertions)
- MultiProducerOrderSplitTest: 7 tests
- MultiProducerOrderTest: 5 tests (updated)
- CheckoutSessionTest: 11 tests

**Evidence**:
- Tasks: `docs/AGENT/TASKS/Pass-MP-ORDERS-SPLIT-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-MP-ORDERS-SPLIT-01.md`

---

## 2026-01-25 — Pass MP-ORDERS-SCHEMA-01: Schema + Model (Phase 1)

**Status**: ✅ COMPLETE

Phase 1 of multi-producer order splitting: Database schema and models.

**Changes**:
- NEW table: `checkout_sessions` (parent entity for multi-producer checkout)
- NEW columns on `orders`: `checkout_session_id` FK, `is_child_order` boolean
- NEW model: `CheckoutSession` with relations and helpers
- MODIFIED: `Order` model with `checkoutSession()` relation

**Tests**: 11 passed (35 assertions)

**Evidence**:
- Tasks: `docs/AGENT/TASKS/Pass-MP-ORDERS-SCHEMA-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-MP-ORDERS-SCHEMA-01.md`

---

## 2026-01-25 — Pass MP-ORDERS-SHIPPING-V1-PLAN-01: Multi-Producer Order Plan

**Status**: ✅ COMPLETE (plan-only)

Comprehensive plan for multi-producer order splitting with per-producer shipping.

**Key Decisions**:
- Parent-child architecture: `checkout_sessions` → N child `orders`
- Single PaymentIntent for total amount (better UX)
- Email timing: COD at creation, CARD after webhook
- 5-phase implementation (~500 LOC total)
- Feature flag for gradual rollout

**Files**:
- Plan: `docs/AGENT/PLANS/Pass-MP-ORDERS-SHIPPING-V1-PLAN-01.md`
- Tasks: `docs/AGENT/TASKS/Pass-MP-ORDERS-SHIPPING-V1-PLAN-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-MP-ORDERS-SHIPPING-V1-PLAN-01.md`

---

## 2026-01-25 — Pass MP-PAY-EMAIL-TRUTH-01: Production Truth Verification

**Status**: ✅ VERIFIED — NO BUG ON PRODUCTION

Verified with observable evidence: multi-producer checkout IS blocked on dixis.gr.

**Test Method**: Playwright E2E against production
- Created cart with 2 items from 2 different producers
- Navigated to checkout
- Observed blocking message, no checkout form

**Evidence**:
- Screenshot: Greek blocking message "Πολλαπλοί Παραγωγοί στο Καλάθι" displayed
- API calls: NO order creation attempted
- JS bundle: Submit-time block present (`Δεν υποστηρίζεται ακόμη...`)

**Conclusion**: User's reported bug was from BEFORE PR #2465 deployment. Current production is protected by render-time AND submit-time blocks.

**Evidence**: Summary: `Pass-MP-PAY-EMAIL-TRUTH-01.md`

---

## 2026-01-24 — Pass MP-PROD-VERIFY-04: Production Deployment Verification

**Status**: ✅ DEPLOYED — VERIFIED

Verified PR #2465 fix is deployed to production dixis.gr.

**Evidence A (Playwright)**: 5/5 tests pass against production
- MPBLOCK1: No React #418 errors ✅
- MPBLOCK2: Checkout page functional ✅
- MPBLOCK3: API health 200 ✅
- MPBLOCK4: Products browsable ✅
- MPBLOCK5: No critical console errors ✅

**Evidence B (Server-side)**: Multi-producer block message found in production JS bundle:
- Chunk: `page-16e65b3f54f2e40d.js`
- Message: `Δεν υποστηρίζεται ακόμη η ολοκλήρωση αγοράς...` ✅

**Evidence**: Summary: `Pass-MP-PROD-VERIFY-04.md`

---

## 2026-01-24 — Pass MP-CHECKOUT-PROD-TRUTH-03: HOTFIX Bypass Critical Fix

**Status**: ✅ PASS — MERGED (PR #2465)

**CRITICAL FIX**: HOTFIX blocking multi-producer checkout was being bypassed.

**Root Cause**:
- Render-time check `if (multiProducer && !stripeClientSecret)` was ineffective
- Order was created in `handleSubmit()` BEFORE `stripeClientSecret` was set
- After payment init, HOTFIX check was bypassed → multi-producer orders got through

**Fix**:
- Added multi-producer check at START of `handleSubmit()`
- Blocks BEFORE `apiClient.createOrder()` is called
- Prevents order creation for multi-producer carts

**Evidence**: Summary: `Pass-MP-CHECKOUT-PROD-TRUTH-03.md`

---

## 2026-01-24 — Pass MP-MULTI-PRODUCER-CHECKOUT-02: Multi-Producer Shipping Display

**Status**: ✅ PASS — MERGED (PR #2463)

Frontend displays correct multi-producer shipping total from API.

**Problem**: Thank-you page used `shipping_amount` which doesn't reflect multi-producer breakdown. API provides `shipping_total` = sum of per-producer shipping.

**Changes**:
- api.ts: Added `ShippingLine` interface, `shipping_total`, `shipping_lines`, `is_multi_producer` to Order type
- thank-you/page.tsx: Prefers `shipping_total` when available, shows "Μεταφορικά (σύνολο):" for multi-producer
- 3 new backend tests for shipping total correctness

**Evidence**: Summary: `Pass-MP-MULTI-PRODUCER-CHECKOUT-02.md`

---

## 2026-01-24 — Pass MP-CHECKOUT-PAYMENT-01: Payment Success Toast Timing

**Status**: ✅ PASS — MERGED (PR #2460)

Fix premature success feedback in Stripe payment flow.

**Problem**: StripePaymentForm showed success toast BEFORE backend confirmed payment. If backend failed, user already saw success - misleading UX.

**Changes**:
- StripePaymentForm: Remove premature success toast
- checkout/page: Add success toast AFTER backend `confirmPayment` succeeds
- 3 new email trigger rule tests (COD vs Card behavior)

**Verified**:
- Email rules already correct: COD at creation, Card after confirmation
- API returns correct shipping_amount for display
- Backend handles 400 errors correctly

**Evidence**: Plan: `Pass-MP-CHECKOUT-PAYMENT-01.md`

---

## 2026-01-24 — Pass MP-ORDERS-SHIPPING-V1-02: Backend Multi-Producer Shipping

**Status**: ✅ PASS — MERGED (PR #2458) + Routing Regression (PR #2459)

Phase 2 of enabling multi-producer checkout: Backend calculates per-producer shipping.

**Changes**:
- OrderController: Calculate per-producer shipping (€3.50 flat, free >= €35)
- OrderController: Create OrderShippingLine records per producer
- OrderResource: Add shipping_lines[], shipping_total, is_multi_producer
- Feature tests: 5 tests + 1 routing regression test

**Routing Verified**:
- Frontend checkout uses `apiClient.createOrder()` → `POST /api/v1/public/orders`
- Routes to `Api\V1\OrderController@store` (correct controller with shipping lines)
- Regression test: `OrderRoutingRegressionTest.php`

**Evidence**: Summary: `Pass-MP-ORDERS-SHIPPING-V1-02.md`

---

## 2026-01-24 — Pass MP-ORDERS-SHIPPING-V1-01: Schema for Per-Producer Shipping

**Status**: ✅ PASS — MERGED (PR #2456)

Phase 1 of enabling multi-producer checkout: Create `order_shipping_lines` table.

**Changes**:
- New table: `order_shipping_lines` (per-producer shipping breakdown)
- New model: `OrderShippingLine`
- New relation: `Order->shippingLines()`
- Unit tests: 4 tests, all pass

**Evidence**: Summary: `Pass-MP-ORDERS-SHIPPING-V1-01.md`

---

## 2026-01-24 — Pass HOTFIX-MP-CHECKOUT-GUARD-01: Block Multi-Producer Checkout

**Status**: ✅ PASS — MERGED (PR #2448, #2449) — **PROD VERIFIED**

HOTFIX to prevent broken multi-producer checkout until order splitting is implemented.

**Problem**: Multi-producer carts enabled (PR #2444) but checkout broken:
- Emails sent before payment selection
- 400 errors on payment API
- React #418 errors

**Fix**:
- Frontend: Block checkout with Greek message when ≥2 producers
- Backend: Server guard returns 422 `MULTI_PRODUCER_NOT_SUPPORTED_YET`
- Email: Only send for COD at creation, for CARD after payment confirmation

**Follow-up PR #2449**: Fixed `producerId` not being passed to cart from product detail page.

**Production Proof** (2026-01-24):
- ✅ MPBLOCK1: Multi-producer cart blocked with Greek message
- ✅ MPBLOCK2: No API calls made for blocked checkout
- ✅ MPBLOCK3: Single-producer checkout still works
- ✅ Deployed: Frontend `70dbe384`, Backend `bc65e630`

**Evidence**: Summary: `Pass-HOTFIX-MP-CHECKOUT-GUARD-01.md`

---

## 2026-01-24 — Pass SHIP-MULTI-PRODUCER-E2E-01: E2E Test Robustness

**Status**: ✅ PASS — MERGED (PR #2445)

Follow-up to SHIP-MULTI-PRODUCER-ENABLE-01. Fixed E2E tests for production compatibility.

**Changes**:
- API endpoint: Try `/api/v1/public/products` first (production), fallback to local
- Locators: Multiple fallback selectors for add-to-cart buttons
- Production proof: 3/3 tests pass on dixis.gr

**Evidence**: Summary: `Pass-SHIP-MULTI-PRODUCER-E2E-01.md`

---

## 2026-01-24 — Pass SHIP-MULTI-PRODUCER-ENABLE-01: Enable Multi-Producer Carts

**Status**: ✅ PASS — MERGED (PR #2444)

Removed all guards blocking multi-producer carts. Customers can now add products from different producers to the same cart.

**Changes**:
- Removed client guard in `cart.ts` (conflict check removed)
- Removed server guard in `OrderController.php` (422 abort removed)
- Simplified both `AddToCartButton` components (no modal)
- Added 3 E2E tests for multi-producer flow

**Evidence**: Summary: `Pass-SHIP-MULTI-PRODUCER-ENABLE-01.md`

---

## 2026-01-24 — Pass SHIP-MULTI-PRODUCER-PLAN-01: Multi-Producer & Shipping Planning

**Status**: ✅ PASS — PR Pending

Planning pass for multi-producer checkout and realistic shipping calculation. Defined 4 implementation phases.

**Key Decisions**:
- Multi-producer: Remove ~20 LOC guards, group cart by producer
- Shipping: Per-producer calculation, per-order free threshold (€35)
- Neon: Pause preview branches, staging auto-suspend, connection pooling

**Deliverables**: PLAN, TASKS, SUMMARY docs

**Evidence**: Summary: `Pass-SHIP-MULTI-PRODUCER-PLAN-01.md`

---

_For older passes, see: `docs/OPS/STATE-ARCHIVE/`_
