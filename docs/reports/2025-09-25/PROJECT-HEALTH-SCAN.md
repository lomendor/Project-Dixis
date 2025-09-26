# Project Health & Risk Scan — Dixis (2025-09-25)

## Executive Summary (10 bullets: risks & quick wins)
- Config drift observed across environments: ports (3000 vs 3001) and env var names (NEXT_PUBLIC_APP_URL vs NEXT_PUBLIC_SITE_URL). Quick win: unify scripts/CI and docs.
- E2E flag drift: docs reference NEXT_PUBLIC_E2E but frontend code centralization (env.ts) doesn’t consume it. Quick win: either wire an IS_E2E flag in env.ts or remove from docs.
- High‑churn hotspots around checkout/cart/shipping E2E and backend routes/migrations; add a few focused integration tests to stabilize.
- CI is comprehensive but inconsistent on FE ports (3000 vs 3030 vs 3001). Quick win: standardize to 3001 (dev/webServer) and one production test port across workflows.
- Secrets posture looks healthy (.env.example uses placeholders), but add a token scanner to CI for prevention.
- Feature flags (backend: SHIPPING_ENABLE_LOCKERS, LOCKER_DISCOUNT_EUR, SHIPPING_ENABLE_COD, PAYMENT_PROVIDER, courier toggles) documented in .env.example; create a single flag registry in docs.
- API base URL is centrally controlled (NEXT_PUBLIC_API_BASE_URL) with fallbacks; keep this as SSOT and discourage ad‑hoc env usage in tests.
- Playwright config is sound; ensure PLAYWRIGHT_BASE_URL usage matches standardized FE port.
- Documentation breadth is strong (reports, guides). Quick win: link the new flag/port registry from PR template.
- Adopt a lightweight “configuration guard” CI step (danger + shell checks) to fail early on drift.

## Risk Map
| area | risk | likelihood | impact | mitigation | owner |
|---|---|---|---|---|---|
| Config/Ports | Drift between 3000/3001/3030 across workflows | High | Med-High | Standardize to 3001 for dev/webServer and one CI port; add CI guard | Dev Infra |
| Env Vars | NEXT_PUBLIC_APP_URL vs NEXT_PUBLIC_SITE_URL | High | Medium | Canonicalize NEXT_PUBLIC_SITE_URL; update docs and PR checks | Frontend Lead |
| E2E Flags | NEXT_PUBLIC_E2E not consumed by code | Med | Medium | Implement IS_E2E in env.ts or remove from docs; enforce via danger | QA Lead |
| Checkout | High churn/touch; fragile across API errors | Med | High | Add 2–3 integration tests (5xx fallback, totals, flag off/on) | Checkout Owner |
| Backend Flags | Shipping/Courier flags inconsistently documented | Med | Medium | Create unified feature flag registry | Backend Lead |
| CI Stability | Mixed timeouts/ports across files | Med | Medium | Normalize ports/timeouts; central wait-on util | Dev Infra |
| Secrets | Accidental token commits | Low | High | Add gitleaks/secretlint to CI | Security |
| Docs | Docs/code drift | Med | Medium | Link registry + guard job; keep reports updated | Eng Mgr |
| Contracts | FE/BE contract changes impact E2E | Med | Medium | Contract tests or schema snapshot | QA Lead |
| Performance | Lighthouse only in one workflow | Low | Medium | Keep LHCI baseline step scheduled | Dev Infra |

