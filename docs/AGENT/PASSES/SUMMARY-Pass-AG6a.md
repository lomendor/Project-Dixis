# Pass AG6a — Enable OTP_BYPASS in CI E2E

**Date**: 2025-10-15
**Status**: CI CONFIGURATION UPDATED ✅

## Objective

Enable ~11 auth-gated E2E tests by setting `OTP_BYPASS=1` in CI E2E workflows, increasing test coverage without code changes.

## Changes

### 1. Updated E2E Workflow ✅

**File**: `.github/workflows/e2e-full.yml`

**Changes to `e2e-sqlite` job** (lines 20-24):
```yaml
env:
  NEXT_TELEMETRY_DISABLED: '1'
  SKIP_ENV_VALIDATION: '1'
  DATABASE_URL: 'file:./.ci/ci.sqlite'
  OTP_BYPASS: '1'  # ← NEW: Enables auth-gated tests
```

**Changes to `e2e-postgres` job** (lines 88-91):
```yaml
env:
  NEXT_TELEMETRY_DISABLED: '1'
  SKIP_ENV_VALIDATION: '1'
  OTP_BYPASS: '1'  # ← NEW: Enables auth-gated tests
```

### 2. Tests Unlocked ✅

From Pass AG5b inventory, **11 auth-gated tests** will now run:

**Checkout** (4 tests):
- `frontend/tests/checkout/email-tracking.spec.ts:27` - Email tracking with OTP
- `frontend/tests/checkout/lowstock-email.spec.ts:29` - Low stock email notifications
- (2 additional conditional checks in same files)

**Security** (2 tests):
- `frontend/tests/security/cookie-security.spec.ts:9` - Cookie security with auth
- `frontend/tests/security/cookie-security.spec.ts:69` - Cookie security validation

**Storefront** (1 test):
- `frontend/tests/storefront/track.spec.ts:27` - Order tracking with OTP

**Admin** (4 tests):
- `frontend/tests/admin/tracking-link.spec.ts:27` - Admin tracking links
- `frontend/tests/admin/products-list.spec.ts:27` - Admin products list
- `frontend/tests/admin/auth.spec.ts:25` - Admin authentication flow
- `frontend/tests/admin/auth.spec.ts:32` - Admin auth validation

**Pattern**: All these tests use:
```typescript
test.skip(!bypass, 'OTP_BYPASS not configured');
```

With `OTP_BYPASS=1` set, `bypass` evaluates to `true`, so tests no longer skip.

## Technical Details

**Environment Variable**: `OTP_BYPASS=1`

**Scope**: Job-level environment variable (applies to all steps in both E2E jobs)

**Effect**:
- Tests check `process.env.OTP_BYPASS` at runtime
- When set to `'1'`, `bypass` variable is truthy
- Conditional skips become no-ops: `test.skip(false, ...)` executes the test

**No Code Changes**:
- Zero application code modifications
- Zero test code modifications
- CI workflow configuration only

## Acceptance Criteria

- [x] Added `OTP_BYPASS: '1'` to `e2e-sqlite` job env
- [x] Added `OTP_BYPASS: '1'` to `e2e-postgres` job env
- [x] No business logic changes (CI/workflow only)
- [x] No test code changes (unlocking via environment only)
- [x] Created Pass-AG6a.md summary

## Impact

**Risk**: VERY LOW
- CI configuration change only
- Tests already exist and are maintained
- No production code affected
- No test code modified

**Scope**:
- 1 file changed: `.github/workflows/e2e-full.yml`
- 2 lines added (one per job)
- No test files modified

**Coverage Increase**:
- **Before**: ~247 active tests (36 skipped, 11 due to OTP_BYPASS)
- **After**: ~258 active tests (25 skipped, 11 auth tests now active)
- **Gain**: +11 tests (~4.4% increase in active test count)

## Test Categories Unlocked

**Checkout Flow** (4 tests):
- Email tracking with OTP bypass
- Low stock notifications
- Order confirmation emails

**Security** (2 tests):
- Cookie security with authentication
- Session validation

**Admin Functionality** (4 tests):
- Admin authentication flows
- Product management UI
- Tracking link administration

**Storefront** (1 test):
- Order tracking for customers

## Deliverables

1. ✅ `.github/workflows/e2e-full.yml` - Updated with `OTP_BYPASS=1`
2. ✅ `docs/AGENT/PASSES/SUMMARY-Pass-AG6a.md` - This summary

## Next Steps

**Automatic**:
- Nightly e2e-full runs (02:00 UTC) will execute 11 additional tests
- Manual e2e-full triggers will run expanded test suite
- PR checks continue as before (e2e-postgres already runs separately)

**Validation**:
- Monitor nightly run results for newly active tests
- Check JUnit artifacts for increased test count
- Verify auth-gated tests execute successfully

**Remaining Skipped Tests** (from AG5b inventory):

After AG6a, **25 tests still skipped** (was 36, minus 11 auth-gated):
- 3 tests: Require BASIC_AUTH (uploads)
- 3 tests: Require SMTP_DEV_MAILBOX (emails)
- 5 tests: Dev mode only
- 3 tests: Data-dependent
- 2 tests: Schema changes required
- 9 tests: Various feature implementations

## Conclusion

**Pass AG6a: CI CONFIGURED ✅**

Simple, low-risk CI configuration change unlocks 11 auth-gated E2E tests. Increases nightly test coverage by ~4.4% with zero code changes.

**No application code changes.** No test code changes. Pure CI configuration to activate existing tests.

---
**Related Passes**:
- Pass AG5b: Unskipped 1 i18n test, documented 36 skipped
- Pass AG2: Created e2e-full nightly workflow
- Pass AG3: Fixed Playwright E2E discovery & execution

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Pass: AG6a | OTP_BYPASS enabled in CI, 11 auth tests unlocked
