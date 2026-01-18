# NEXT 7 DAYS

**Last Updated**: 2026-01-18 (Pass-PAYMENTS-STRIPE-ELEMENTS-01 CLOSED)

> **Entry point**: `docs/ACTIVE.md` | **Archive**: `docs/OPS/STATE-ARCHIVE/`

## WIP (1 item only)
_(empty — no active pass)_

## NEXT (ordered, max 3)

### Unblocked (ready to start)

_(No unblocked pass — see docs/PRODUCT/PRD-MUST-V1.md for V1 status)_

See `docs/OPS/STATE.md` for full DoD checklists.
See `docs/AGENT/SOPs/CREDENTIALS.md` for VPS enablement steps.
See `docs/PRODUCT/PRD-AUDIT.md` for full gap analysis.

---

## Credentials Status

### Pass 52 — Card Payments (Stripe) ✅ ENABLED

Card payments are live on production.

### Pass 60 — Email Notifications (Resend) ✅ ENABLED

Email is live on production via Resend. Verified 2026-01-17 via `/api/health`:
- `email.flag`: enabled
- `email.configured`: true
- `keys_present.resend`: true

---

## How to Run E2E Full Manually

1. Go to GitHub Actions → "E2E Full (nightly & manual)"
2. Click "Run workflow"
3. Optional: Enter grep filter (e.g., `@regression`)
4. Artifacts: `e2e-full-report-{run_number}` (playwright-report + test-results)

## Recently Completed (2026-01-14 to 2026-01-18)

- **Pass PAYMENTS-STRIPE-ELEMENTS-01** — Stripe Elements integration (embedded card form in checkout) ✅
- **Pass PAYMENTS-CARD-REAL-01** — Card payment E2E with real auth (deploy workflow fixed, GitHub secret added) ✅
- **Pass ENV-FRONTEND-PAYMENTS-01** — VPS frontend env for card payments (Stripe vars added, deploy fixed) ✅
- **Pass CARD-PAYMENT-SMOKE-01** — Card payment E2E smoke tests (backend config verified, frontend env blocker identified) ✅
- **Pass PROD-UNBLOCK-01** — Production auth/products verification (all working, shell escaping was cause) ✅
- **Pass EMAIL-SMOKE-01** — VPS → Resend e2e smoke (artisan test + reset endpoint) ✅
- **Pass OPS-SSH-HYGIENE-01** — Canonical SSH access (alias + key cleanup + docs) ✅
- **Pass OPS-EMAIL-UNBLOCK-01** — Email now live on production (Resend verified) ✅
- **Pass OPS-EMAIL-ENABLE-01** — VPS env configured (RESEND_KEY present) ✅
- **Pass EMAIL-AUTH-01** — Password Reset via Resend (backend + frontend + tests) ✅
- **Pass 60.1** — Email Verify Tooling (from_configured + Artisan test command) ✅
- **Pass 60** — Email Enable (health diagnostic, now enabled) ✅
- **Pass 52** — Stripe Enable (health diagnostic, Stripe live on prod) ✅
- **CREDENTIALS-01** — Credential wiring map for Pass 52/60 ✅
- **PRD-AUDIT-REFRESH-01** — Refresh audit after 8 passes (91% health) ✅
- **PRD-AUDIT-STRUCTURE-01** — Page inventory + flows + V1 must-haves ✅
- **EN-LANGUAGE-02** — Extend i18n to checkout, orders, producer pages ✅
- **PRODUCER-DASHBOARD-01** — i18n + notifications link + E2E tests ✅
- **NOTIFICATIONS-01** — Notification bell + page UI (NotificationBell, NotificationDropdown, /account/notifications) ✅
- **EN-LANGUAGE-01** — English language support with LocaleContext + language switcher ✅
- **SEARCH-FTS-01** — Full-text product search with PostgreSQL FTS + ranking ✅
- **ADMIN-USERS-01** — Admin user management UI at /admin/users ✅
- **GUEST-CHECKOUT-01** — Guest checkout enabled (no auth required to purchase) ✅
- **OPS-STATE-THIN-01** — Thin STATE + archive (1009→385 lines, history preserved) ✅
- **OPS-ACTIVE-01** — Create ACTIVE.md entry point (reduced boot tokens from ~3000 to ~800) ✅
- **PRD-AUDIT-01** — PRD→Reality mapping (111 features, 88% health score, gaps identified) ✅
- **SEC-ROTATE-01** — SSH key rotation (old keys removed, new key installed) ✅
- **SEC-LOGWATCH-01** — Local log monitoring (auth, fail2ban, nginx) ✅
- **SEC-EGRESS-01** — Egress monitoring + fail2ban tightening ✅
- **SEC-WATCH-01** — Hardening baseline + watchdog (48h post-incident verification) ✅
- **TEST-COVERAGE-01** — Expand @smoke test coverage (4 new tests: producers, contact, terms, privacy) ✅
- **TEST-UNSKIP-02** — Add 5 CI-safe @smoke page load tests (PDP, cart, login, register, home) ✅
- **OPS-PM2-01b** — STATE.md housekeeping for OPS-PM2-01 ✅
- **OPS-PM2-01** — Deploy workflow readiness gate (prevents 502 after deploy) ✅
- **OPS-CANONICAL-PATHS-01** — Canonical VPS paths in deploy workflows ✅
- **OPS-VERIFY-01** — Deploy verification proof standard (curl-based) ✅

