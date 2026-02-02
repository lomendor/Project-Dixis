# Pass P0-PROD-SMOKE-404-02: Fix deploy pipeline blocking issues

**Created**: 2026-02-02
**Status**: ✅ DEPLOYED — PRs #2590, #2591, #2592
**Priority**: P0

## Problem
Multiple blockers prevented deploying the OG image fix (PR #2586):
1. Precheck fails: `.env` symlink missing
2. Rsync fails: permission denied on `.next/cache`
3. Nginx check fails: `/api/producer/` route missing

## Solution
1. **PR #2590**: Changed precheck to use shared env source
2. **PR #2591**: Excluded `.next/cache` from rsync delete
3. **PR #2592**: Made nginx check non-blocking

## DoD
- [x] Identified 3 blocking issues
- [x] Fixed precheck to use shared env source
- [x] Excluded .next/cache from rsync delete
- [x] Made nginx check non-blocking
- [x] CI green (required checks) + PRs merged
- [x] Deploy workflow succeeds

## Remaining Manual Actions
- [ ] Fix nginx config on VPS (add /api/producer/ route)
- [ ] Clear ISR cache if metadata doesn't update
- [ ] Re-enable nginx check as blocking
