# Pass 63 — Smoke Readiness Gate

**Date**: 2025-12-29
**Status**: IN REVIEW
**PR**: #TBD

## TL;DR

Stabilized flaky smoke-production/auth-probe CI tests by adding healthz readiness gate with exponential backoff. Tests now wait for production to be ready before running, preventing cold-start timeouts.

## Problem

The `smoke.yml` workflow running `auth-probe.spec.ts` against `https://dixis.gr` was failing intermittently:
- `ci-global-setup.ts` timed out (30s) navigating to production
- `healthz returns 200` test timed out (10s)
- `landing renders & shows brand text` test failed with `net::ERR_ABORTED`

Root cause: Production cold-starts or transient slowness caused tests to fail before the site was ready.

## Solution

Added readiness gate pattern:
1. **New helper**: `frontend/tests/e2e/helpers/readiness.ts`
   - `waitForReadiness()`: Polls `/api/healthz` with exponential backoff (2s, 4s, 8s, 15s, 15s, 15s = ~60s total)
   - Logs progress and continues gracefully if production remains unavailable

2. **Updated `auth-probe.spec.ts`**:
   - `test.beforeAll()` waits for production readiness before any tests
   - Increased test timeout: 60s → 90s
   - Increased healthz request timeout: 10s → 30s
   - Increased navigation timeout: default → 45s
   - Added `test.describe.configure({ retries: 2 })` for this spec only

3. **Updated `ci-global-setup.ts`**:
   - Added `waitForHealthz()` function with same backoff pattern
   - Waits for production before attempting navigation
   - Increased navigation timeout: 30s → 60s

## What Changed

| File | Type | Description |
|------|------|-------------|
| `frontend/tests/e2e/helpers/readiness.ts` | New | Readiness helper with exponential backoff |
| `frontend/tests/e2e/auth-probe.spec.ts` | Modified | Added readiness gate, increased timeouts, 2 retries |
| `frontend/tests/e2e/setup/ci-global-setup.ts` | Modified | Added healthz wait before navigation |

## Backoff Strategy

```
Attempt 1: wait 2s, request (15s timeout)
Attempt 2: wait 4s, request (15s timeout)
Attempt 3: wait 8s, request (15s timeout)
Attempt 4: wait 15s, request (15s timeout)
Attempt 5: wait 15s, request (15s timeout)
Attempt 6: no wait, request (15s timeout)
Total: ~60s max wait time
```

## Risks Mitigated

| Risk | Mitigation |
|------|------------|
| Cold-start timeout | Readiness gate warms up site before tests |
| Transient network issues | Exponential backoff with retries |
| CI flakiness | 2 retries for auth-probe spec only |
| Still fails if truly down | Clear error messages, doesn't block merges (Pass 47 policy) |

---
Generated-by: Claude (Pass 63)
