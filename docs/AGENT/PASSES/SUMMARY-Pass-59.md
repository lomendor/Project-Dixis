# Pass 59 — Stabilize PROD Smoke (reload-and-css)

**Date**: 2025-12-28
**Status**: COMPLETE
**PR**: #1948 (merged 08c9d23c)

## TL;DR

Fixed flaky `reload-and-css.smoke.spec.ts` that was randomly failing in CI with `net::ERR_ABORTED` errors.

## What Changed

| File | Type | Description |
|------|------|-------------|
| `frontend/tests/e2e/reload-and-css.smoke.spec.ts` | Modified | Added retry wrapper + deterministic assertions |

## Root Cause

`net::ERR_ABORTED` occurs when:
- SPA navigation aborts the initial request
- Redirect happens during page load
- Network instability during CI runs against PROD

## Solution

1. **Targeted retry wrapper**: `gotoWithRetry()` catches ERR_ABORTED and retries (max 2 attempts)
2. **Load state handling**: `domcontentloaded` + optional `networkidle` (non-blocking)
3. **Console error filtering**: Network errors (net::*, ERR_*) excluded from assertions
4. **Explicit timeouts**: Visibility assertions have explicit 10s timeout

## Tests

- 2 tests pass against PROD locally (13.9s)
- Tests: homepage CSS, products reload loop

## Notes

- Test-only change, no production code modified
- Pattern can be reused in other PROD smoke tests if needed

---
Generated-by: Claude (Pass 59)
