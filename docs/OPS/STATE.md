## AG-CI-FAST-LOOP-01
- FAST LOOP: `quality-gates` (light checks) τρέχει σε κάθε PR. `heavy-checks` τρέχει ΜΟΝΟ όταν το PR δεν είναι draft και δεν έχει label `ci:light`.
- e2e-full: Nightly + manual (`e2e-full.yml`).
- Concurrency: cancel-in-progress για PR pipelines.

### 2025-11-18 09:15 EET — Staging hardening complete
- PM2 autostart (systemd) ενεργό
- Certbot timer ενεργός (auto-renew)
- Health: https://staging.dixis.io/api/healthz → 200 OK
- Removed deprecated swcMinify από Next config

### 2025-11-18 — AG116.4 Complete & AG116.5 Init
- Deployed watchdog on VPS (orphan cleanup + health restart)
- Adding scheduled E2E smoke workflow for https://dixis.io