## Recently Completed (Pass 58-63 + SMOKE-STABLE + E2E-FULL + AUTH-CRED)

- **AUTH-CRED-01** — CORS Credentials for Sanctum Auth (fixes intermittent logout) ✅
- **SMOKE-STABLE-01** — E2E Test Policy (PR gate @smoke only, nightly for @regression) ✅
- **E2E-FULL-01** — Nightly regression suite documentation ✅

- **Pass 58** — Producer Order Status Updates (status buttons on /my/orders) ✅
- **Pass 59** — Stabilize PROD Smoke reload-and-css ✅
- **Pass 61** — Admin Dashboard Polish (Laravel API integration) ✅
- **Pass 62** — Orders/Checkout E2E Guardrail (consumer journey tests) ✅
- **Pass 63** — Smoke Readiness Gate (healthz polling with backoff) ✅
- **MONITOR-01** — Uptime Alerting (GitHub Issue on failure) ✅
- **MONITOR-02** — Alert Drill (proved alerting pipeline works) ✅
- **TEST-UNSKIP-01** — Enable Skipped E2E Tests (8 tests unskipped from orders flow) ✅
- **TEST-UNSKIP-02-CORRECTION** — Re-skipped SSR tests (were not actually running) ✅
- **TEST-UNSKIP-03** — False-Green Prevention (count assertion + e2e-full rewrite) ✅
- **E2E-SEED-01** — Deterministic CI Seeding (seed-ci.ts + mock API + 2 @smoke tests) ✅
- **E2E-SEED-02** — Products Page Smoke Tests (CI-safe, 4 total @smoke tests now) ✅
- **CRED-01** — Credential Inventory (VPS enablement guide for Pass 52/60) ✅

## Previously Completed (Pass 45-57)

- **Pass 45** — Deploy Workflow Hardening ✅
- **Pass 46** — CI E2E Auth Setup ✅
- **Pass 47** — Production Healthz & Smoke-Matrix Policy ✅
- **Pass 48** — Shipping Display in Checkout & Order Details ✅
- **Pass 49** — Greek Market Validation ✅
- **Pass 50** — Zone-Based Shipping Pricing ✅
- **Pass 51** — Card Payments via Stripe (feature flag) ✅
- **Pass 53** — Order Email Notifications (consumer + producers) ✅
- **Pass 54** — Order Status Update Emails (shipped/delivered) ✅
- **Pass 55** — Weekly Producer Digest (order stats email) ✅
- **Pass 56** — Producer Orders Split-Brain Fix (Laravel API for /my/orders) ✅
- **Pass 57** — Producer Orders CSV Export (export button + API) ✅

---

## Rules

### WIP Limit = 1
Only ONE item in WIP at any time. No exceptions.

### DoD Required
Every item must have measurable Definition of Done before starting work.

### State Updates
After completing WIP item:
1. Move to DONE section
2. Update `docs/OPS/STATE.md` (move from IN PROGRESS to STABLE/CLOSED)
3. Pull next item from NEXT to WIP
4. Run `./scripts/prod-facts.sh` to verify PROD still healthy

### Estimation
Optional but helpful for planning. Reality: most tasks take 2-4 hours of focused work.

---

## References
- Data dependency map: `docs/PRODUCT/DATA-DEPENDENCY-MAP.md`
- Decision gate SOP: `docs/OPS/DECISION-GATE.md`
- Current state: `docs/OPS/STATE.md`
