# PR #215 — E2E CI Drilldown

**Date**: 2025-09-21
**Time**: 01:12:00+03:00
**PR**: #215 (integrate/feat/mvp-test-stabilization-on-main)

## Summary

E2E tests were failing due to frontend server not being accessible at `http://127.0.0.1:3001/`.

## Failing Jobs Analyzed

- **e2e-tests** (17885264502): FAILURE
- **e2e-tests** (17885264571): FAILURE
- **Smoke Tests** (17885264581): FAILURE

## Root Cause Identified

**Error**: `page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3001/`

**Issue**: Frontend commands in CI workflow were running from repository root instead of `backend/frontend` directory.

## Test Failures

All 4 e2e tests were failing with the same root cause:
1. `complete shipping checkout flow`
2. `shipping validation prevents checkout without postal code`
3. `shipping cost calculation for different zones`
4. `auth edge case: retry after session timeout`

## Applied Fix

**File**: `.github/workflows/frontend-e2e.yml`

**Changes**: Added `working-directory: backend/frontend` to all frontend-related steps:

```yaml
# Before (incorrect - runs from root)
- name: Install frontend dependencies
  run: npm ci

# After (correct - runs from backend/frontend)
- name: Install frontend dependencies
  working-directory: backend/frontend
  run: npm ci
```

Applied to 6 steps:
- Install frontend dependencies
- Set API base URL
- Install Playwright browsers
- Build frontend
- Start frontend server
- Run E2E tests

## Verification

**Commit**: `36dd45d` - "fix(e2e): stabilize PR #215 failing tests - add working-directory for frontend commands"

**Impact**: Frontend server will now correctly start on port 3001 from the proper directory, resolving all e2e test connection failures.

## Classification

- **Pattern**: CI configuration issue
- **Category**: Frontend server startup
- **Fix Type**: Working directory correction
- **Lines Changed**: 7 additions, 1 deletion

## Next Steps

Monitor new CI run to confirm e2e tests now pass with frontend server accessible.