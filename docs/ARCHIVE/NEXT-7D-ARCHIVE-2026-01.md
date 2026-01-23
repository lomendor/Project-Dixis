# NEXT-7D Archive — January 2026

**Archived**: 2026-01-23 (DOCS-NEXT7D-HYGIENE-01)

> Contains completed items moved from `docs/NEXT-7D.md` to reduce file size.
> For current active work, see `docs/NEXT-7D.md`.

---

## Completed Passes (2026-01-19 to 2026-01-23)

### UI/UX Improvements

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| UI-HEADER-NAV-IA-02 | Header Navigation IA Enhancement | PR #2365 (`d8f1b41a`) | `Pass-UI-HEADER-NAV-IA-02.md` |
| UI-NAV-HEADER-01 | Header Navigation IA Fix | PR #2362 (`0d31b905`) | `Pass-UI-NAV-HEADER-01.md` |
| UI-HEADER-NAV-CLARITY-01 | Move language switcher to footer | PR #2387 (`9014f00a`) | `Pass-UI-HEADER-NAV-CLARITY-01.md` |
| UI-A11Y-EL-01 | Greek localization and accessibility | PR #2367 (`3ed150cf`) | `Pass-UI-A11Y-EL-01.md` |
| UI-HEADER-POLISH-01 | Header UX improvements (logo, cart) | PR #2415 | `Pass-UI-HEADER-POLISH-01.md` |
| UI-HEADER-IA-01 | Header/Navigation verification | — | `Pass-UI-HEADER-IA-01.md` |

### CI Reliability

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| CI-FLAKE-LOCALE-01 | Stabilize locale.spec.ts | PR #2364 (`74a13747`) | `Pass-CI-FLAKE-LOCALE-01.md` |
| CI-FLAKE-NOTIFICATIONS-01 | Fix notification bell flaky test | PR #2379 (`7a1d1408`) | `Pass-CI-FLAKE-NOTIFICATIONS-01.md` |
| CI-FLAKE-FILTERS-SEARCH-01 | Stabilize filters-search E2E | PR #2344 (`d91bd969`) | `Pass-CI-FLAKE-FILTERS-SEARCH-01.md` |
| CI-FLAKE-FILTERS-SEARCH-02 | Further stabilization | PR #2346 (`a82b2b83`) | `Pass-CI-FLAKE-FILTERS-SEARCH-02.md` |
| SMOKE-FLAKE-01 | Healthz probe timeouts | PR #2319 | — |
| CI-NEON-COMPUTE-01 | Neon compute audit | — | `Pass-CI-NEON-COMPUTE-01.md` |

### Performance

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| PERF-PRODUCTS-CACHE-01 | Add revalidate + Cache-Control | PR #2317 (`dcd0fdd2`) | — |
| PERF-BASELINE-CAPTURE-01 | Baseline capture (all < 300ms) | `6a9baef3` | — |
| PERF-SWEEP-PAGES-01 | Performance sweep | — | `Pass-PERF-SWEEP-PAGES-01.md` |
| PERF-COLD-START-01 | Cold start investigation | — | Resolved (no fix needed) |

### Order/Checkout

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| ORDERS-TOTALS-01 | Order totals pattern | PR #2420 | — |
| ORDERS-TOTALS-FIX-01 | Order totals verification | PR #2416 | — |
| ORDER-TOTALS-INVARIANTS-01 | Fix totals breakdown | PR #2412 | `Pass-ORDER-TOTALS-INVARIANTS-01.md` |
| ORD-TOTALS-SHIPPING-01 | Order totals investigation | — | `Pass-ORD-TOTALS-SHIPPING-01.md` |

### Security

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| SEC-AUTH-RL-02 | Auth rate limiting | — | `Pass-SEC-AUTH-RL-02.md` |

### Email

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| EMAIL-UTF8-01 | Fix Greek email encoding | PR #2357 (`b52072d4`) | `Pass-EMAIL-UTF8-01.md` |
| PROD-EMAIL-UTF8-PROOF-01 | Production UTF-8 verification | — | `Pass-PROD-EMAIL-UTF8-PROOF-01.md` |
| EMAIL-PROOF-01 | Email delivery verification | — | `Pass-EMAIL-PROOF-01.md` |
| OPS-EMAIL-PROOF-01 | Email proof runbook | — | — |

