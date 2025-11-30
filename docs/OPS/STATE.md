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

### 2025-11-19 00:00 EET — AG116.7 Complete (README Status Badges)
- Added CI/uptime/e2e status badges to README.md
- Badges: quality-gates, uptime-ping, e2e-prod-smoke workflows
- Improved at-a-glance visibility of production health
- Merged PR: #882

### 2025-11-19 02:30 EET — AG116.8 CODE COMPLETE (DB Observability)
- Implemented pg_stat_statements monitoring infrastructure
- Protected API endpoint: /api/ops/db/slow-queries (X-Ops-Key authentication)
- CLI command: php artisan db:slow-queries --limit=N
- Safe migration (non-fatal if extension unavailable)
- Files: migration, OpsDbController, DbSlowQueries command, config/ops.php
- Merged PR: #883 (+135 lines, 6 files)
- **DEPLOYMENT PENDING**: Awaiting VPS deployment (scripts ready in /tmp/)
- Handoff doc: /tmp/AG116_8_DEPLOYMENT_HANDOFF.md

### 2025-11-18 09:15 EET — AG116.4 Complete & AG116.5 Complete
- Deployed watchdog on VPS (orphan cleanup + health restart)
- E2E smoke workflow scheduled daily at 03:07 EET for https://dixis.io (PR #869)
- Uptime watchdog workflow active (PR #877)

### 2025-11-30 — PRD AUDIT COMPLETE (Documentation Pass)
**Overall Progress**: ~82% of core marketplace functionality complete

**Key Achievements**:
- ✅ Mobile-First UI: PR #1206 (hero), PR #1208 (product cards) merged
- ✅ Shipping Infrastructure: 95% complete - volumetric weight, zone pricing, ACS lockers (star module)
- ✅ Auth & Roles: 100% complete - Laravel Sanctum + AuthGuard production-ready

**Top 3 Critical Gaps** (Block Launch):
1. Payment Flow Wiring: Viva Wallet client ready (272 LOC) but not called from checkout
2. Search & Filter UI: Backend API ready, frontend SearchBar/CategoryPills missing
3. Producer Document Upload: Onboarding exists, file upload component needed

**Documentation Created**:
- `/docs/PRODUCT/PRD-PROGRESS.md` (502 lines) - Comprehensive implementation matrix
- Module-by-module evidence with file paths and line numbers
- 6-pass roadmap to launch-ready (2-3 weeks estimated)

**Next Recommended Pass**:
- **Pass Payment-A**: Wire Viva Wallet to checkout (~250 LOC, 1 PR, HIGH priority)
