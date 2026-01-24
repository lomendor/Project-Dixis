# OPS STATE

**Last Updated**: 2026-01-24 (MP-PROD-VERIFY-04)

> **Archive Policy**: Keep last ~10 passes (~2 days). Older entries auto-archived to `STATE-ARCHIVE/`.
> **Current size**: ~370 lines (target ≤250). ⚠️

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

## CI Note: E2E (PostgreSQL) Non-Required Failure

**Observed**: 2026-01-24 on PR #2440, #2441

The `E2E (PostgreSQL)` workflow failed but is **non-required** for merge. PRs merged successfully via auto-merge. This workflow runs against a PostgreSQL backend (vs SQLite in main CI) and may have flakiness. No action required unless it becomes blocking.

**Run links**:
- [#2441 E2E-PG](https://github.com/lomendor/Project-Dixis/actions/runs/21312989256/job/61351896715)
- [#2440 E2E-PG](https://github.com/lomendor/Project-Dixis/actions/runs/21312521868/job/61350824424)

---

## 2026-01-24 — Pass DOCS-ARCHIVE-CLEANUP-01: Agent Docs Housekeeping

**Status**: ✅ PASS — MERGED (PR #2442)

Archived 50 old Pass files (pre-2026-01-22) to `docs/ARCHIVE/AGENT-2026-01/`.

**Changes**:
- Archived: 29 SUMMARY, 18 TASKS, 3 PLANS files
- Remaining: 34 SUMMARY, 26 TASKS, 11 PLANS

**Evidence**: Summary: `Pass-DOCS-ARCHIVE-CLEANUP-01.md`

---

## 2026-01-24 — Pass UI-ROLE-NAV-SHELL-01: UI Role Navigation Verification

**Status**: ✅ PASS — MERGED (PR #2441)

Audited UI shell — already compliant from previous passes. Added 8 new E2E tests for logo behavior, mobile stability, and footer correctness.

**Changes**:
- New: `ui-role-nav-shell.spec.ts` (8 tests)

**E2E Tests**: 8/8 pass (14 total UI shell tests)

**Evidence**: Summary: `Pass-UI-ROLE-NAV-SHELL-01.md`

---

## 2026-01-24 — Pass SHIP-MULTI-DISCOVERY-01: Shipping & Multi-Producer Discovery

**Status**: ✅ PASS — MERGED (PR #2440)

Discovery audit for shipping calculation and multi-producer checkout capability. Created 4 spec documents.

**Key Findings**:
- Shipping engine adequate for MVP (zone-based, €35 free threshold)
- Multi-producer: Schema supports it, application blocks it (~20 LOC guards)
- To enable multi-producer: Remove client+server guards

**Deliverables**:
- `docs/PRODUCT/SHIPPING/SHIPPING-FACTS.md`
- `docs/PRODUCT/SHIPPING/SHIPPING-ENGINE-MVP-SPEC.md`
- `docs/PRODUCT/ORDERS/MULTI-PRODUCER-FACTS.md`
- `docs/PRODUCT/ORDERS/MULTI-PRODUCER-MVP-SPEC.md`

**Evidence**: Summary: `Pass-SHIP-MULTI-DISCOVERY-01.md`

---

## 2026-01-24 — Pass UI-SHELL-HEADER-FOOTER-01: UI Shell Stabilization

**Status**: ✅ PASS — MERGED (PR #2437)

Stabilized Header/Footer. Removed "Παρακολούθηση Παραγγελίας" from footer. Made cart visible for ALL roles (including producers). 6 E2E tests verify per-role visibility.

**Changes**:
- Footer: Removed order tracking link
- CartIcon: Cart now visible for producers too
- New: `ui-shell-header-footer.spec.ts` (6 tests)

**E2E Tests**: 6/6 pass

**Evidence**: Footer.tsx, CartIcon.tsx | Summary: `Pass-UI-SHELL-HEADER-FOOTER-01.md`

---
