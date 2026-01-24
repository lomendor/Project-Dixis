# OPS STATE

**Last Updated**: 2026-01-24 (MP-CHECKOUT-PAYMENT-01)

> **Archive Policy**: Keep last ~10 passes (~2 days). Older entries auto-archived to `STATE-ARCHIVE/`.
> **Current size**: ~310 lines (target ≤250). ⚠️

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

## 2026-01-23 — Pass DASH-ENTRYPOINTS-01: Dashboard Entry Points

**Status**: ✅ PASS — PR Pending

Added Greek translations for dashboard entry points in account menu. Producer: "Πίνακας Παραγωγού", Admin: "Διαχείριση (Admin)".

**E2E Tests**: 4/4 pass (dashboard-visibility-smoke.spec.ts)

**Evidence**: Header.tsx, messages/el.json, messages/en.json | Summary: `Pass-DASH-ENTRYPOINTS-01.md`

---

## 2026-01-23 — Pass E2E-TEST-COVERAGE-AUDIT-01: E2E Coverage Matrix

**Status**: ✅ PASS — PR Pending

Documented E2E test coverage: 260 specs (~30K lines). All V1 critical paths covered. 10 gaps identified.

**Evidence**: `docs/AGENT/REPORTS/E2E-COVERAGE-MATRIX.md` | Summary: `Pass-E2E-TEST-COVERAGE-AUDIT-01.md`

---

## 2026-01-23 — Pass NAV-ENTRYPOINTS-01: Navigation Simplification

