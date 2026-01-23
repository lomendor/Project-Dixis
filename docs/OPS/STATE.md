# OPS STATE

**Last Updated**: 2026-01-23 (NAV-ENTRYPOINTS-01)

> **Archive Policy**: Keep last ~10 passes (~2 days). Older entries auto-archived to `STATE-ARCHIVE/`.
> **Current size**: ~140 lines (target ≤250). ✅

---

## 2026-01-23 — Pass NAV-ENTRYPOINTS-01: Navigation Simplification

**Status**: ✅ PASS — PR Pending

Removed language switcher from header (footer-only), removed notification bell (V1 scope), cart visible for all roles.

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
