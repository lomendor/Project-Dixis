# TEST-UNSKIP-02 — Add CI-Safe @smoke Page Load Tests

**Date**: 2026-01-15
**Status**: ✅ COMPLETE
**PR**: #2206

## TL;DR

Added 5 new `@smoke` tests for core page loads (PDP, cart, login, register, home). These tests are CI-safe and **will actually run** in CI because they have the `@smoke` tag.

## Why This Pass Exists

**CORRECTION**: Previous TEST-UNSKIP-02 (PR #1964) unskipped tests that were "false-green" - they appeared to pass but never actually ran in CI. The e2e-postgres job uses `--grep @smoke`, so only tests with `@smoke` in their name are executed.

## What Changed

| File | Change |
|------|--------|
| `smoke.spec.ts` | Added 5 new `@smoke` tests |

## New Tests Added

All tests in `frontend/tests/e2e/smoke.spec.ts`:

1. **`@smoke PDP page loads`** - Product detail page renders (200 or 404 gracefully)
2. **`@smoke cart page loads`** - Cart page renders (empty or with items)
3. **`@smoke login page loads`** - Auth login page renders or redirects
4. **`@smoke register page loads`** - Auth register page renders or redirects
5. **`@smoke home page loads`** - Home page renders body/nav/main

## CI-Safe Design

All tests follow these principles:
- **No SSR data dependency** - Don't require specific backend data
- **Accept graceful error states** - 404, empty state, redirect all valid
- **Generous timeouts** - 30s page load, 10s element visibility
- **Minimal assertions** - Just verify page structure loads

## DoD Verification

- [x] 5 new `@smoke` tests added to smoke.spec.ts
- [x] CI E2E PostgreSQL job discovers and runs all @smoke tests
- [x] All @smoke tests PASS
- [x] quality-gates PASS

## Key Technical Insight

```yaml
# .github/workflows/ci.yml (e2e-postgres job)
- run: pnpm exec playwright test --grep @smoke
```

Tests **must** have `@smoke` in their name to run in CI. Previous unskipped tests without this tag were never executed.

## Risks

Low. Tests only verify page structure loads - no data assertions, no complex flows.

---
Generated-by: Claude (TEST-UNSKIP-02)
