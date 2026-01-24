# TASK — Pass CI-FLAKE-LOCALE-01

## Goal

Stabilize flaky Playwright test `locale.spec.ts` (specifically the `locale cookie sets Greek when explicitly set` test) which fails in CI with `getByTestId('page-title')` not found / slow render.

## Scope

Tests / selectors / waits only. No business logic changes.

## Root Cause

The test navigated to `/auth/login` and immediately expected `page-title` to be visible. In CI, React hydration can be slower, causing the element to not be found within the timeout window.

## Fix Applied

1. Added `waitUntil: 'networkidle'` to page navigation for more stable page load
2. Wait for `login-form` (a stable indicator that hydration is complete) before checking `page-title`
3. Used `expect.poll()` to poll for the page title text instead of direct assertion
4. Removed `waitForTimeout(1500)` fixed sleep from third test, replaced with `networkidle` + element wait

## Deliverables

### Test Changes

- [x] Fixed `locale cookie sets Greek when explicitly set` test
  - Added `waitUntil: 'networkidle'` to navigation
  - Wait for `login-form` to be visible before checking title
  - Use `expect.poll()` for resilient text assertion
- [x] Fixed `locale cookie is respected when set` test
  - Replaced `waitForTimeout(1500)` with `networkidle` + element wait

### Documentation

- [x] Created `docs/AGENT/TASKS/Pass-CI-FLAKE-LOCALE-01.md`
- [x] Created `docs/AGENT/SUMMARY/Pass-CI-FLAKE-LOCALE-01.md`
- [ ] Updated STATE.md + NEXT-7D.md

## Files Changed

| File | Change |
|------|--------|
| `frontend/tests/e2e/locale.spec.ts` | Stabilized flaky tests |

## DoD

- [x] Test uses resilient locator strategy
- [x] No fixed sleeps
- [ ] PR created + CI green
- [ ] Merged

## Result

**PENDING** — Awaiting CI verification.
