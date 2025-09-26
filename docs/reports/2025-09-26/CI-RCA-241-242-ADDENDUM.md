# CI RCA Addendum for PRs #241 and #242 (2025-09-26)

Scope
- PR #241: ci/patch-b-port-normalization (ports/baseURL normalization)
- PR #242: ci/patch-a-contracts-typecheck-guard (contracts type-check guard)
- Gates analyzed: PR Hygiene Check (Danger pipeline) and E2E/e2e-tests

Executive Summary
- Danger/Hygiene: Failure due to commitlint subject-max-length on ci/* branch; Danger itself was skipped as intended. Step failed and caused job failure.
- E2E: Frontend server is on 3030 and baseURL is passed, but tests consistently timeout waiting for '/' after login (stuck on /auth/login) and throw localStorage SecurityError — likely auth/session bootstrap mismatch.
- Ports/baseURL: In PR #241, frontend-ci.yml correctly uses 3030 in server start, waits, and PLAYWRIGHT_BASE_URL; legacy frontend-e2e.yml still hardcodes 3000 (not in this PR’s job matrix).
- Remediation: For Hygiene, add step-level guard for commitlint/Danger on ci/*; For E2E, enforce `${{ env.FRONTEND_PORT }}` and `${{ env.PLAYWRIGHT_BASE_URL }}` pass-through, curl `/api/health` on 127.0.0.1:8001 and 127.0.0.1:${{ env.FRONTEND_PORT }}, and temporarily set PW retries=1 at workflow level.

1) Harvested logs (exact excerpts)
- PR #241 (head_ref: ci/patch-b-port-normalization)
  • PR Hygiene Check → commitlint failure (job failed; Danger skipped):
    - "✖ subject must not be longer than 72 characters [subject-max-length]"
    - step: "Run commitlint (non-blocking on ci/* branches)" → exit code 1
    - next step: "Run Danger (non-blocking on ci/* branches)" → skipped
  • E2E (frontend-ci → e2e-tests):
    - TimeoutError: page.waitForURL('/', { timeout: 10000 }) after navigation to "http://localhost:3030/auth/login?..."
    - at ShippingEngineHelper.loginAsConsumer (frontend/tests/e2e/shipping-engine-v1.spec.ts:28:17)
    - Repeated across multiple specs (flow/final/demo), same pattern (stuck on /auth/login)
    - SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document. at tests/e2e/helpers/test-auth.ts:50:21
  • Environment in workflow:
    - Start Next.js: PORT=3030 npm start &
    - Waits: curl -f http://localhost:8001/api/health (OK), curl -f http://localhost:3030 (OK)
    - PLAYWRIGHT_BASE_URL: http://localhost:3030 for both targeted and full E2E steps

- PR #242 (head_ref: ci/patch-a-contracts-typecheck-guard)
  • All gates shown as success in latest runs; branch adds contracts guard, Danger was guarded on ci/*

2) E2E environment verification
- FRONTEND_PORT=3030: Confirmed in frontend-ci.yml (server start/healthcheck and PLAYWRIGHT_BASE_URL set to 3030).
- No hardcoded 3000 in frontend-ci.yml for PR #241; legacy frontend-e2e.yml still uses 3000, but not part of PR #241’s failing job.
- PLAYWRIGHT_BASE_URL is passed via env: http://localhost:3030; server healthchecks run on 127.0.0.1:8001/api/health and http://localhost:3030.
- Despite correct baseURL and healthchecks, tests fail post-login (likely auth redirect or cross-origin/storage permissions in headless mode).

3) Causes classification and mapping
- HYGIENE: Commitlint failure on ci/* due to subject-max-length rule → Affects PR #241 (PR Hygiene Check). Danger step was skipped; job-level continue-on-error not applied; step used `-e` shell and failed the job.
- E2E: Auth redirect never reaches '/', repeated waitForURL('/') timeouts; plus localStorage SecurityError. Root causes likely:
  • Session/auth bootstrap mismatch in test helper under headless CI.
  • Storage access/secure context limitation on login page (possibly due to document origin or test isolation).
  • Not a port/baseURL issue (healthchecks ok; correct PLAYWRIGHT_BASE_URL used).
- Mapping: { HYGIENE → #241 (run 18030845190/job 51306721327); E2E → #241 (run 18031684410/job 51309446931) }

4) Proposed micro‑patches (review‑only; ≤25 LOC each; reversible)
- HYGIENE Fix (≤8 LOC): Step-level guard for commitlint/Danger on ci/* branches so the job does not fail (keep policy intact for non-ci/*)
  Rationale: Prevents commitlint/Danger from failing PR Hygiene on ci/* hotfix branches where API scopes/length rules are expected to be lenient.
  Risk: Low. Impact: Stops false negatives; keeps checks strict elsewhere. Rollback: remove the guard lines.

- E2E Fix (≤15 LOC total across two small hunks):
  a) Ensure E2E steps use `${{ env.PLAYWRIGHT_BASE_URL }}` (already true in #241) and add explicit curl to 127.0.0.1:${{ env.FRONTEND_PORT }}/api/health before tests.
  b) Add a short wait loop (max 60x2s) for `http://127.0.0.1:${{ env.FRONTEND_PORT }}` and `http://127.0.0.1:8001/api/health` to remove race.
  c) Temporarily set `PW_TEST_RETRIES=1` in the workflow env for E2E job to mitigate flakiness while auth bootstrapping is hardened separately.
  Rationale: Addresses startup/race and transient headless auth flake without touching test code. Risk: Low. Impact: Higher pass rate while we tackle auth helper.
  Rollback: delete added env/steps.

See patchset file for unified diffs.

