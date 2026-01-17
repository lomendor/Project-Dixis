# Pass CREDENTIALS-01: Credentials Wiring Map

**Status**: ✅ DONE
**Created**: 2026-01-17

## Goal

Create a single "keys + where they live + how to validate" map to unblock Pass 52 (Stripe) and Pass 60 (Email).

## Scope

Docs-only pass. No code changes. No secrets.

## Definition of Done

- [x] Audit existing credential docs and env files
- [x] Search codebase for STRIPE_, RESEND_, MAIL_, EMAIL_ env var usage
- [x] Create `docs/OPS/CREDENTIALS.md` with:
  - Required env vars per provider
  - Where to set (VPS/local/CI)
  - Code references (file:line)
  - Validation checklist
- [x] Update STATE.md, NEXT-7D.md, ACTIVE.md
- [x] PR merged

## Deliverables

| File | Purpose |
|------|---------|
| `docs/OPS/CREDENTIALS.md` | Consolidated credential wiring map |

## Key Findings

### Stripe (Pass 52)

| Env Var | Where | Code Reference |
|---------|-------|----------------|
| `STRIPE_SECRET_KEY` | VPS backend/.env | `config/payments.php:32` |
| `STRIPE_PUBLIC_KEY` | VPS backend/.env | `config/payments.php:33` |
| `STRIPE_WEBHOOK_SECRET` | VPS backend/.env | `config/payments.php:34` |
| `PAYMENTS_CARD_FLAG` | VPS backend/.env | `config/payments.php:19` |
| `NEXT_PUBLIC_PAYMENTS_CARD_FLAG` | VPS frontend/.env | `PaymentMethodSelector.tsx:27` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | VPS frontend/.env | `StripeProvider.tsx` |

### Email (Pass 60)

| Env Var | Where | Code Reference |
|---------|-------|----------------|
| `MAIL_MAILER` | VPS backend/.env | `config/mail.php:17` |
| `RESEND_KEY` | VPS backend/.env | `config/services.php` |
| `EMAIL_NOTIFICATIONS_ENABLED` | VPS backend/.env | `config/notifications.php:17` |

## Notes

- Both features use feature flags that default to OFF (safe without credentials)
- Credentials are VPS-only, not in GitHub Secrets
- Validation steps included for both test mode and production
