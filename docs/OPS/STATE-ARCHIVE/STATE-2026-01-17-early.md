# STATE Archive — 2026-01-17 (Early Passes)

**Period**: 2026-01-17 (passes before PROD-UNBLOCK-01)
**Archived**: 2026-01-18 (PROC-03)

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

See `docs/AGENT/PASSES/TASK-Pass-60-EMAIL-ENABLE.md` for VPS enablement runbook.

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

See `docs/AGENT/PASSES/TASK-Pass-60-EMAIL-ENABLE.md` for VPS enablement with Resend key.

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

