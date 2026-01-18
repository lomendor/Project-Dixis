# Pass 29: backend-ci.yml paths/paths-ignore Conflict Fix

**Date**: 2025-12-23
**Status**: ✅ COMPLETE
**Priority**: P1

---

## Objective

Fix backend-ci.yml 0s failures caused by invalid GitHub Actions YAML (both `paths:` and `paths-ignore:` on same event).

---

## Problem

**All backend-ci runs failing instantly** (0s duration, no jobs executed):
- Run #20472416205: FAILURE, 0s ❌
- Run #20472002687: FAILURE, 0s ❌
- Run #20471945532: FAILURE, 0s ❌
- Pattern: 10/10 recent runs - 100% failure rate

**Symptoms**:
- `conclusion: "failure"`
- `jobs: []` (empty array - no jobs ran)
- `createdAt == updatedAt` (0 seconds duration)
- No logs available (workflow never started)

---

## Root Cause (Hard Evidence)

**INVALID YAML**: GitHub Actions does not allow both `paths:` and `paths-ignore:` on the same event.

From GitHub Actions documentation:
> You cannot use both the `paths` and `paths-ignore` filters for the same event in a workflow.

**File**: `.github/workflows/backend-ci.yml`

**Before** (INVALID):
```yaml
on:
  push:
    paths:                    # ← Filter 1
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
    paths-ignore:             # ← Filter 2 (CONFLICT!)
      - 'docs/**'
      - 'backend/docs/**'
      - '**/*.md'
  pull_request:
    paths:                    # ← Filter 1
      - 'backend/**'
    paths-ignore:             # ← Filter 2 (CONFLICT!)
      - 'docs/**'
      - 'backend/docs/**'
      - '**/*.md'
```

GitHub rejects this configuration → workflow fails without running jobs.

---

## Solution

**Removed `paths-ignore:` sections** - kept only `paths:` filters.

**After** (VALID):
```yaml
on:
  push:
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  schedule:
    - cron: '0 3 * * *'  # Daily at 3:00 UTC
  workflow_dispatch:
```

**Trade-off**: Workflow now runs on ALL backend changes (including docs/markdown). This is acceptable because:
- Backend tests are fast (~2-3 min)
- Catching issues early > saving CI minutes
- Simpler configuration = less maintenance

---

## Files Changed

1. **`.github/workflows/backend-ci.yml`** - Removed paths-ignore sections (8 lines deleted)
   - Lines 7-10 (push.paths-ignore) → DELETED
   - Lines 14-17 (pull_request.paths-ignore) → DELETED
   - Added '.github/workflows/backend-ci.yml' to pull_request.paths (consistency)

---

## Impact

**Before**: backend-ci 100% failure rate (0s, no jobs run)
**After**: Workflow executes jobs, tests run, valid pass/fail signal

**Risk**: NONE (workflow syntax fix only, no code changes)

---

## Evidence URLs

### Failed Runs (Before Fix)
- https://github.com/lomendor/Project-Dixis/actions/runs/20472416205
- https://github.com/lomendor/Project-Dixis/actions/runs/20472002687
- https://github.com/lomendor/Project-Dixis/actions/runs/20471945532

All show: `jobs: []`, no logs, 0s duration

### GitHub Actions Documentation
- https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore

Quote:
> "You cannot use both the `paths` and `paths-ignore` filters for the same event in a workflow."

---

## Pattern

**Evidence-first ops fix** - similar to Pass 28 (staging workflows):
1. Identify symptoms (0s failures)
2. Collect hard evidence (run metadata, logs)
3. Find root cause (YAML syntax conflict)
4. Apply minimal fix (remove paths-ignore)
5. Verify (next run should execute jobs)

---

## Verification (Post-Fix)

**PR #1860** - backend-ci workflow now EXECUTING JOBS ✅

### Run #20472472011 (After Fix)
- **Duration**: 38s (was 0s before) ✅
- **Jobs**: Executed (was empty [] before) ✅
- **Logs**: Available (was "log not found" before) ✅
- **URL**: https://github.com/lomendor/Project-Dixis/actions/runs/20472472011

**Proof**: Workflow reached "Migrate & Seed (fresh)" step - jobs are running!

### New Issue Found (Separate from Pass 29)
PostgreSQL connection error during migration:
```
SQLSTATE[08006] [7] connection to server at "127.0.0.1", port 5432 failed:
fe_sendauth: no password supplied
```

This is a **legitimate test failure** (DB configuration issue), NOT a YAML syntax error.

**Pass 29 Scope**: Fix YAML syntax → ✅ **COMPLETE**
**Follow-up**: DB connection issue → tracked separately

---

**Status**: ✅ **COMPLETE** - YAML fixed, workflow executing jobs, verification complete
