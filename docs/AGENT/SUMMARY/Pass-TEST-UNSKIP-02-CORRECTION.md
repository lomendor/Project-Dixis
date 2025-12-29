# TEST-UNSKIP-02-CORRECTION — Safety Rollback

**Date**: 2025-12-29
**Status**: COMPLETE
**PR**: #1966

## TL;DR

Tests unskipped in TEST-UNSKIP-02 were NOT actually running in CI. Re-skipped all 6 tests.

## What Happened

1. TEST-UNSKIP-02 (PR #1964) unskipped 6 tests from `pdp-happy.spec.ts` and `products-ui.smoke.spec.ts`
2. CI showed "E2E PostgreSQL PASS (3m21s)"
3. **BUT**: Tests were never executed

## Root Cause

```yaml
# .github/workflows/e2e-postgres.yml:63
run: npx playwright test --grep @smoke ...
```

The workflow uses `--grep @smoke` which only runs tests tagged with `@smoke`. Neither `pdp-happy.spec.ts` nor `products-ui.smoke.spec.ts` have the `@smoke` tag.

## How We Detected It

Release Lead safety guard performed STATUS CHECK with sanity verification:
1. Checked `e2e-postgres.yml` → found `--grep @smoke`
2. Grep'd for `@smoke` in test files → only `smoke.spec.ts` has it
3. Concluded: PDP/products tests never ran

## Fix Applied

Re-skipped all 6 tests with clear comments explaining the issue:

```typescript
// RESKIPPED: Tests not running in CI (no @smoke tag, e2e-postgres uses --grep @smoke)
// Fix plan: Add @smoke tag OR run in separate workflow with seeded data
test.skip('should display complete product information', async ({ page }) => {
```

## Options for Proper Fix

| Option | Description | Effort |
|--------|-------------|--------|
| A. Add @smoke tag | Tag tests + ensure CI-local server has seeded product data | Medium |
| B. Separate workflow | Create `e2e-pdp.yml` that runs without `--grep` filter | Medium |
| C. Keep skipped | Document as BLOCKED on deterministic seeded data | None |

## Lessons Learned

1. Always verify tests actually RUN in CI, not just "CI passes"
2. Check workflow grep filters when adding new tests
3. Safety guards (sanity checks) are critical for catching false positives

---
Generated-by: Claude (TEST-UNSKIP-02-CORRECTION)
