# Pass CREDENTIALS-01 Summary

**Date**: 2026-01-17
**Status**: ✅ CLOSED

## TL;DR

Created consolidated credential wiring map at `docs/OPS/CREDENTIALS.md` with exact env vars, locations, code references, and validation steps for Pass 52 (Stripe) and Pass 60 (Email).

## What Was Created

### docs/OPS/CREDENTIALS.md (~200 lines)

Contains:
- Quick reference table (provider → env vars → where → how to validate)
- Stripe section: 6 env vars, enable steps, validation checklist
- Email section: Resend + SMTP options, enable steps, validation checklist
- Feature flag behavior documentation
- Troubleshooting guide

## Key Findings

### Pass 52 — Stripe

| Env Var | Location |
|---------|----------|
| `STRIPE_SECRET_KEY` | VPS backend/.env |
| `STRIPE_PUBLIC_KEY` | VPS backend/.env |
| `STRIPE_WEBHOOK_SECRET` | VPS backend/.env |
| `PAYMENTS_CARD_FLAG=true` | VPS backend/.env |
| `NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true` | VPS frontend/.env |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | VPS frontend/.env |

**Validation**: Health check → test mode checkout → card option visible → test payment

### Pass 60 — Email

**Option A (Resend)**:
| Env Var | Value |
|---------|-------|
| `MAIL_MAILER` | `resend` |
| `RESEND_KEY` | `re_...` |
| `EMAIL_NOTIFICATIONS_ENABLED` | `true` |

**Option B (SMTP)**:
| Env Var | Example |
|---------|---------|
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.example.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | (username) |
| `MAIL_PASSWORD` | (password) |
| `EMAIL_NOTIFICATIONS_ENABLED` | `true` |

**Validation**: Tinker test email → order flow → check logs

## Architecture Note

- Both features use feature flags defaulting to OFF
- Production is safe without credentials
- Credentials are VPS-only (not in GitHub Secrets)

## Next Steps

User to provide:
1. Stripe API keys (test or live)
2. Resend API key OR SMTP credentials

Then execute Pass 52 and Pass 60 to enable features.
