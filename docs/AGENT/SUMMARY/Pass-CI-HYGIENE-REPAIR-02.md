# Summary: Pass CI-HYGIENE-REPAIR-02

**Date**: 2026-01-28
**PR**: #2521
**Result**: ✅ MERGED

## What

Damage audit repair: harden overly-lenient tests + restore prod-facts monitoring.

## Why

1. PR #2518 made `filters-search.spec.ts` tests too soft - passed even when nothing happened
2. `prod-facts.yml` was disabled due to ghost workflow triggers - lost daily health collection

## How

### (A) Test Hardening

Changed BOTH search tests from lenient to meaningful:

**Tests fixed**:
- `should apply search filter with Greek text normalization` (lines 16-103)
- `should show no results for nonsense search query` (lines 111-175)

**Before**: Only `expect(searchInput).toBeTruthy()` - passes always
**After**: Two hard invariants per test:
1. `expect(inputValue).toContain(searchQuery)` - input retains value
2. `expect(searchWasProcessed).toBe(true)` - API call OR URL change occurred

Demo fallback behavior is still tolerated (logs info) but search functionality is verified.

### (B) Prod Facts v2

Created new workflow file `prod-facts-v2.yml`:
- Fresh workflow ID (227760108)
- Triggers: `schedule` (daily 07:00 UTC) + `workflow_dispatch` only
- Job-level guard: `if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'`
- Same jobs/steps as original

## Changes

| File | Change |
|------|--------|
| `frontend/tests/e2e/filters-search.spec.ts` | Add meaningful invariants to BOTH search tests |
| `.github/workflows/prod-facts-v2.yml` | New clean schedule-only workflow |
| `docs/OPS/STATE.md` | Document pass |

## Proof

```
Before: Tests passed with no real assertion
After: Tests require API/URL signal + input value check
```

## Evidence

- CI (main): https://github.com/lomendor/Project-Dixis/actions/runs/21421868908
- e2e-postgres (main): https://github.com/lomendor/Project-Dixis/actions/runs/21421868913
- prod-facts-v2 active: workflow ID 227760108

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Test too strict | Tolerates demo fallback with log, only fails if no signal |
| Ghost workflow reappears | Fresh workflow ID + job-level guard |

## Follow-up

- Monitor prod-facts-v2 first scheduled run (07:00 UTC)
- Old prod-facts.yml remains disabled (stale entry)
