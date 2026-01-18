# Pass 55 - Weekly Producer Digest

**Date**: 2025-12-28
**Status**: COMPLETE
**PR**: #1938 (MERGED)

## Problem Statement

Producers have no summary of their weekly order activity. They must manually check the dashboard to understand their performance.

## Solution

### Feature Flag
`PRODUCER_DIGEST_ENABLED=false` (default OFF, separate from transactional emails)

### Artisan Command
```bash
# Send digests (live mode)
php artisan producers:digest-weekly

# Dry-run mode (output counts, no emails)
php artisan producers:digest-weekly --dry-run
```

### Schedule
- Runs: Every Monday at 09:00 Europe/Athens
- VPS cron: `* * * * * cd /var/www/dixis/current/backend && php artisan schedule:run >> /dev/null 2>&1`

### Digest Contents (Rolling 7 Days)
- Total orders count
- Gross revenue (sum of line totals)
- Top 3 products by quantity
- Pending orders count
- Delivered orders count

### Idempotency
- New `producer_digests` table
- Unique key: (producer_id, period_start)
- Prevents double-sends for same period

### Graceful Failure
- Missing email addresses logged, not thrown
- Email failures don't crash the command
- Summary output at end shows sent/skipped/noEmail counts

## Files Changed

| File | Type | Description |
|------|------|-------------|
| `database/migrations/2025_12_28_190000_...` | New | Idempotency table |
| `config/notifications.php` | Modified | Add `producer_digest_enabled` flag |
| `app/Models/ProducerDigest.php` | New | Idempotency model |
| `app/Mail/ProducerWeeklyDigest.php` | New | Digest mailable |
| `resources/views/emails/producers/weekly-digest.blade.php` | New | Email template |
| `app/Console/Commands/SendProducerWeeklyDigest.php` | New | Artisan command |
| `routes/console.php` | Modified | Add weekly schedule |
| `backend/.env.example` | Modified | Add PRODUCER_DIGEST_ENABLED |
| `tests/Feature/ProducerWeeklyDigestTest.php` | New | 7 tests |

## How to Enable

### Backend (.env)
```bash
# Enable weekly producer digest
PRODUCER_DIGEST_ENABLED=true

# Make sure SMTP is configured
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
...
```

### Manual Run
```bash
# Dry-run first to see what would be sent
php artisan producers:digest-weekly --dry-run

# Then run for real
php artisan producers:digest-weekly
```

### VPS Scheduler Setup
If Laravel scheduler is not yet configured, add this cron:
```bash
crontab -e
# Add:
* * * * * cd /var/www/dixis/current/backend && php artisan schedule:run >> /dev/null 2>&1
```

## Testing

### Unit Tests (7 tests, 21 assertions)
- Flag OFF: command sends nothing
- Flag ON: digest sent
- Idempotency prevents double-send
- Correct aggregates calculated
- Missing email handled gracefully
- Dry-run outputs counts without sending
- Orders outside period excluded

## Email Content (Greek)

### Subject
"Εβδομαδιαία Αναφορά (2025-12-21 - 2025-12-27) - Dixis"

### Body
- Producer name
- Period dates
- Stats grid: Orders count, Revenue (€)
- Status counts: Pending, Delivered
- Top 3 products list

## Risks

| Risk | Mitigation |
|------|------------|
| Double-sends | Idempotency table prevents |
| Missing emails | Logged warning, skip producer |
| SMTP not configured | Feature flag OFF by default |
| Scheduler not running | Document VPS cron line |

---
Generated-by: Claude (Pass 55)
