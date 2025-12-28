# Pass 46 - E2E Auth Setup

**Date**: 2025-12-28
**Status**: IN_PROGRESS
**PRs**: #1919

## Problem Statement

E2E tests in CI were skipping auth-dependent tests because:
1. `global-setup.ts` bailed out in CI ("⏭️ CI detected: Skipping global API auth")
2. No storageState was created for authenticated tests
3. Tests using `SKIP_AUTH_TESTS = process.env.CI === 'true'` never ran in CI

## Root Cause Analysis

| Issue | Root Cause |
|-------|------------|
| No storageState in CI | `global-setup.ts` lines 33-41 skip auth when CI=true |
| Auth-dependent tests skip | Tests check `process.env.CI` and skip themselves |
| CI uses mock backend | `npm run test:api` provides mock responses, not real Laravel |

## Solution (PR #1919)

### New: `ci-global-setup.ts`
Created CI-specific globalSetup that:
- Sets localStorage auth tokens (auth_token, user_role, user_id)
- Works with test API server (no real Laravel needed)
- Creates storageState for authenticated test projects
- Falls back to minimal storageState if browser fails

### Updated: `playwright.config.ts`
```typescript
// Pass 46: Use CI globalSetup when external server OR CI mode
const useCIAuth = useExternal || isCI;

globalSetup: useCIAuth
  ? './tests/e2e/setup/ci-global-setup.ts'
  : './tests/e2e/setup/global-setup.ts',
```

### Unskipped Tests (4)
1. `orders-data-completeness.spec.ts`: "orders list shows real data not placeholders"
2. `orders-data-completeness.spec.ts`: "order details shows line items"
3. `orders-data-completeness.spec.ts`: "checkout creates order with complete data"
4. `checkout-to-orders-list.spec.ts`: "verifies orders list calls Laravel API endpoint"

## Files Changed

| File | Changes |
|------|---------|
| `frontend/tests/e2e/setup/ci-global-setup.ts` | +100 lines (new) |
| `frontend/playwright.config.ts` | +10/-3 lines |
| `frontend/tests/e2e/orders-data-completeness.spec.ts` | +3/-3 lines |
| `frontend/tests/e2e/checkout-to-orders-list.spec.ts` | +30/-20 lines |

## Evidence

### CI Results (PR #1919)
- `e2e`: PASS (1m 5s)
- `E2E (PostgreSQL)`: PASS (3m 8s)
- `typecheck`: PASS (35s)
- `smoke`: PASS (1m 23s)

### StorageState Creation
```
🔐 Pass 46: CI Global Setup - Creating mock auth state
   Base URL: http://127.0.0.1:3000
✅ CI storageState saved successfully
   Origins: 1
   Cookies: 1
```

## DoD Checklist

- [x] Root cause identified
- [x] ci-global-setup.ts creates valid storageState in CI
- [x] playwright.config.ts uses correct globalSetup per environment
- [x] 4 tests unskipped (>= 3 required)
- [x] Type-check passes
- [x] E2E job passes in CI
- [ ] PR merged
- [ ] Docs updated (this file)

---
Generated-by: Claude (Pass 46)