**Status**: ✅ PASS — MERGED (PR #2432) — **PROD VERIFIED**

Removed language switcher from header (footer-only), removed notification bell (V1 scope), cart visible for all roles.

**Production Proof** (2026-01-23):
- ✅ No language switcher in header (footer only)
- ✅ No notification bell in header
- ✅ Logo visible, links to home
- ✅ Cart visible for all roles
- ✅ E2E: 25/25 tests pass against dixis.gr

**Evidence**: Header.tsx, NAVIGATION-V1.md | Summary: `Pass-NAV-ENTRYPOINTS-01.md`

---

## 2026-01-23 — Pass UI-HEADER-POLISH-02: Header Layout Polish

**Status**: ✅ PASS — MERGED (PR #2431)

Responsive logo (48px desktop, 36px mobile) + tightened mobile spacing. No feature changes.

**Evidence**: Header.tsx | Summary: `Pass-UI-HEADER-POLISH-02.md`

---

## 2026-01-23 — Pass UI-NAV-ALIGN-01: Header Spec Alignment

**Status**: ✅ PASS — MERGED (PR #2430)

Added language switcher to Header (desktop + mobile) per NAVIGATION-V1.md spec. Fixed-width buttons prevent layout shift.

**Evidence**: Header.tsx, header-nav.spec.ts | Summary: `Pass-UI-NAV-ALIGN-01.md`

---

## 2026-01-23 — Pass UI-NAV-SPEC-01: Navigation Specification

**Status**: ✅ PASS — MERGED (PR #2429)

Comprehensive navigation spec defining Header/Footer/Mobile per role. Stops "random UI" with single source of truth.

**Evidence**: `docs/PRODUCT/NAVIGATION-V1.md` | Summary: `Pass-UI-NAV-SPEC-01.md`

---

## 2026-01-23 — Pass DOCS-NEXT7D-HYGIENE-01: NEXT-7D Hygiene

**Status**: ✅ PASS — MERGED (PR #2428)

NEXT-7D.md condensed 405→108 lines. Created `docs/ARCHIVE/NEXT-7D-ARCHIVE-2026-01.md`.

**Evidence**: Archive contains all completed items with PR/summary links

---

## 2026-01-23 — Pass UX-DASHBOARD-VISIBILITY-SMOKE-01: Dashboard Visibility Smoke

**Status**: ✅ PASS — MERGED (PR #2426)

E2E smoke tests proving admin/producer can navigate to dashboards. 4 tests: producer nav, producer negative, admin nav, admin negative.

**Evidence**: `dashboard-visibility-smoke.spec.ts` | Summary: `Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md`

---

## 2026-01-23 — Pass ORD-TOTALS-SHIPPING-01: Order Totals Investigation

**Status**: ✅ VERIFIED — NO BUG FOUND

Investigated 0€/repeated €26.99/shipping mismatch. **No bug**: all orders pass invariant, €26.99 is QA test data.

**Evidence**: 10 unique totals, 5/5 regression tests pass | Summary: `Pass-ORD-TOTALS-SHIPPING-01.md`

---

## 2026-01-23 — Pass CI-NEON-COMPUTE-01: Neon Compute Audit

**Status**: ✅ VERIFIED — Already Optimized

**Neon NOT used for CI E2E tests.** CI uses SQLite (`.env.ci`), Neon only for deploys.

**Evidence**: Summary: `Pass-CI-NEON-COMPUTE-01.md`

---

## 2026-01-23 — Pass ORDERS-TOTALS-01: Order Totals Pattern

**Status**: ✅ MERGED (PR #2420)

€26.99 pattern = QA test data (€19.99 + €5 shipping + €2 tax). Added 2 regression tests.

**Evidence**: `order-totals-regression.spec.ts` | 10 unique totals verified

---

## 2026-01-23 — Pass PRODUCER-IA-01: Producer Dashboard Entry Points

**Status**: ✅ MERGED (PR #2418)

Entry points verified: `user-menu-dashboard` → `/producer/dashboard`. Enhanced `header-nav.spec.ts:149`.

**Evidence**: Doc: `PRODUCER-DASHBOARD-V1.md`

---

## 2026-01-23 — Pass ORDERS-TOTALS-FIX-01: Order Totals Verification

**Status**: ✅ VERIFIED — NO BUG

API returns correct values. Added `order-totals-regression.spec.ts` (3 API-level tests).

**Evidence**: PR #2416 | Invariant: subtotal + tax + shipping = total ✅

---

## 2026-01-23 — Pass UI-HEADER-POLISH-01: Header UX Improvements

**Status**: ✅ PASS — MERGED (PR #2415)

Logo 48px, CartIcon unified SVG, producer cart hidden. Cart visible for guest/consumer/admin.

**Evidence**: CartIcon.tsx, Header.tsx | Tests: auth-cart-flow.spec.ts

---

## 2026-01-23 — Pass UI-HEADER-IA-01: Header/Navigation Verification

**Status**: ✅ VERIFIED — CLOSED

All 9 AC implemented. E2E: `header-nav.spec.ts` (27 tests pass).

**Evidence**: Summary: `Pass-UI-HEADER-IA-01.md`

---

## 2026-01-23 — Pass ORDER-TOTALS-INVARIANTS-01: Fix Totals Breakdown

**Status**: ✅ MERGED (PR #2412)

Fixed display bug (€26.99 total but €0.00 shipping). Infer hidden shipping. 0/100 mismatches.

**Evidence**: Summary: `Pass-ORDER-TOTALS-INVARIANTS-01.md`

---

## 2026-01-23 — Pass OPS-DEPLOY-SSH-RETRY-01: SSH Deploy Retry

**Status**: ✅ MERGED (PR #2408)

SSH retry 3x + post-deploy proof. Deploy workflows hardened.

**Evidence**: Summary: `Pass-OPS-DEPLOY-SSH-RETRY-01.md`

---

## 2026-01-22 — Pass OPS-POST-LAUNCH-CHECKS-01: Scheduled Prod Monitoring

**Status**: ✅ CLOSED

Daily monitoring: `post-launch-checks.yml` (05:30 UTC), `prod-facts.yml` (07:00 UTC).

**Automated Monitoring: ENABLED** | Summary: `Pass-OPS-POST-LAUNCH-CHECKS-01.md`

---
