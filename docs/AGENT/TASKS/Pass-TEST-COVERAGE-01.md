# Pass TEST-COVERAGE-01

**When**: 2026-01-15

## What

Expand `@smoke` test coverage by adding 4 new CI-safe page load tests.

## Why

More smoke tests = faster detection of broken pages in CI. All new tests target public, read-only pages that require no auth or data setup.

## How

Added 4 tests to `frontend/tests/e2e/smoke.spec.ts`:
1. `@smoke producers page loads` - Producer listing page
2. `@smoke contact page loads` - Contact page
3. `@smoke terms page loads` - Legal terms page
4. `@smoke privacy page loads` - Legal privacy page

All tests are CI-safe:
- No auth required
- No SSR data dependency
- Accept 200/304 status codes
- Verify body is visible

## Verification

| Test | Expected |
|------|----------|
| `@smoke producers page loads` | 200/304, body visible |
| `@smoke contact page loads` | 200/304, body visible |
| `@smoke terms page loads` | 200/304, body visible |
| `@smoke privacy page loads` | 200/304, body visible |

## Definition of Done

- [x] 4 new `@smoke` tests added to smoke.spec.ts
- [ ] CI E2E PostgreSQL job discovers and runs all @smoke tests
- [ ] All @smoke tests PASS
- [ ] quality-gates PASS

## PRs

| PR | Title | Status |
|----|-------|--------|
| TBD | test: add 4 @smoke page load tests (TEST-COVERAGE-01) | PENDING |
