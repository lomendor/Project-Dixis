## AG-CI-FAST-LOOP-01
- FAST LOOP: `quality-gates` (light checks) τρέχει σε κάθε PR. `heavy-checks` τρέχει ΜΟΝΟ όταν το PR δεν είναι draft και δεν έχει label `ci:light`.
- e2e-full: Nightly + manual (`e2e-full.yml`).
- Concurrency: cancel-in-progress για PR pipelines.

### 2025-11-18 09:15 EET — Staging hardening complete
- PM2 autostart (systemd) ενεργό
- Certbot timer ενεργός (auto-renew)
- Health: https://staging.dixis.io/api/healthz → 200 OK
- Removed deprecated swcMinify από Next config

### 2025-11-18 16:10 EET — AG116.5 Complete (PR #869 merged)
- ✅ E2E prod smoke workflow (.github/workflows/e2e-prod-smoke.yml) ACTIVE
- Cron: daily 03:07 EET → tests https://dixis.io homepage + CSS loading
- Auto-creates P1-high issue on failure with run artifacts
- Minimal config (playwright.prod-smoke.config.ts) — no globalSetup/webServer
- Runbook: docs/OPS/RUNBOOKS/PROD-WATCHDOG.md

### 2025-11-18 09:15 EET — AG116.4 Complete
- Deployed watchdog on VPS (orphan cleanup + health restart)
- PM2 systemd autostart configured
