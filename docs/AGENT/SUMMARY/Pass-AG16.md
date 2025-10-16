# Pass AG16 — Order Receipt Email (Dev Mailbox)

**Date**: 2025-10-16 21:37 UTC  
**Branch**: feat/AG16-order-receipt-devmail  
**Status**: Complete

## Summary

After order creation in `/api/orders`, send a simple receipt email to the dev mailbox (guarded by `SMTP_DEV_MAILBOX=1`). This provides visibility into order confirmations without requiring real SMTP infrastructure.

## Changes

### Modified Files

**frontend/src/app/api/orders/route.ts**:
- Added `originFromReq()` helper to extract origin from request
- After successful order creation (both Prisma and memory fallback paths):
  - Check if `SMTP_DEV_MAILBOX=1`
  - Send receipt email via `POST /api/ci/devmail/send`
  - Email includes: order total, postal code, thank you message
  - Best-effort (failures are silently caught)

### New Files

**frontend/tests/e2e/order-receipt-email.spec.ts**:
- E2E test that completes checkout flow
- Verifies receipt email exists in `/api/dev/mailbox`
- Searches for email to `test@dixis.dev` with subject containing "dixis order"
- Skips gracefully if dev mailbox API is not available

**docs/AGENT/SUMMARY/Pass-AG16.md**: This file

## Technical Details

**Email Format**:
- **To**: `summary.email` || `DEVMAIL_DEFAULT_TO` || `'test@dixis.dev'`
- **Subject**: `Dixis Order — {postalCode} — Total: €{total}`
- **Body**: Greek thank you message with order total and postal code

**Guards**:
- Only sends when `SMTP_DEV_MAILBOX=1`
- Wrapped in try-catch (no-op on failure)
- Uses `.catch(() => {})` on fetch to prevent errors from blocking order creation

**Origin Detection**:
- Extracts origin from request headers
- Falls back to `process.env.APP_ORIGIN || 'http://localhost:3000'`

## Testing

- E2E test verifies email appears in dev mailbox after checkout
- No impact on existing tests (guarded by environment variable)
- Works in both Prisma and in-memory fallback modes

## Notes

- No production SMTP changes
- No business logic changes
- Best-effort delivery (order creation never fails due to email issues)
- Dev mailbox only (requires `SMTP_DEV_MAILBOX=1`)

---

**Generated**: 2025-10-16 21:37 UTC
