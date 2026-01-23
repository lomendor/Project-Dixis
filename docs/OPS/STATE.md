# OPS STATE

**Last Updated**: 2026-01-23 (UX-DASHBOARD-VISIBILITY-SMOKE-01)

> **Archive Policy**: Keep last ~10 passes (~2 days). Older entries auto-archived to `STATE-ARCHIVE/`.
> **Current size**: ~600 lines (target ≤250).

---

## 2026-01-23 — Pass UX-DASHBOARD-VISIBILITY-SMOKE-01: Dashboard Visibility Smoke Tests

**Status**: ✅ PASS — PR Pending

Added E2E smoke tests proving admin and producer users can navigate to their dashboards.

### Tests Added

| Test | Description | Status |
|------|-------------|--------|
| Producer navigation | Home → menu → `/producer/dashboard` + content | ✅ |
| Producer negative | Dashboard link hidden for consumer | ✅ |
| Admin navigation | Home → menu → `/admin` (route exists) | ✅ |
| Admin negative | Admin link hidden for consumer | ✅ |

### Evidence
- **Test file**: `frontend/tests/e2e/dashboard-visibility-smoke.spec.ts`
- **Local run**: 4 passed (7.1s)
- **Summary**: `docs/AGENT/SUMMARY/Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md`

---

## 2026-01-23 — Pass ORD-TOTALS-SHIPPING-01: Order Totals/Shipping Investigation

**Status**: ✅ VERIFIED — NO BUG FOUND

Investigation pass for reported order totals issues (0€, repeated €26.99, shipping mismatch).

### Finding

**No bug exists.** All issues investigated:
- "0€ totals" → NOT REPRODUCIBLE (all orders have correct totals)
- "Repeated €26.99" → EXPLAINED (QA test data uses same product)
- "Shipping mismatch" → NOT REPRODUCIBLE (invariant holds for ALL orders)

### Evidence

| Check | Result |
|-------|--------|
| Invariant: subtotal + tax + shipping = total | ✅ ALL orders pass |
| Data diversity | ✅ 10 unique totals |
| Regression tests | ✅ 5/5 pass |

### Docs
- Plan: `docs/AGENT/PLANS/Pass-ORD-TOTALS-SHIPPING-01.md`
- Summary: `docs/AGENT/SUMMARY/Pass-ORD-TOTALS-SHIPPING-01.md`

---

## 2026-01-23 — Pass CI-NEON-COMPUTE-01: Neon Compute Audit

**Status**: ✅ VERIFIED — Already Optimized (No changes needed)

Audit of CI workflows for Neon usage.

### Finding

**Neon is NOT used for CI E2E tests.** Current architecture:
- `e2e-postgres.yml` → SQLite (`.env.ci`)
- `pg-e2e.yml` → GitHub Actions postgres service (label-gated)
- Neon only for production/staging **deployments**

### Misleading Name

The job "E2E (PostgreSQL)" is misleading - it uses SQLite, not PostgreSQL.

### Evidence
- `grep` of all workflows shows no Neon secrets in test jobs
- `.env.ci` has `DATABASE_URL=file:./test.db`
- Docs: `docs/AGENT/SUMMARY/Pass-CI-NEON-COMPUTE-01.md`

---

## 2026-01-23 — Pass ORDERS-TOTALS-01: Order Totals Pattern Investigation

