# Agents Playbook (Dixis)

**Required check:** `quality-gates` (strict).
**Fastpath:** docs-only PRs skip heavy steps.

## Critical Paths

**Workflows:**
- `.github/workflows/pr.yml` (quality-gates, smoke tests)
- `.github/workflows/e2e-full.yml` (nightly/manual full E2E suite)

**E2E Tests:**
- `frontend/tests/e2e/auth-probe.spec.ts` (strict smoke test)
- `frontend/tests/e2e/shipping-checkout-e2e.spec.ts` (unquarantined)

**Config:**
- `frontend/playwright.config.ts` (retries, artifacts, trace on-first-retry)

**Docs:**
- `docs/OS/STATE.md` (current phase status)
- `docs/ROADMAP/2025Q4.md` (quarterly objectives)
- `docs/AGENT-STATE.md` (immediate priorities)
- `docs/PRODUCT/PRD-INDEX.md` (product requirements)
- `docs/DECISIONS/` (architectural decisions)

## UltraThink Template

Each pass should include:
- **Στόχος** (goal): Clear objective
- **Κανόνες** (rules): Allowed changes (usually `.github/workflows/**`, `frontend/tests/**`, `docs/**`)
- **Βήματα** (steps): Executable bash/node commands
- **STOP-on-failure**: Exit on first error with logs
- **Constraints**: No `src/**` changes unless explicitly approved

## Workflow Structure

**PR Quality Gates** (`.github/workflows/pr.yml`):
- Job: `qa` — Type-check, lint, unit tests, build (REQUIRED)
- Job: `test-smoke` — E2E smoke test (auth-probe) (STRICT - no continue-on-error)
- Job: `danger` — PR hygiene check (advisory)
- Job: `quality-gates` — Summary gate (single required check)

**E2E Full** (`.github/workflows/e2e-full.yml`):
- Trigger: Nightly (03:30 UTC), manual, or label `run-e2e-full`
- Runs: All E2E tests with retries=1
- Artifacts: Playwright reports on failure

## Phase 2 Status

- ✅ Branch protection: single `quality-gates` check
- ✅ Docs-only fastpath: skips heavy CI steps
- ✅ Shipping E2E: unquarantined, runs in CI
- ✅ Playwright artifacts: trace on-first-retry (optimized)
- ⏳ Skipped tests: 10 require production code (see skip-register.md)
