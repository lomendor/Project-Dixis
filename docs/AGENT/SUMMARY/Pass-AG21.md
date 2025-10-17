# Pass AG21 — Receipt Email: Order No + Admin Link

**Date**: 2025-10-17 (continued)
**Branch**: feat/AG21-receipt-email-orderno-link
**Status**: Complete

## Summary

Enhances the order receipt email (dev mailbox) to include the friendly Order Number (DX-YYYYMMDD-####) in the subject line and a direct admin link in the body. Updates E2E test to verify both the DX- pattern in subject and the admin link in body. No business logic or schema changes.

## Changes

### Modified Files

**frontend/src/app/api/orders/route.ts**:
- Updated all 3 email sending code paths (Prisma success, Prisma fallback, in-memory)
- Subject line now includes Order No: `Dixis Order ${ordNo} — Total: €${total}`
- Body includes:
  - Order No at the top
  - Total amount
  - Postal code
  - Admin detail link: `${origin}/admin/orders/${created.id}`
- Example subject: `Dixis Order DX-20251017-A1B2 — Total: €45.50`
- Example body:
  ```
  Order DX-20251017-A1B2
  Σύνολο: €45.50
  Τ.Κ.: 10431

  Προβολή: http://localhost:3001/admin/orders/550e8400-e29b-41d4-a716-446655440000
  ```

**frontend/tests/e2e/order-receipt-email.spec.ts**:
- Enhanced mailbox search to require `DX-` in subject
- Added assertion: `expect(found?.text).toContain('/admin/orders/')`
- Verifies admin link is present in email body
- Test continues to verify email reaches dev mailbox

## Technical Details

**Email Subject Enhancement**:
```typescript
const ordNo = orderNumber(created.id, created.createdAt as any);
const subject = `Dixis Order ${ordNo} — Total: €${(data.total ?? 0).toFixed(2)}`;
```

**Email Body Enhancement**:
```typescript
const link = `${origin}/admin/orders/${created.id}`;
const body = `Order ${ordNo}\nΣύνολο: €${(data.total ?? 0).toFixed(2)}\nΤ.Κ.: ${data.postalCode}\n\nΠροβολή: ${link}`;
```

**E2E Test Updates**:
- Search condition now includes `String(m?.subject || '').includes('DX-')`
- New assertion: `expect(String(found?.text || '')).toContain('/admin/orders/')`
- Ensures email contains clickable admin link for support/debugging

**Code Paths Updated**:
1. **Prisma success path** (lines 67-86)
2. **Prisma fallback path** (lines 93-114)
3. **In-memory only path** (lines 121-142)

All three paths now compute orderNumber and include it in both subject and body.

## Testing

- E2E test verifies DX- pattern in email subject
- E2E test verifies admin link in email body
- Test works with dev mailbox (SMTP_DEV_MAILBOX=1)
- No changes to non-email code paths

## Notes

- Backward compatible (only changes email content)
- No database or API schema changes
- Admin link uses full origin URL (works in CI and local)
- Order No makes support queries easier
- Direct link to admin detail improves support workflow
- Email continues to go to dev mailbox in CI/test mode

---

**Generated**: 2025-10-17 (continued)
