# Pass AG23 — Admin Resend Receipt

**Date**: 2025-10-17 (continued)
**Branch**: feat/AG23-admin-resend-receipt
**Status**: Complete

## Summary

Implements admin functionality to manually resend order receipt emails via dev mailbox. Adds POST endpoint at /api/admin/orders/[id]/resend with BASIC_AUTH guard, "Resend receipt" button on admin order detail page, and E2E test verifying email delivery.

## Changes

### New Files

**frontend/src/app/api/admin/orders/[id]/resend/route.ts**:
- POST endpoint for resending order receipt
- Guard: adminEnabled() (BASIC_AUTH=1)
- Rate limiting: 30 req/min (prod-only)
- Fetches order from Prisma or in-memory fallback
- Generates receipt email with:
  - Subject: Order No (DX-...) + Total
  - Body: Order No, Total, Postal Code, Admin link
- Sends via /api/ci/devmail/send (dev mailbox)
- Returns { ok: true } on success
- Error handling: 404 for missing order, 429 for rate limit

**frontend/tests/e2e/admin-resend-receipt.spec.ts**:
- E2E test covering full flow:
  1. Create order via checkout
  2. Navigate to admin order detail
  3. Click "Resend receipt" button
  4. Verify email in dev mailbox contains DX- pattern and admin link
- Uses page.on('dialog') to auto-accept alert
- Skips if dev mailbox API unavailable

### Modified Files

**frontend/src/app/admin/orders/[id]/page.tsx**:
- Added "Resend receipt" button before "back to list" link
- Button fetches /api/admin/orders/${id}/resend via POST
- Shows alert on success/failure
- data-testid="resend-receipt" for E2E testing

**docs/AGENT/SUMMARY/Pass-AG23.md** (this file):
- Documentation for AG23 implementation

## Technical Details

### API Endpoint
```typescript
export async function POST(req: Request, ctx: { params: { id: string } }) {
  if (!adminEnabled()) return new NextResponse('Not Found', { status: 404 });
  if (!(await rateLimit('admin-resend-receipt', 30))) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Fetch order from Prisma or in-memory
  // Generate receipt email
  // Send via dev mailbox
  
  return NextResponse.json({ ok: true });
}
```

### Email Format
Same format as initial receipt (AG21):
- Subject: `Dixis Order ${ordNo} — Total: €${total}`
- Body: `Order ${ordNo}\nΣύνολο: €${total}\nΤ.Κ.: ${postalCode}\n\nΠροβολή: ${link}`

### UI Button
```typescript
<button
  data-testid="resend-receipt"
  onClick={async ()=>{
    const r = await fetch(`/api/admin/orders/${data?.id}/resend`, { method:'POST' });
    alert(r.ok ? 'Το email στάλθηκε ξανά.' : 'Αποτυχία αποστολής.');
  }}
>Resend receipt</button>
```

## Testing

- E2E test verifies complete workflow
- Test creates real order and triggers resend
- Validates email appears in dev mailbox
- Checks for DX- pattern in subject
- Verifies admin link in body

## Use Cases

- Support can manually resend receipts to customers
- Useful when original email fails or is lost
- Admin can verify email content before customer contact
- Works in dev/CI environments with SMTP_DEV_MAILBOX=1

## Security

- BASIC_AUTH guard (adminEnabled())
- Rate limiting (30 req/min, prod-only)
- Best-effort email sending (no error thrown on failure)
- Uses existing originFromReq() helper for proper URL formation

## Notes

- Compatible with Prisma and in-memory order storage
- Reuses orderNumber() helper from AG20
- Email format consistent with initial receipt (AG21)
- Button placement: before "back to list" link on detail page
- Alert feedback for user confirmation

---

**Generated**: 2025-10-17 (continued)
