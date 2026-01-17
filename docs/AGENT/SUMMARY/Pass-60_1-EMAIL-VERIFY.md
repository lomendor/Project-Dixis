# Pass 60.1: Email Verification Tooling

**Status**: CLOSED
**Date**: 2026-01-17
**PR**: #2271

## What Changed

### Health Endpoints

Added `from_configured` boolean to `/api/health` and `/api/healthz`:

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

### Artisan Command

New command for operators to verify email configuration:

```bash
# Dry run (validate config without sending)
php artisan dixis:email:test --to=your@email.com --dry-run

# Send actual test email
php artisan dixis:email:test --to=your@email.com

# Custom subject
php artisan dixis:email:test --to=your@email.com --subject="Custom"
```

Command behavior:
- Validates email format
- Checks `EMAIL_NOTIFICATIONS_ENABLED` flag
- Refuses to send when flag is false (unless `--dry-run`)
- Shows mailer configuration status in dry-run mode

### Enhanced Runbook

Updated `docs/AGENT/TASKS/Pass-60-EMAIL-ENABLE.md` with:
- Resend account setup checklist (domain verification, DNS records)
- VPS enablement steps with explicit verification commands
- Rollback procedures
- Troubleshooting section

### Tests

| Test File | Tests |
|-----------|-------|
| `HealthTest.php` | Updated 2 tests for `from_configured` |
| `TestEmailCommandTest.php` | 7 new tests for Artisan command |

## Evidence

- PR #2271 merged: https://github.com/lomendor/Project-Dixis/pull/2271
- Production healthz shows `from_configured: true`
- All CI checks passed (phpunit, E2E, quality-gates)

## What Blocks Next

Email sending remains blocked until operator provides:

**Option A (Resend)**:
- `RESEND_KEY=re_...`
- `EMAIL_NOTIFICATIONS_ENABLED=true`

**Option B (SMTP)**:
- `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- `EMAIL_NOTIFICATIONS_ENABLED=true`

See `docs/AGENT/TASKS/Pass-60-EMAIL-ENABLE.md` for complete runbook.

## Files Changed

| File | Change |
|------|--------|
| `backend/routes/api.php` | Added `from_configured` to health endpoints |
| `backend/app/Console/Commands/TestEmail.php` | New Artisan command |
| `backend/tests/Feature/Api/V1/HealthTest.php` | Updated tests |
| `backend/tests/Feature/Console/TestEmailCommandTest.php` | New tests |
| `docs/AGENT/TASKS/Pass-60-EMAIL-ENABLE.md` | Enhanced runbook |
