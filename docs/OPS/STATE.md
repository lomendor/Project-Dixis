## AG-CI-FAST-LOOP-01
- FAST LOOP: `quality-gates` (light checks) τρέχει σε κάθε PR. `heavy-checks` τρέχει ΜΟΝΟ όταν το PR δεν είναι draft και δεν έχει label `ci:light`.
- e2e-full: Nightly + manual (`e2e-full.yml`).
- Concurrency: cancel-in-progress για PR pipelines.

### 2025-11-18 09:15 EET — Staging hardening complete
- PM2 autostart (systemd) ενεργό
- Certbot timer ενεργός (auto-renew)
- Health: https://staging.dixis.io/api/healthz → 200 OK
- Removed deprecated swcMinify από Next config

### 2025-11-18 22:00 EET — AG116.6 Complete (Uptime Watchdog Fix)
- Fixed GITHUB_OUTPUT delimiter collision in uptime-ping.yml
- Applied base64 encoding fallback (PR #880) after 3 failed attempts (#878, #879)
- Verified: https://dixis.io/api/healthz → 200 OK, no delimiter errors
- Workflow: runs every 15 min, auto-creates issues on failure
- Merged PRs: #877 (permissions), #878 (EOF fix), #879 (timestamp), #880 (base64)

### 2025-11-18 09:15 EET — AG116.4 Complete & AG116.5 Complete
- Deployed watchdog on VPS (orphan cleanup + health restart)
- E2E smoke workflow scheduled daily at 03:07 EET for https://dixis.io (PR #869)
- Uptime watchdog workflow active (PR #877)
