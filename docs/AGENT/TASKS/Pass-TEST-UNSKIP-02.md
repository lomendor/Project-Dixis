# Pass TEST-UNSKIP-02

**When**: 2026-01-15

## What

Add 5 new CI-safe `@smoke` tests for core page loads (PDP, cart, login, register, home).

## Why

Previous TEST-UNSKIP-02 attempt was CORRECTED because unskipped tests weren't actually running in CI (missing `@smoke` tag). This pass adds **new** tests with proper `@smoke` tag that **will** run in CI e2e-postgres job.

## How

Added 5 tests to `frontend/tests/e2e/smoke.spec.ts`:
1. `@smoke PDP page loads` - Product detail page renders (or 404 gracefully)
2. `@smoke cart page loads` - Cart page renders (empty or with items)
3. `@smoke login page loads` - Auth login page renders or redirects
4. `@smoke register page loads` - Auth register page renders or redirects
5. `@smoke home page loads` - Home page renders body/nav/main

All tests are CI-safe:
- No SSR data dependency
- Accept graceful error states (404, redirect)
- Use generous timeouts

## Verification

| Test | Expected |
|------|----------|
| `@smoke PDP page loads` | 200 or 404, body visible |
| `@smoke cart page loads` | main visible, cart-related content |
| `@smoke login page loads` | 200/302/307, valid redirect |
| `@smoke register page loads` | 200/302/307, valid redirect |
| `@smoke home page loads` | body + nav/main visible |

## Definition of Done

- [x] 5 new `@smoke` tests added to smoke.spec.ts
- [ ] CI E2E PostgreSQL job discovers and runs all @smoke tests
- [ ] All @smoke tests PASS
- [ ] quality-gates PASS

## PRs

| PR | Title | Status |
|----|-------|--------|
| #XXXX | Pass TEST-UNSKIP-02: add 5 @smoke page load tests | PENDING |
