# Plan: Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01

**Date**: 2026-01-23
**Author**: Agent
**Status**: COMPLETE — PR Pending

---

## Goal

Close the "I've never seen producer/admin dashboard" complaint with automated E2E proof that:
1. Producer can navigate from home → user menu → `/producer/dashboard` and see content
2. Admin can navigate from home → user menu → `/admin` and see content

---

## Scope

| Allowed | Not Allowed |
|---------|-------------|
| ✅ New E2E smoke tests | ❌ Business logic changes |
| ✅ Docs updates | ❌ Pricing/orders/shipping changes |
| ✅ Minimal testids if needed | ❌ Permission model changes |

---

## Entry Points (Verified)

| Role | Menu Element | TestID | Target URL |
|------|--------------|--------|------------|
| Producer | User dropdown → "Πίνακας Ελέγχου" | `user-menu-dashboard` | `/producer/dashboard` |
| Admin | User dropdown → "Διαχείριση" | `user-menu-admin` | `/admin` |

---

## Acceptance Criteria

| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | Producer can navigate home → dropdown → `/producer/dashboard` | E2E test |
| AC2 | Producer dashboard content loads (testid visible) | E2E test |
| AC3 | Admin can navigate home → dropdown → `/admin` | E2E test |
| AC4 | Admin panel content loads (heading visible) | E2E test |
| AC5 | Negative: Dashboard links NOT visible for wrong roles | E2E test |
| AC6 | All tests pass in CI | CI green |

---

## Non-Goals

- Mobile navigation (existing tests cover this)
- Deep dashboard functionality testing
- API-level permission verification

---

## Risks

| Risk | Mitigation |
|------|------------|
| Flaky navigation waits | Use stable testids, reasonable timeouts |
| Mock auth not recognized | Use existing e2e_mode pattern |

---

## Deliverables

1. `frontend/tests/e2e/dashboard-visibility-smoke.spec.ts` — 4 tests
2. `docs/AGENT/PLANS/Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md` — This file
3. `docs/AGENT/TASKS/Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md`
4. `docs/AGENT/SUMMARY/Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01.md`
5. `docs/OPS/STATE.md` — Updated
6. PR with `ai-pass` label

---

_Pass-UX-DASHBOARD-VISIBILITY-SMOKE-01 | 2026-01-23_