### Ops/Deploy

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| OPS-DEPLOY-SSH-RETRY-01 | SSH retry + post-deploy proof | PR #2408 | `Proof-OPS-DEPLOY-SSH-RETRY-01.md` |
| OPS-POST-LAUNCH-CHECKS-01 | Scheduled monitoring | — | `Pass-OPS-POST-LAUNCH-CHECKS-01.md` |
| OPS-PROD-FACTS-HYGIENE-01 | prod-facts.sh output hygiene | — | `Pass-OPS-PROD-FACTS-HYGIENE-01.md` |
| MONITORING-REGEX-01 | Fix prod-facts false positive | PR #2397 (`6a9baef3`) | — |
| POST-V1-MONITORING-01 | 24h post-launch check | PR #2348 (`dea61070`) | — |
| VPS-MAINT-WINDOW-01 | VPS maintenance window | — | `Pass-VPS-MAINT-WINDOW-01.md` |
| POST-LAUNCH-CHECKS-01 | Post-launch monitoring | — | `Pass-POST-LAUNCH-CHECKS-01.md` |
| LAUNCH-EXECUTE-01 | V1 Launch execution | — | `Pass-LAUNCH-EXECUTE-01.md` |

### Documentation

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| DOCS-LAUNCH-PACKAGE-01 | V1 Launch Package | — | `Pass-DOCS-LAUNCH-PACKAGE-01.md` |
| DOCS-LAUNCH-ANNOUNCE-01 | V1 Announcement materials | — | `Pass-DOCS-LAUNCH-ANNOUNCE-01.md` |
| ADMIN-IA-01 | Admin Dashboard IA | — | — |
| PRODUCER-IA-01 | Producer Dashboard IA | PR #2418 | `PRODUCER-DASHBOARD-V1.md` |
| PRODUCER-DASHBOARD-IA-01 | Producer Dashboard IA Audit | — | `Pass-PRODUCER-DASHBOARD-IA-01.md` |

### QA Execution

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| V1-QA-EXECUTE-01 | V1 QA runbook execution | PR #2395 | `Proof-V1-QA-EXECUTE-01-2026-01-22.md` |
| V1-QA-RUNBOOK-AND-E2E-PLAN-01 | QA runbook + E2E plan | — | — |
| V1-QA-EXECUTE-01-3 | Re-verification 3 | — | `Pass-V1-QA-EXECUTE-01-3.md` |
| V1-QA-EXECUTE-01-5 | Re-verification 5 | — | `Pass-V1-QA-EXECUTE-01-5.md` |
| V1-QA-EXECUTE-01-6 | Re-verification 6 | — | `Pass-V1-QA-EXECUTE-01-6.md` |

### MVP/Launch

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| MVP-CHECKLIST-01 | Gap analysis | PR #2320 | — |
| EMAIL-EVENTS-01 | Order email verification | — | — |
| CART-SYNC-01 | Backend cart sync | PR #2322 | — |
| ANALYTICS-BASIC-01 | Privacy-friendly analytics | PR #2350 (`8cc2b56b`) | — |
| USER-FEEDBACK-LOOP-01 | Feedback loop | PR #2351 (`8d073fe2`) | — |

### Bug Fixes

| Pass | Description | PR/Commit | Summary |
|------|-------------|-----------|---------|
| ADMIN-500-INVESTIGATE-01 | Fix /admin HTTP 500 | — | `Pass-ADMIN-500-INVESTIGATE-01.md` |
| LOG-REVIEW-24H-01 | Production logs scan | — | `Pass-LOG-REVIEW-24H-01.md` |

---

## V1 Launch QA Checklist (Archived)

All items verified as of 2026-01-22:

- [x] Guest checkout: Order #94 (COD)
- [x] User checkout: Order #96 (Stripe PI `pi_3SrysZQ9Xukpkfmb0wx6f4vt`)
- [x] Producer flow: Product #9 (Green Farm Co.)
- [x] Admin flow: Order #94 status update
- [x] Production health: healthz OK, products cached
- [x] Email delivery: Resend working
- [x] Card payment: Fixed (PR #2327)
- [x] Performance: All < 300ms TTFB
- [x] Security: HTTPS, CSP, rate limiting
- [x] Rollback plan: SHA `06850e79` documented

---

## V1 Verification Tasks (Archived)

- [x] EMAIL-PROOF-01: Resend delivery verified
- [x] SECURITY-AUTH-RL-01: Rate limiting fixed (Pass SEC-AUTH-RL-02)
- [x] LOG-REVIEW-24H-01: Logs clean

---

_Archived by DOCS-NEXT7D-HYGIENE-01 | 2026-01-23_
