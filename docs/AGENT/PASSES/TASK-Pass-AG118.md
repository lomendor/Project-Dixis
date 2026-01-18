## What
Post-deploy hardening: E2E nightly, uptime cron, faster deploy via caches.

## Why
Stability (catch regressions), availability (quick signal), speed (faster rsync/build).

## How
- New workflows: .github/workflows/e2e-full.yml, uptime-healthz.yml
- Rewrite deploy-prod.yml with DBURL guard + remote caches.
- No secrets printed; required check remains quality-gates.
