# Pass P0-PROD-SMOKE-404-02: Fix deploy precheck blocking on missing symlink

**Created**: 2026-02-02
**Status**: IN_PROGRESS
**Priority**: P0

## Problem
Frontend deploy workflow fails at "Precheck VPS env files" step with:
```
❌ FATAL: .env file not found at /var/www/dixis/current/frontend/.env
```

This blocks the OG image fix from P0-PROD-SMOKE-404-01 from reaching production.

## Root Cause
The deploy workflow precheck looks for `/var/www/dixis/current/frontend/.env`, which is a symlink.
This symlink is deleted by `rsync --delete` during deploy. The symlink restore step runs AFTER rsync,
creating a chicken-and-egg problem: precheck expects file that will be created later.

## Solution
Update precheck to verify the SHARED source (`/var/www/dixis/shared/frontend.env`) instead of
the symlink target. The symlink will be recreated after rsync by the existing restore step.

## DoD
- [x] Identified root cause (precheck checks wrong path)
- [x] Fixed workflow to check shared source
- [ ] CI green (required checks) + PR merged
- [ ] Deploy succeeds
- [ ] P0-PROD-SMOKE-404-01 fix reaches production
- [ ] Prod smoke passes
