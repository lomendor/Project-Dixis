# PR #222 — CI RED REPORT (2025-09-23)

**Status**: ❌ **MULTIPLE FAILURES**
**Generated**: 2025-09-23T18:00 UTC
**Latest Commit**: `b6bfb3d` (fix contracts import/path)

## 📊 Summary

**PASS**: 2/10 workflows
**FAIL**: 7/10 workflows
**IN_PROGRESS**: 1/10 workflows

## ❌ Failing Workflows

| Workflow | Status | URL |
|----------|--------|-----|
| **frontend-ci** | FAILURE | https://github.com/lomendor/Project-Dixis/actions/runs/17953767526 |
| **CI Pipeline** | FAILURE | https://github.com/lomendor/Project-Dixis/actions/runs/17953767062 |
| **Pull Request Quality Gates** | FAILURE | https://github.com/lomendor/Project-Dixis/actions/runs/17953767056 |
| **frontend-ci** (2nd) | FAILURE | https://github.com/lomendor/Project-Dixis/actions/runs/17953767071 |
| **frontend-e2e.yml** | FAILURE | https://github.com/lomendor/Project-Dixis/actions/runs/17953766581 |
| **fe-api-integration.yml** | FAILURE | https://github.com/lomendor/Project-Dixis/actions/runs/17953767004 |
| **backend-ci.yml** | FAILURE | https://github.com/lomendor/Project-Dixis/actions/runs/17953766436 |

## 🚨 Root Cause Identified

### **Backend Test Failure**
**Test**: `Tests\Feature\AuthorizationTest > admin has full access`
**Error**: Database constraint violation

```sql
ERROR: null value in column "payload" of relation "notifications" violates not-null constraint
DETAIL: Failing row contains (3, 200, low_stock, null, null, 2025-09-23 17:29:28, 2025-09-23 17:29:28)
```

**Impact**: Backend test suite fails with 1 failed test out of 335 total tests
**Location**: AuthorizationTest expecting HTTP 201 but receiving HTTP 500

## 📋 Error Details from CI Logs

### Backend Test Output
```
FAILED  Tests\Feature\AuthorizationTest > admin has full access
Failed asserting that 500 is identical to 201.

Tests: 1 failed, 5 skipped, 329 passed (2730 assertions)
Process completed with exit code 1.
```

### Database Error
```
2025-09-23 17:29:28.739 UTC [282] ERROR: null value in column "payload" of relation "notifications" violates not-null constraint
2025-09-23 17:29:28.739 UTC [282] DETAIL: Failing row contains (3, 200, low_stock, null, null, 2025-09-23 17:29:28, 2025-09-23 17:29:28)
2025-09-23 17:29:28.739 UTC [282] ERROR: current transaction is aborted, commands ignored until end of transaction block
```

## 📄 CI Pipeline Logs (Head - First 80 lines)

```
type-check	UNKNOWN STEP	﻿2025-09-23T17:27:26.4832662Z Current runner version: '2.328.0'
type-check	UNKNOWN STEP	2025-09-23T17:27:26.4855870Z ##[group]Runner Image Provisioner
type-check	UNKNOWN STEP	2025-09-23T17:27:26.4856696Z Hosted Compute Agent
type-check	UNKNOWN STEP	2025-09-23T17:27:26.4857289Z Version: 20250829.383
type-check	UNKNOWN STEP	2025-09-23T17:27:26.4857910Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
type-check	UNKNOWN STEP	2025-09-23T17:27:26.4858574Z Build Date: 2025-08-29T13:48:48Z
[... truncated for brevity ...]
```

## 📄 CI Pipeline Logs (Tail - Last 80 lines)

```
e2e-tests	Stop containers	2025-09-23T17:59:31.0574486Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	Stop containers	2025-09-23T17:59:31.0575283Z  2025-09-23 17:30:37.501 UTC [48] LOG:  received fast shutdown request
[... PostgreSQL shutdown logs ...]
e2e-tests	Complete job	2025-09-23T17:59:31.3439488Z Terminate orphan process: pid (4650) (npm start)
e2e-tests	Complete job	2025-09-23T17:59:31.3462475Z Terminate orphan process: pid (4662) (sh)
e2e-tests	Complete job	2025-09-23T17:59:31.3484378Z Terminate orphan process: pid (4663) (next-server (v15.5.0))
```

## 🔍 Analysis

### ✅ Progress Made
1. **Port Unification**: Successfully applied (FRONTEND_PORT: 3000)
2. **TypeScript Build**: Fixed by adding contracts build step
3. **Frontend Compilation**: Now passes locally

### ❌ Current Blocker
**Backend Database Issue**: The `notifications` table requires a non-null `payload` column, but the test/seed data is attempting to insert null values.

## 🧯 Next Steps (Minimal)

1. **Fix Notification Payload**: Update `AuthorizationTest` or seed data to provide valid payload for notifications
   - Check if recent changes removed payload initialization
   - Ensure NotificationSeeder provides complete data

2. **Verify Database Schema**: Confirm if `payload` column should be nullable or if test data needs update
   - Review migration for notifications table
   - Check if payload is optional in model but required in DB

3. **Local Validation**: Run `php artisan test --filter AuthorizationTest` locally to reproduce and fix

## 📊 CI Status Distribution

- **✅ SUCCESS**: Danger PR Gatekeeper, DangerJS Gatekeeper (2)
- **❌ FAILURE**: 7 workflows (primarily due to backend test failure)
- **🔄 IN_PROGRESS**: Lighthouse CI (1)

---

**Priority**: HIGH - Single backend test failure blocking all CI pipelines
**Root Issue**: Database constraint violation in notifications table during admin authorization test