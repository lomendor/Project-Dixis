# PR #254 - CODEMAP

## Overview
CI-only change to add always-on Playwright artifact uploads across all E2E workflows.

## Files Modified
1. `.github/workflows/frontend-ci.yml`
2. `.github/workflows/frontend-e2e.yml`
3. `.github/workflows/fe-api-integration.yml`
4. `.github/workflows/pr.yml`

## Change Pattern
**Per workflow**: Added 2 steps with `if: always()` for artifact uploads:
- `Upload Playwright report (always)` - retention: 7 days
- `Upload test results (always)` - retention: 7 days

## Impact
- **Lines Added**: ~15 per workflow (60 total)
- **Runtime Impact**: Zero (CI artifacts only)
- **Risk Level**: Low (additive, no logic changes)

## Verification
- Artifact paths align with Playwright config
- Existing failure-only uploads preserved
- No conflicts with existing upload steps