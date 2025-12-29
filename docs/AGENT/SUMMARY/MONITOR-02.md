# MONITOR-02 — Alert Drill

**Date**: 2025-12-29
**Status**: COMPLETE
**PR**: #TBD

## TL;DR

Added drill testing capability to uptime-monitor workflow and verified the alerting pipeline works end-to-end.

## What Changed

| File | Type | Description |
|------|------|-------------|
| `.github/workflows/uptime-monitor.yml` | Modified | Added `force_fail` input and `permissions` block |
| `docs/OPS/MONITORING.md` | Modified | Added drill documentation and evidence |
| `docs/AGENT/SUMMARY/MONITOR-02.md` | New | This summary |

## Drill Results

### PHASE 1: force_fail=true → Issue Created ✅
- Run: https://github.com/lomendor/Project-Dixis/actions/runs/20571116283
- Issue #1959 created with labels `drill`, `monitor-test`
- Title: "🧪 [DRILL] Uptime monitor alert test"

### PHASE 2: force_fail=true (again) → Dedupe Verified ✅
- Run: https://github.com/lomendor/Project-Dixis/actions/runs/20571169721
- Comment added to Issue #1959 instead of creating new issue

### PHASE 3: force_fail=false → No Issues ✅
- Run: https://github.com/lomendor/Project-Dixis/actions/runs/20571197102
- Workflow passed (healthz returned 200)
- No new issues created

## Workflow Changes

1. **Permissions**: Added `issues: write` and `contents: read` for non-default branch execution
2. **force_fail input**: When true, hits `https://dixis.gr/api/healthz__drill` (404)
3. **Drill labels**: Drill issues use `drill`, `monitor-test` labels (not `production-down`)
4. **Drill title/body**: Clearly indicate it's a test

## Evidence

- Issue #1959: Closed after successful drill
- Workflow runs: 20571116283, 20571169721, 20571197102

---
Generated-by: Claude (MONITOR-02)
