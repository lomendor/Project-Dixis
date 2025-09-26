# CI Stabilization RCA (2025-09-26)

Scope
- Workflows scanned: .github/workflows/frontend-ci.yml, frontend-e2e.yml, fe-api-integration.yml, lighthouse.yml, danger.yml, dangerjs.yml, pr.yml, frontend/.github/workflows/pr.yml
- PRs sampled: #213 (workflow consolidation), #220 (guardrails), #223 (dependabot setup-node v5)
- Goal: Diagnose dominant CI failure modes and propose ≤25 LOC, workflow-only, reversible fixes for the next 72h

Executive Summary (≤5 bullets)
- Port/baseURL drift across workflows (3000/3030/3010) creates flaky E2E and LHCI; normalize via single env and pass-through
- Dependabot runs trigger heavy jobs and fail on TS/contract resolution; add bot guards and smoke-only paths
- Type-check fails on @dixis/contracts when contracts weren’t built in frontend-only jobs; ensure conditional contracts build or mock types
- PR quality workflows overlap and sometimes double-run; use consistent paths-ignore and concurrency groups
- Missing/weak actor guards cause “No tests found” or backend-unavailable failures; add safe grep and health checks

Failure Taxonomy → Evidence → Affected
1) Type-check failing on missing @dixis/contracts
- Evidence: frontend-ci dependabot-smoke job log (TS2307 cannot find module '@dixis/contracts/shipping')
- Affected: bot PRs (e.g., #223), any PR without contracts build step

2) Port/baseURL inconsistencies (3000 vs 3030 vs 3010)
- Evidence: frontend-e2e uses PLAYWRIGHT_BASE_URL=localhost:3000; frontend-ci uses 3030; lighthouse binds 3010
- Affected: E2E and Lighthouse; intermittent timeouts and wrong baseURL

3) Heavy jobs running for bots
- Evidence: Multiple workflows missing actor guards or with partial guards; runs on dependabot then fail for unrelated app logic
- Affected: bot PRs, queue contention

4) PR quality overlap and triggers
- Evidence: pr.yml vs danger.yml/dangerjs.yml; duplicate gates on same events; inconsistent actions/setup-node versions
- Affected: inconsistent signals; longer queues; possible conflicts

5) Health checks and safe test discovery
- Evidence: fe-api-integration uses postgres service; need pg_isready user; E2E needs Next + API readiness; No tests found on grep
- Affected: flakiness on cold starts; false negatives

72h Minimal Fix Plan (workflow-only; ≤25 LOC each)
1) Contracts type-check guard in frontend-ci
- What: Before type-check, conditionally build packages/contracts if present; else create minimal d.ts shims for @dixis/contracts
- Why: Prevent TS2307 failures when contracts aren’t built; impacts dependabot and docs-only PRs
- Patch: see Patch A

2) Canonical PLAYWRIGHT_BASE_URL via env and single PORT
- What: Set FRONTEND_PORT=3030 (canonical) and always pass PLAYWRIGHT_BASE_URL=http://localhost:${FRONTEND_PORT}
- Why: Remove port drift; stabilize E2E
- Patch: see Patch B

3) Dependabot lightweight path across workflows
- What: Add if: github.actor guards to skip heavy jobs and run smoke/type-check only
- Why: Reduce failures and queue load
- Patch: see Patch C

4) PR gate consolidation alignment
- What: Ensure danger.yml stays soft, dangerjs.yml is canonical hard gate; add consistent paths-ignore and concurrency
- Why: Avoid duplicated signals; clear expectations
- Patch: see Patch D

5) Health checks hardening
- What: Use pg_isready -U postgres; add wait-for ports for 3030/8001; add safe grep shell for Playwright
- Why: Reduce flaky timing errors
- Patch: see Patch E

Rollback Strategy
- All patches are ≤25 LOC and can be reverted individually per file
- No changes to application code; only workflow YAML and small shell script additions

Proposed Patches (Unified Diffs)
- See CI-RCA.patchset.md for complete diffs (≤25 LOC each)

Next Steps
- Apply Patch B first (port/baseURL normalization), then Patch A (contracts guard), then Patch C (bot guards)
- Coordinate with Claude to avoid interference with ongoing rebase/merge