## Hotspots (Top 10 by churn + qualitative dependency criticality)
1) frontend/package.json — frequent edits; scripts affect CI and local dev
2) backend/routes/api.php — API surface; high coupling to FE tests
3) backend/database/seeders/DatabaseSeeder.php — seeds for E2E stability
4) backend/database/migrations/*update_order_status_enums*.php — order domain critical
5) frontend/tests/e2e/smoke.spec.ts — central smoke
6) frontend/playwright.config.ts — baseURL/ports; test topology
7) frontend/src/app/cart/page.tsx — cart UX; high coupling to checkout
8) frontend/tests/global-setup.ts — auth/storage state; test stability
9) .github/workflows/frontend-ci.yml — CI behavior (ports 3030 etc.)
10) .github/workflows/frontend-e2e.yml — CI behavior (ports 3000)

## Config Drift / Env Flags
- Ports
  - Standards in docs: FE 3001, API 8001; Playwright dev webServer uses 3001
  - CI uses 3000 (frontend-e2e.yml) and 3030 (frontend-ci.yml e2e job)
  - Recommendation: adopt 3001 for dev/dev-webServer and 3030 for CI E2E (single choice), document and enforce
- Env Names
  - Frontend centralization uses NEXT_PUBLIC_SITE_URL (code), docs mention NEXT_PUBLIC_APP_URL
  - Recommendation: Canonicalize NEXT_PUBLIC_SITE_URL, update docs and PR template
- Flags
  - Frontend: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SITE_URL; docs reference NEXT_PUBLIC_E2E (not used)
  - Backend: SHIPPING_ENABLE_LOCKERS, LOCKER_DISCOUNT_EUR, SHIPPING_ENABLE_COD, PAYMENT_PROVIDER, COURIER_*; LOCALE
  - Recommendation: Create docs/Feature-Flags.md registry: key, default, consumer files, rollout plan; add danger check for unknown flags

## Test Coverage Estimation (heuristic)
- Cart: Medium — page + API client validation exists; add edge-case totals and quantity update flows
- Checkout: Medium-Low — resilience helpers present; add 5xx fallback and timeout retry path tests
- Shipping: Medium — CI focuses on shipping flows; add “flag off” negative and locker-disabled paths
- Auth: Medium — storageState in global-setup; add session-expiry and unauthorized redirects

Integration Gaps (high-value)
- API 5xx fallback for checkout/shipping quotes
- Shipping feature flag on/off matrix (enable_lockers / cod)
- Consistency of PLAYWRIGHT_BASE_URL vs Next server port across workflows

## Secrets & Safety (light pass)
- backend/.env.example includes placeholders; no live tokens
- Add gitleaks or secretlint in CI; ensure .env* in .gitignore

## Day-By-Day Plan (10 days)
Day 1
- Create Feature-Flags registry doc [owner: Dev Infra] [impact: Med] [deps: none]
- Draft Config Guard CI script (ports/env/flags) [owner: Dev Infra] [impact: High] [deps: none]
- Decide on canonical FE port for CI (3001 vs 3030) [owner: Eng Mgr] [impact: High] [deps: none]

Day 2
- Update PR template to link registry and guard expectations [owner: Dev Infra] [impact: Med] [deps: Day1]
- Normalize docs: use NEXT_PUBLIC_SITE_URL, deprecate NEXT_PUBLIC_APP_URL [owner: Frontend Lead] [impact: Med] [deps: Day1]
- Decide on NEXT_PUBLIC_E2E policy (implement or remove) [owner: Frontend Lead/QA] [impact: Med] [deps: none]

Day 3
- Implement Config Guard CI job (danger + shell checks) [owner: Dev Infra] [impact: High] [deps: Day1]
- Add secret scanning (gitleaks/secretlint) [owner: Security] [impact: High] [deps: none]

Day 4
- Add E2E tests: checkout 5xx fallback, timeout retry [owner: QA Lead] [impact: High] [deps: Day3]
- Add E2E tests: shipping flag off/on [owner: QA Lead] [impact: High] [deps: Day3]

Day 5
- Stabilize PLAYWRIGHT_BASE_URL usage vs port selection across workflows [owner: Dev Infra] [impact: Med] [deps: Day1]
- Document FE/BE contract assertions for shipping quote [owner: QA Lead] [impact: Med] [deps: none]

Day 6
- Add CI wait-on utility standardization (single script) [owner: Dev Infra] [impact: Med] [deps: Day3]
- Add minimal contract/schema snapshot tests [owner: QA Lead] [impact: Med] [deps: Day5]

Day 7
- Add danger rule to flag unknown env variables/flags in PRs [owner: Dev Infra] [impact: Med] [deps: Day3]
- Update Lighthouse schedule/baseline confirmation [owner: Dev Infra] [impact: Low] [deps: none]

Day 8
- Close docs/code loop: update any remaining references to deprecated envs [owner: Frontend Lead] [impact: Med] [deps: Day2]
- Add README “Runbook: Local + CI Ports & Flags” [owner: Dev Infra] [impact: Med] [deps: Day1]

Day 9
- Add targeted integration tests for cart totals and quantity edge cases [owner: QA Lead] [impact: Med] [deps: Day4]
- Add unauthorized redirect tests (auth) [owner: QA Lead] [impact: Med] [deps: none]

Day 10
- Rollup PR: Adopt canonical ports in workflows after Claude’s branch merges [owner: Dev Infra] [impact: High] [deps: Merge readiness]
- Post-merge verification and update the Health Scan [owner: Eng Mgr] [impact: Med] [deps: Day10]

## Stop Doing List
- Don’t refactor checkout/cart code paths until integration tests land
- Don’t rename env vars again without updating the registry and guard
- Don’t change CI ports while Claude is running rebase/merge/smoke; defer to Day 10
- Don’t add new feature flags without updating the registry and tests

## Top 5 Immediate Actions
- Establish canonical FE port for CI and document it (3001 or 3030) with a guard
- Canonicalize NEXT_PUBLIC_SITE_URL; remove/deprecate NEXT_PUBLIC_APP_URL
- Decide NEXT_PUBLIC_E2E policy; implement IS_E2E in env.ts or remove from docs
- Add a CI configuration guard step (ports/env names/flags)
- Add secret scanning (gitleaks/secretlint) into CI pipelines

## 3 Biggest Risks + Mitigation
- Config drift (ports/env names) — Add CI guard + one source of truth doc; adopt canonical ports
- E2E flag inconsistency — Implement or remove NEXT_PUBLIC_E2E; enforce via danger
- Checkout/shipping fragility — Add focused integration tests (5xx fallback, flag off/on, totals) and freeze non‑essential changes

