# Lighthouse Performance Tracking

## Pass 77 — Devtools Throttling Breakthrough ✅

**Date**: 2025-10-04T20:04Z
**Status**: Mobile LCP Measurable

### Results

**Mobile (devtools throttling)**:
- ✅ **LCP: 1544ms (1.5s)** - FIRST MEASURABLE LCP!
- Performance Score: 0 (metrics collection errors)

**Desktop (devtools throttling)**:
- ⚠️ **LCP: null** - Still unmeasurable
- Performance Score: 0 (metrics collection errors)

### Key Findings

1. **Devtools throttling works for mobile**: Unlike `--throttling-method=simulate`, devtools throttling successfully measured mobile LCP at 1544ms
2. **Desktop still problematic**: Desktop LCP remains null even with devtools throttling
3. **Metrics collection errors persist**: Both audits show "Metrics collection had errors" but mobile still captured LCP

### Artifacts Location

- **Summaries** (committed): `docs/QA/LH-SUMMARY*.json`
- **Heavy artifacts** (gitignored, local only):
  - `docs/QA/lh-desktop.json`
  - `docs/QA/lh-mobile.json`
  - `docs/QA/*-devtoolslog.json`
  - `docs/QA/*-trace.json`

### LHCI Workflow Status

- **PR #331** (CI helper integration): OPEN, merge conflicts
- **PR #334** (LHCI workflow): OPEN, merge conflicts
- **Workflow file**: `.github/workflows/lhci.yml` (pending merge)

### Next Steps

1. Resolve merge conflicts in PRs #331 and #334
2. Merge LHCI workflow to enable CI-based Lighthouse audits
3. Investigate desktop LCP measurement issue
4. Consider performance score despite LCP success

### Historical Context

- **Pass 70-72**: NO_LCP errors with simulate throttling
- **Pass 75**: Production server still showed NO_LCP
- **Pass 76**: Created LHCI workflow with devtools throttling
- **Pass 77**: **Breakthrough** - Mobile LCP now measurable

---

**Conclusion**: Devtools throttling is superior to simulate for this application. Mobile LCP measurement is a major milestone for performance tracking.

## Pass 78 — CI Conflict Resolution & Script Dependency Fix ⚠️

**Date**: 2025-10-04T20:40Z
**Status**: Partially Complete (PRs pending merge)

### Issues Discovered

**Missing Script Dependency**: `scripts/ci/install-deps.sh`
- PR #331 workflows reference this script but it was never committed
- Caused all CI checks to fail with "No such file or directory"

### Actions Taken

1. **✅ Resolved Conflicts**:
   - PR #331: Rebased successfully, conflicts resolved (docs/OS/STATE.md, frontend/playwright.a11y.config.ts, frontend/src/app/page.tsx)
   - PR #334: Rebased successfully, no additional conflicts

2. **✅ Created Missing Script**:
   - Created PR #335 with `scripts/ci/install-deps.sh`
   - Auto-merge enabled
   - Quality gates: PASS
   - Status: Waiting for Lighthouse check to complete

3. **✅ Background Cleanup**:
   - All background processes terminated (next start, pnpm, lighthouse, chrome)

### PR Status Summary

- **PR #335** (install-deps.sh): OPEN, auto-merge armed, quality-gates PASS, waiting for Lighthouse
- **PR #331** (CI helper integration): OPEN, auto-merge armed, BLOCKED (missing script dependency - will unblock after #335 merges)
- **PR #334** (LHCI workflow): OPEN, auto-merge armed, BLOCKED (waiting for #335)

### Dependency Chain

```
PR #335 (script) → PR #331 (CI workflows) → LHCI can run
                  → PR #334 (LHCI workflow) → LHCI available in CI
```

### Next Steps (Manual Intervention Required)

1. Wait for PR #335 Lighthouse check to complete and auto-merge
2. PR #331 will automatically re-run checks and merge once script is in main
3. PR #334 will merge after #331
4. Once all merged, trigger LHCI workflow manually via `gh workflow run "Lighthouse CI"`
5. Download artifacts and document results

### Lessons Learned

- **Script Dependencies**: Workflow changes must include all referenced scripts in same PR or ensure dependencies exist in base branch
- **Testing Order**: Helper scripts should be merged before workflows that use them

## Pass 79 — Path Fix & Workflow Debugging ⚙️

**Date**: 2025-10-04T21:15Z
**Status**: In Progress

### Root Cause Identified

**Script Path Issue**: Workflows run from `frontend/` working directory but script is at repo root
- Line 51 in pr.yml: `run: bash scripts/ci/install-deps.sh` (looked for `frontend/scripts/ci/install-deps.sh`)
- Line 99 in pr.yml: `run: bash scripts/ci/install-deps.sh .` (same issue)
- ci.yml had similar issues

### Actions Taken

1. **✅ Script Exists**: Verified `scripts/ci/install-deps.sh` is in PR #331 (commit 3751a2a)
2. **✅ Path Fix Applied**: Changed all workflow paths to `../scripts/ci/install-deps.sh`
   - pr.yml: 2 occurrences fixed
   - ci.yml: 3 occurrences fixed
3. **✅ Tests Passing**: After path fix:
   - Quality Assurance: PASS ✅
   - PR Hygiene Check: PASS ✅
   - Smoke Tests: PASS ✅
   - quality-gates: PASS ✅
4. **✅ Background Cleanup**: All servers terminated

### Current Blocker

**Branch Updates**: PR #331 keeps falling BEHIND main, requiring branch updates that trigger new CI runs
- Each update resets the merge queue
- Auto-merge configured but waiting for stable checks
- Lighthouse (advisory) still running

### PR Status

- **PR #331**: OPEN, quality-gates PASS, waiting for Lighthouse to complete
- **PR #334**: OPEN, waiting for #331 to merge first
- **PR #335**: OPEN, no longer needed (script now in #331)

### Next Steps

1. Wait for PR #331 Lighthouse to complete and auto-merge
2. PR #334 will merge after #331
3. Close PR #335 as superseded
4. Trigger LHCI workflow on main
5. Document results

### Key Finding

**Working Directory Context Matters**: When `working-directory: frontend` is set at job level, all script paths are relative to that directory. Scripts at repo root need `../` prefix.