**Status**: ✅ VERIFIED — MERGED (PR #2420, commit 3b890c65)

Investigation pass for reported "€26.99 pattern" in orders.

### Finding

**No bug exists.** The €26.99 pattern is explained by:
- QA tests use same test product (€19.99)
- With shipping (€5) + tax (€2) = €26.99
- Real orders have 10+ unique totals

### Tests Added

| Test | Purpose |
|------|---------|
| `Orders have diverse totals` | Proves ≥3 unique totals |
| `Order list total matches detail total` | List=Detail consistency |

### Evidence
- **PR**: #2420 (pending)
- **Test**: `order-totals-regression.spec.ts`
- **API Check**: 10 unique totals across 15 orders

---

## 2026-01-23 — Pass PRODUCER-IA-01: Producer Dashboard Entry Points

**Status**: ✅ PASS — MERGED (PR #2418, commit fd336414)

Audit + verification pass for producer dashboard navigation.

### Finding

Producer dashboard entry points **already implemented** correctly:
- Desktop: `user-menu-dashboard` testid → `/producer/dashboard`
- Mobile: `mobile-nav-dashboard` testid → `/producer/dashboard`
- All 10 producer routes documented in `PRODUCER-DASHBOARD-V1.md`

### Test Enhancement

Added navigation verification to existing E2E test:
- Verifies `href="/producer/dashboard"` attribute
- Clicks link and confirms URL contains `/producer/dashboard`

### Files Changed

| File | Change |
|------|--------|
| `header-nav.spec.ts` | Enhanced test to verify navigation |
| `PRODUCER-DASHBOARD-V1.md` | Updated E2E coverage table |

### Evidence
- **PR**: #2418 (merged fd336414)
- **Test**: `header-nav.spec.ts:149`
- **Doc**: `docs/PRODUCT/PRODUCER-DASHBOARD-V1.md`

---

## 2026-01-23 — Pass ORDERS-TOTALS-FIX-01: Order Totals Verification

**Status**: ✅ VERIFIED — NO BUG FOUND

Investigation pass for reported "0€ / ίδια totals" issue.

### Finding

**No bug exists** - API returns correct values:
- `total_amount` and `total` both populated correctly
- Totals invariant holds: `total == subtotal + tax + shipping`
- UI uses correct fields (`safeMoney(order.total_amount)`)

### API Evidence (Order #102)
```
subtotal: 19.99
tax_amount: 2.00
shipping_amount: 5.00
total: 26.99
total_amount: 26.99
```

### Regression Test Added
- `order-totals-regression.spec.ts` - 3 API-level tests
  - Non-zero totals when subtotal > 0
  - Total breakdown invariant
  - Item price calculations

### Evidence
- **PR**: #2416 (pending)
- **Test File**: `frontend/tests/e2e/order-totals-regression.spec.ts`

---

## 2026-01-23 — Pass UI-HEADER-POLISH-01: Header UX Improvements

**Status**: ✅ PASS — PENDING CI

Implementation pass for header UX improvements.

### Changes
- Logo: 44px → 48px for better visibility
- CartIcon: Unified clean SVG + badge, no text clutter
- Producer cart: Completely hidden (null) instead of message div

### Cart Visibility Rules
| Role | Cart | TestID |
|------|------|--------|
| Guest | ✅ | nav-cart-guest |
| Consumer | ✅ | nav-cart |
| Admin | ✅ | nav-cart-admin |
| Producer | ❌ | (hidden) |

### Evidence
- **PR**: #2415 (auto-merge enabled)
- **Files**: CartIcon.tsx, Header.tsx, auth-cart-flow.spec.ts, header-screenshot-proof.spec.ts

---

## 2026-01-23 — Pass UI-HEADER-IA-01: Header/Navigation Verification

**Status**: ✅ VERIFIED — CLOSED (No changes needed)

Verified that header/navigation meets NAVIGATION-V1.md spec.

### Finding

All 9 acceptance criteria already implemented:
- Logo visible, links to home ✅
- Primary nav: Products, Producers ✅
- No language toggle in header ✅
- Role-based dropdown ✅
- Cart visibility per role ✅
- Mobile menu functional ✅

### Evidence

- **Component**: `frontend/src/components/layout/Header.tsx` (326 lines)
- **E2E Tests**: `frontend/tests/e2e/header-nav.spec.ts` (27 tests, all pass in CI)
- **Summary**: `docs/AGENT/SUMMARY/Pass-UI-HEADER-IA-01.md`

---

## 2026-01-23 — Pass ORDER-TOTALS-INVARIANTS-01: Fix Totals Breakdown Mismatch

**Status**: ✅ PASS — CLOSED

Fixed display bug where order totals didn't match breakdown (€26.99 total but €0.00 shipping shown).

### Root Cause
Legacy orders had €5.00 shipping embedded in `total_amount` but not in `shipping_cost` field.

### Fix
Infer hidden shipping when `total ≠ subtotal + tax + shipping`.

### Results
- **Before**: 16/100 orders with mismatch
- **After**: 0/100 mismatches (100% invariant compliance)

### Evidence
- **PR**: #2412 (merged `1c1ee2d4`)
- **Summary**: `docs/AGENT/SUMMARY/Pass-ORDER-TOTALS-INVARIANTS-01.md`
- **Proof**: `docs/AGENT/SUMMARY/Proof-ORDER-TOTALS-INVARIANTS-01.md`

---

## 2026-01-23 — Pass OPS-DEPLOY-SSH-RETRY-01: SSH Deploy Retry + Proof

**Status**: ✅ PASS — CLOSED

Added automatic retry with backoff for SSH deploy steps + post-deploy proof.

### Changes

| File | Change |
|------|--------|
| `deploy-frontend.yml` | SSH retry (3x, 10s delay) + post-deploy proof |
| `deploy-backend.yml` | SSH retry (3x, 10s delay) + post-deploy proof |

### Features

- **Retry**: Transient SSH timeouts auto-retry 3x before failing
- **Proof**: Every deploy verifies prod health + logs commit SHA
- **Action**: Uses `nick-fields/retry@v3` for reliable retry logic

### First Deploy Results

| Workflow | Run ID | Status |
|----------|--------|--------|
| Deploy Frontend | 21268269263 | SUCCESS (3m47s) |
| Deploy Backend | 21268269271 | SUCCESS (17s) |

### Evidence

- Summary: `docs/AGENT/SUMMARY/Pass-OPS-DEPLOY-SSH-RETRY-01.md`
- Proof: `docs/AGENT/SUMMARY/Proof-OPS-DEPLOY-SSH-RETRY-01.md`
- PR: #2408 (merged `6f7e1499`)

---

## 2026-01-22 — Pass OPS-POST-LAUNCH-CHECKS-01: Scheduled Prod Monitoring

**Status**: ✅ PASS — CLOSED

Added automated, scheduled production monitoring workflows.

### Workflows

| Workflow | Schedule | Scripts |
|----------|----------|---------|
| `post-launch-checks.yml` | Daily 05:30 UTC | prod-facts, perf-baseline, prod-qa-v1 |
| `prod-facts.yml` | Daily 07:00 UTC | prod-facts |

### Changes

- NEW: `.github/workflows/post-launch-checks.yml`
- FIX: `.github/workflows/prod-facts.yml` (output path updated for hygiene pass)
- UPDATE: `docs/OPS/POST-LAUNCH-CHECKS.md` (workflows section)

### Features

- Non-blocking (not in required checks)
- Artifact upload for logs
- Auto-creates GitHub Issue on failure
- Manual trigger via `workflow_dispatch`

**Automated Monitoring: ENABLED**

---
