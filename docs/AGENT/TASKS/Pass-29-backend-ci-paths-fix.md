# Pass 29: backend-ci.yml paths/paths-ignore Conflict Fix

**Date**: 2025-12-23
**Status**: IN PROGRESS
**Priority**: P1 (blocking all backend CI)

---

## Objective

Fix backend-ci.yml 0s failures caused by invalid YAML (both `paths:` and `paths-ignore:` on same event).

---

## Problem Statement

**All backend-ci.yml runs failing instantly (0s, no jobs run)**:
- Run #20472416205 (2025-12-23T21:53:36Z): FAILURE, 0s, no jobs ❌
- Run #20472002687 (2025-12-23T21:29:04Z): FAILURE, 0s, no jobs ❌
- Pattern: 10/10 recent runs - ALL failures with empty jobs array

**Root Cause**: GitHub Actions does not allow both `paths:` and `paths-ignore:` on the same event.

From GitHub Actions documentation:
> You cannot use both the `paths` and `paths-ignore` filters for the same event in a workflow.

**File**: `.github/workflows/backend-ci.yml`
**Lines**:
- Lines 4-10: `push:` event with BOTH `paths:` and `paths-ignore:`
- Lines 11-17: `pull_request:` event with BOTH `paths:` and `paths-ignore:`

---

## Root Cause Analysis (Hard Evidence)

### Workflow Configuration (INVALID)
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

**GitHub rejects this configuration** → workflow fails immediately without running jobs.

### Evidence URLs
- https://github.com/lomendor/Project-Dixis/actions/runs/20472416205
- https://github.com/lomendor/Project-Dixis/actions/runs/20472002687
- https://github.com/lomendor/Project-Dixis/actions/runs/20471945532

All runs show:
- `conclusion: "failure"`
- `jobs: []` (empty array)
- `createdAt == updatedAt` (0 seconds)
- No logs available

---

## Solution Strategy

**Option A (Recommended)**: Remove `paths-ignore:`, use only `paths:` with explicit filters
```yaml
on:
  push:
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
      - '!backend/docs/**'    # Negation pattern (may not work)
```

**Option B**: Remove `paths:`, use only `paths-ignore:`
```yaml
on:
  push:
    paths-ignore:
      - 'docs/**'
      - 'backend/docs/**'
      - '**/*.md'
      - 'frontend/**'
```

**Option C (CHOSEN)**: Remove `paths-ignore:` entirely, accept that workflow runs more often
```yaml
on:
  push:
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    paths:
      - 'backend/**'
```

**Rationale**: Simplest fix, avoids complexity. Backend tests are fast (~2-3 min), extra runs acceptable.

---

## Implementation Plan

### Phase 1: Fix YAML Syntax
1. Remove `paths-ignore:` sections (lines 7-10, 14-17)
2. Keep only `paths:` filters
3. Test workflow syntax locally (if possible)

### Phase 2: Verify Fix
1. Commit + push to branch
2. Check if backend-ci runs (should trigger on workflow file change)
3. Verify jobs execute (not 0s failure)
4. Check job logs for actual test results

### Phase 3: Merge + Monitor
1. Create PR with evidence
2. Merge to main
3. Monitor next 3 pushes to confirm backend-ci runs successfully

---

## Definition of Done

- [ ] backend-ci.yml has EITHER `paths:` OR `paths-ignore:` (not both)
- [ ] Next backend-ci run executes jobs (not 0s failure)
- [ ] Workflow passes on valid backend changes
- [ ] Workflow skips on non-backend changes (if paths filter works)
- [ ] Evidence doc created with before/after run URLs

---

## Constraints

- **Risk**: LOW (workflow syntax fix only, no code changes)
- **Impact**: Unblocks backend CI (currently 100% failure rate)
- **Pattern**: Evidence-first ops fix (similar to Pass 28)

---

## References

- GitHub Actions docs: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore
- Current workflow: `.github/workflows/backend-ci.yml`
- Recent failed runs: `gh run list --workflow=backend-ci.yml --limit 10`
