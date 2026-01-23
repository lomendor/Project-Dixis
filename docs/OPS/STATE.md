# OPS STATE

**Last Updated**: 2026-01-23 (Header UX Polish)

> **Archive Policy**: Keep last ~10 passes (~2 days). Older entries auto-archived to `STATE-ARCHIVE/`.
> **Current size**: ~600 lines (target ≤250).

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
