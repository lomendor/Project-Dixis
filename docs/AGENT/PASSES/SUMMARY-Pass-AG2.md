# Pass AG2 — e2e-full nightly & strict smoke

**Date**: 2025-10-15 13:54 UTC

## Summary
Added nightly e2e-full workflow, strict smoke test, and skipped tests inventory.

## Changes
- **.github/workflows/e2e-full.yml**: Nightly @ 02:00 UTC + manual trigger
  - e2e-sqlite: Default SQLite-backed E2E (20min timeout)
  - e2e-postgres: Optional gated PostgreSQL E2E (30min timeout)
  - JUnit artifact upload for both jobs

- **frontend/tests/e2e/smoke-strict.spec.ts**: P0 gate smoke test
  - Verifies server responds (root < 400)
  - Checks health endpoint (/api/healthz or /api/dev/health fallback)
  - STOP-on-failure: blocks all tests if infrastructure is down

- **docs/reports/TESTS-SKIPPED.md**: Skipped tests inventory
  - 38 skipped test occurrences across 19 files
  - Common reasons: env-gated (OTP_BYPASS, SMTP_DEV_MAILBOX), dev-only, pending features
  - Action items for review and cleanup

## Impact
- **Non-Breaking**: CI/tests/docs only, no business logic changes
- **Reliability**: Nightly full E2E suite catches regressions early
- **Visibility**: Skipped tests tracked for eventual resolution
- **Quality Gate**: Strict smoke ensures infrastructure health before tests

## Reports
- CODEMAP: docs/AGENT/SYSTEM/routes.md
- TEST-REPORT: GitHub Actions (e2e-full workflow)
- RISKS-NEXT: frontend/docs/OPS/STATE.md
