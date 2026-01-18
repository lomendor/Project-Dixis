# Pass 59 — Stabilize PROD Smoke (reload-and-css)

## Goal
Fix flaky `reload-and-css.smoke.spec.ts` causing random CI failures with `net::ERR_ABORTED`.

## Scope
Included:
- Add retry wrapper for navigation (targeted at ERR_ABORTED errors)
- Use deterministic load state assertions
- Filter network errors from console checks

Excluded:
- No changes to other E2E tests
- No changes to CI workflow (test fix only)

## DoD
- [x] gotoWithRetry() helper added (max 2 attempts)
- [x] domcontentloaded + optional networkidle
- [x] Network errors filtered from console assertions
- [x] Tests pass against PROD locally
- [x] CI green (smoke-production passed in 1m7s)
- [x] docs updated
