# GitHub Situation Room — 2025-09-25

## TL;DR
- Working tree is dirty: 1 unstaged change blocks clean rebase (`docs/reports/2025-09-22/PR-216-CHECKS.json`).
- All target PRs (#232–#236) are OPEN and mergeable; most CI jobs fail on frontend/e2e; #236 is low-risk (scripts/docs) with tests green except long-running jobs.
- Branch divergence: all PR heads are 0 behind `main` (only ahead 1–4 commits). Rebases are optional; recommend rebasing #235, then #232 for clean history.
- Highest conflict risk: #235 (touches `frontend/package.json` and `frontend/playwright.local.ts`); others mostly docs/tests.
- Top flake patterns: checkout CTA timeout (i18n), localStorage SecurityError, dev 500s, selector drift on product-card/cart-item, network idle waits.

## PR Inventory (232–236)

| PR | branch | checks | last runs (latest → older) | blockers | action |
|---:|---|---|---|---|---|
| 232 | chore/e2e-baseurl-and-testids | failing (frontend-ci) | frontend-ci: failure · DangerJS: success · Danger: success | e2e/fe instability | Rebase on main after #235; rerun; merge when green |
| 233 | chore/code-map-architecture | failing (CI Pipeline, QA) | frontend-ci: failure · QA Gates: failure · CI Pipeline: failure | docs-only but global checks failing | Queue after E2E stabilization or admin-merge |
| 234 | chore/repo-ownership-and-pr-guards | failing (CI/FE) | CI Pipeline: failure · frontend-ci: failure · Danger: success | docs/governance only | Queue after E2E; admin-merge acceptable |
| 235 | chore/e2e-env-hardening-auth-i18n | failing (CI/FE) | CI Pipeline: failure · frontend-ci: failure · Danger: success | touches package.json/playwright | Rebase first; resolve conflicts; rerun |
| 236 | fix/legacy-pages-api-return-object | mixed (PR Hygiene failure; FE tests success; others in progress) | DangerJS: success · Danger PR: success · Lighthouse: in progress | PR Hygiene Check failing | Re-run hygiene or override; merge early (low risk) |

Notes:
- Links: 232 https://github.com/lomendor/Project-Dixis/pull/232 · 233 https://github.com/lomendor/Project-Dixis/pull/233 · 234 https://github.com/lomendor/Project-Dixis/pull/234 · 235 https://github.com/lomendor/Project-Dixis/pull/235 · 236 https://github.com/lomendor/Project-Dixis/pull/236
- Run samples:
  - 232: https://github.com/lomendor/Project-Dixis/actions/runs/17996100834 (frontend-ci: failure)
  - 233: https://github.com/lomendor/Project-Dixis/actions/runs/17996586193 (frontend-ci: failure)
  - 234: https://github.com/lomendor/Project-Dixis/actions/runs/18001992075 (CI Pipeline: failure)
  - 235: https://github.com/lomendor/Project-Dixis/actions/runs/18009083173 (CI Pipeline: failure)
  - 236: https://github.com/lomendor/Project-Dixis/actions/runs/18010222212 (DangerJS: success)

## Local Git — Branch Health

Working tree: DIRTY
- Unstaged: `docs/reports/2025-09-22/PR-216-CHECKS.json`

Ahead/Behind vs origin/main:

| branch | ahead/behind | rebase risk |
|---|---:|---|
| chore/e2e-baseurl-and-testids | 3/0 | Low (docs/tests only) |
| chore/code-map-architecture | 4/0 | Low (docs + tests) |
| chore/repo-ownership-and-pr-guards | 1/0 | Low (docs/CODEOWNERS) |
| chore/e2e-env-hardening-auth-i18n | 1/0 | High (`frontend/package.json`, `frontend/playwright.local.ts`) |
| fix/legacy-pages-api-return-object | 2/0 | Low (scripts/docs only) |

## Rebase/Sync Simulation (focus: #235, #232)

- #235 vs main — potential conflict paths:
  - frontend/package.json (scripts/deps) — manual merge recommended.
  - frontend/playwright.local.ts — prefer PR version (ours) if new file; otherwise keep PR’s explicit test config.
  - frontend/src/components/** (CartSummary/CartMiniPanel) — manual if main changed adjacent lines.
- #232 vs main — low risk; mostly docs and tests.

Suggested resolution policy:
- package.json: start from main (theirs), then re-apply PR-only script additions (e2e/local/test scripts) and keep engines/deps from main.
- playwright.local.ts: keep PR version (ours).
- docs conflicts: prefer main (theirs) to reduce churn; re-add new report links if needed.

## CI & Flakiness Snapshot

Recent runs per PR (last 3):
- 232 chore/e2e-baseurl-and-testids
  - frontend-ci: failure · DangerJS: success · Danger PR: success
- 233 chore/code-map-architecture
  - frontend-ci: failure · Pull Request Quality Gates: failure · CI Pipeline: failure
- 234 chore/repo-ownership-and-pr-guards
  - CI Pipeline: failure · frontend-ci: failure · Danger PR: success
- 235 chore/e2e-env-hardening-auth-i18n
  - CI Pipeline: failure · frontend-ci: failure · Danger PR: success
- 236 fix/legacy-pages-api-return-object
  - DangerJS: success · Danger PR: success · Lighthouse CI: in progress

Top 5 flake/error patterns + quick fixes:
- Checkout CTA timeout (i18n): use role-based query with i18n fallback; ensure Greek string exists; add data-testid `checkout-submit-btn`.
- localStorage SecurityError: set storageState; ensure same-origin before accessing localStorage; use `page.addInitScript` after navigation.
- Dev 500s during tests: run `npm run build && npm start` for e2e; add health checks; avoid Next dev server for CI.
- Selector drift (product-card/cart-item): enforce stable `data-testid` coverage; replace brittle nth-of-type queries.
- Network idle waits: replace `networkidle` with explicit waits for selectors/responses; add retries.

## Merge Plan (low-risk first)
1) Merge #236 (hotfix/dev scripts). Rationale: low risk, reduces dev noise; only docs/scripts. If PR Hygiene fails, re-run or admin-override.
2) Rebase #235 onto `main`; resolve `frontend/package.json` and `frontend/playwright.local.ts`; re-run CI; merge when FE/E2E green.
3) Rebase #232 onto updated `main`; re-run CI; merge when green (depends on #235 env changes).
4) Queue #233 (docs/architecture). Merge after E2E stabilizes or admin-override as docs-only.
5) Queue #234 (governance/CODEOWNERS). Merge last; docs-only; admin-override acceptable.

## Immediate Next 3 Commands

```bash
# 1) stash local changes to unblock rebase
git stash push -u -m "situation-room-2025-09-25"
# 2) update refs
git fetch origin --prune
# 3) try rebase of #235 first
gh pr checkout 235 && git rebase origin/main
```

