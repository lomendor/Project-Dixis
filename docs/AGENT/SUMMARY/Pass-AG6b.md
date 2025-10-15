# Pass AG6b — CI: Enable BASIC_AUTH & DEV_MAILBOX for E2E

**Date**: 2025-10-15
**Status**: COMPLETE ✅

## Objective

Enable `BASIC_AUTH=1` and `SMTP_DEV_MAILBOX=1` environment flags in CI E2E jobs to unlock login and email-gated test scenarios.

## Changes

### Workflow Modified ✅

**File**: `.github/workflows/e2e-full.yml`

**Jobs Updated**: Both `e2e-sqlite` and `e2e-postgres`

**Environment Variables Added**:
```yaml
env:
  NEXT_TELEMETRY_DISABLED: '1'
  SKIP_ENV_VALIDATION: '1'
  OTP_BYPASS: '1'              # ← Already present from AG6a
  BASIC_AUTH: '1'              # ← NEW: Enables basic auth bypass in tests
  SMTP_DEV_MAILBOX: '1'        # ← NEW: Enables dev mailbox for email tests
```

### Purpose of New Flags

**`BASIC_AUTH=1`**:
- Enables basic authentication bypass paths in E2E tests
- Allows tests to proceed without complex auth flows
- Similar to `OTP_BYPASS` pattern established in AG6a
- No impact on production (CI-only flag)

**`SMTP_DEV_MAILBOX=1`**:
- Enables development mailbox for email testing
- Captures outgoing emails for verification
- Prevents actual email sending in CI environment
- Allows E2E tests to verify email flows

## Impact

**Risk**: NONE
- CI configuration only
- No application code changes
- No backend modifications
- No database changes
- No business logic changes

**Files Changed**: 2
- Modified: `.github/workflows/e2e-full.yml` (2 lines added per job)
- Created: `docs/AGENT/SUMMARY/Pass-AG6b.md`

## Acceptance Criteria

- [x] `BASIC_AUTH=1` added to `e2e-sqlite` job env
- [x] `BASIC_AUTH=1` added to `e2e-postgres` job env
- [x] `SMTP_DEV_MAILBOX=1` added to `e2e-sqlite` job env
- [x] `SMTP_DEV_MAILBOX=1` added to `e2e-postgres` job env
- [x] No application code changes
- [x] No backend changes
- [x] Documentation created

## Technical Details

### Flag Behavior

**In CI Environment**:
- Application reads `process.env.BASIC_AUTH === '1'`
- Application reads `process.env.SMTP_DEV_MAILBOX === '1'`
- Tests can bypass auth and verify emails

**In Production**:
- Flags not set
- Normal auth flows required
- Real SMTP server used

### E2E Test Unlocks

With these flags, E2E tests can now:
1. **Auth Testing**: Test login flows with simplified auth
2. **Email Testing**: Verify email content and delivery
3. **Registration**: Test user registration flows
4. **Password Reset**: Test password reset emails
5. **Order Confirmations**: Test order confirmation emails

## Related Work

**Pass AG6a** (predecessor):
- Added `OTP_BYPASS=1` for E2E tests
- Established pattern for CI-only env flags
- Same workflow file modified

**Pattern Consistency**:
- All CI flags use `'1'` string value
- All flags are optional (app handles missing flags gracefully)
- All flags are CI/test-only (never in production)

## Testing Strategy

**Validation**:
1. Workflow YAML syntax is valid
2. E2E jobs can read environment variables
3. Application code respects flags when set
4. Tests can leverage new capabilities

**Optional Manual Run**:
- Can trigger via workflow_dispatch
- SQLite variant (faster, default)
- Postgres variant (gated, optional)

## Deliverables

1. ✅ `.github/workflows/e2e-full.yml` - Updated with new env flags
2. ✅ `docs/AGENT/SUMMARY/Pass-AG6b.md` - This documentation

## Next Steps

**Future E2E Enhancements**:
- Write tests using BASIC_AUTH bypass
- Write tests verifying email flows
- Add registration E2E tests
- Add password reset E2E tests
- Add order confirmation E2E tests

**Pattern Extension**:
- Other workflows can adopt same flags if needed
- Additional CI-only flags can follow this pattern

## Conclusion

**Pass AG6b: CI FLAGS ENABLED ✅**

Successfully added `BASIC_AUTH=1` and `SMTP_DEV_MAILBOX=1` to both E2E jobs in the `e2e-full` workflow. These flags unlock login and email testing capabilities without modifying any application code.

**Pure CI configuration change** - Zero risk to production.

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Pass: AG6b | CI env flags (BASIC_AUTH + SMTP_DEV_MAILBOX) for E2E testing
