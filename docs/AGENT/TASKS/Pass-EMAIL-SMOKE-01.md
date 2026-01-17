# Pass EMAIL-SMOKE-01: VPS → Resend End-to-End Smoke Test

**Created**: 2026-01-17

## Objective

Prove end-to-end email sending from VPS backend via Resend is working.

## Scope

- Smoke test only, no feature work
- Use existing `dixis:email:test` artisan command
- Verify password reset endpoint also triggers email

## Prerequisites

- SSH access via `dixis-prod` alias (Pass OPS-SSH-HYGIENE-01)
- Resend configured (Pass OPS-EMAIL-UNBLOCK-01)

## Definition of Done

- [ ] `php artisan dixis:email:test --to=<email>` returns OK
- [ ] Password reset endpoint returns 200
- [ ] Evidence documented in STATE.md

## Verification Commands

```bash
# SSH test email
ssh dixis-prod 'cd /var/www/dixis/current/backend && php artisan dixis:email:test --to=kourkoutisp@gmail.com'

# Password reset API
curl -s -X POST "https://dixis.gr/api/v1/auth/password/forgot" \
  -H "Content-Type: application/json" \
  -d '{"email":"kourkoutisp@gmail.com"}'
```

## Expected Results

```
[OK] Test email sent successfully to kourkoutisp@gmail.com
```

```json
{"message":"If an account exists with this email, you will receive a password reset link."}
```
