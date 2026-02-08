# ISSUE: LARAVEL-500-01 — Laravel Backend Returns 500 Server Error

**Date**: 2026-02-08
**Status**: BLOCKING
**Severity**: HIGH

---

## Problem

Όλα τα Laravel API endpoints επιστρέφουν `500 Server Error`:

```bash
# Login endpoint
curl -X POST "https://dixis.gr/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
# Response: {"message": "Server Error"}

# Products endpoint
curl "https://dixis.gr/api/v1/products"
# Response: {"message": "Server Error"}
```

---

## Impact

- ❌ Email/password login **δεν δουλεύει**
- ❌ Registration **δεν δουλεύει**
- ❌ Password reset **δεν δουλεύει**
- ⚠️ OTP login (frontend-only) **δουλεύει** (δεν χρησιμοποιεί Laravel)

---

## Diagnosis Required

1. **SSH Access**: Timeout στο `ssh dixis@144.76.224.1`
2. **Laravel Logs**: Χρειάζεται πρόσβαση στο `/var/www/dixis/backend/storage/logs/laravel.log`

### Likely Causes

| Cause | Likelihood | Check |
|-------|------------|-------|
| Database connection (MySQL/PostgreSQL) | HIGH | Check `.env` DB config |
| PHP-FPM not running | MEDIUM | `systemctl status php-fpm` |
| Storage permissions | MEDIUM | `chmod -R 775 storage` |
| Missing `.env` | LOW | `ls -la /var/www/dixis/backend/.env` |
| Composer dependencies | LOW | `composer install` |

---

## Temporary Workaround

Το OTP-based login (`/auth/login-otp`) **δουλεύει** γιατί χρησιμοποιεί:
- Frontend Next.js API routes
- Prisma + Neon PostgreSQL (frontend database)
- Δεν εξαρτάται από Laravel

**Για testing**: Χρησιμοποίησε το `/auth/login-otp` μέχρι να fix-αριστεί το Laravel backend.

---

## Next Steps

1. **Gain SSH access** - Check VPS provider console
2. **Check Laravel logs** - Identify specific error
3. **Fix root cause** - DB connection, permissions, etc.
4. **Verify** - Test login endpoint

---

## Related

- AUTH-EMAIL-PASSWORD-01: Frontend ready, blocked by this issue
- VPS Status: SSH timeout suggests possible network/firewall issue

---

_Created: 2026-02-08_
