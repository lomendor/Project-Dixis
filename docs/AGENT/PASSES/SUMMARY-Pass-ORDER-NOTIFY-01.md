# SUMMARY: Pass ORDER-NOTIFY-01 — Order Status Email Notifications

**Date**: 2026-02-06
**PR**: [#2651](https://github.com/lomendor/Project-Dixis/pull/2651)
**Status**: ✅ MERGED
**LOC**: -7 net (70 added, 77 removed)

## What Changed

Admin order status changes now send real emails to customers via Resend API.

### Problem
- `sendMailSafe` in `@/lib/mail/mailer.ts` was NOOP in production (just `console.log`)
- Admin route hardcoded `DEV_MAIL_TO` env var as recipient
- Comment incorrectly claimed "we don't have buyer email in schema" (email field exists)

### Solution
- Replaced `sendMailSafe` with `sendOrderStatusUpdate` from `@/lib/email.ts` (already working for producer route)
- Extended `StatusUpdateEmailData`: added `packing`/`cancelled` statuses, `trackUrl`, changed `orderId` from number to string
- Added `normalizeOrderStatus()` function to map UPPERCASE admin statuses to lowercase email values
- Cancelled orders get red email header
- Tracking link button in emails when `publicToken` available

### Bug Fix
- Producer route `orderId: parseInt(orderId, 10) || 0` always returned 0 for CUID strings. Now passes string directly.

## Files Changed

1. `frontend/src/lib/email.ts` — Core email service extension
2. `frontend/src/app/api/admin/orders/[id]/status/route.ts` — Rewired email sending
3. `frontend/src/app/api/producer/orders/[id]/status/route.ts` — orderId bug fix
4. `frontend/.env.example` — Document RESEND_API_KEY, EMAIL_DRY_RUN
5. `frontend/.env.ci` — EMAIL_DRY_RUN=true for CI safety

## Verification
- `npx tsc --noEmit` — clean
- `npm run build` — clean
- CI: all checks passed (smoke, typecheck, quality-gates)
- Production: admin changes status → customer gets email via Resend
