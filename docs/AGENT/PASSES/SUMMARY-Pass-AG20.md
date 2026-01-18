# Pass AG20 — Friendly Order Number (DX-YYYYMMDD-####)

**Date**: 2025-10-17 (continued)
**Branch**: feat/AG20-friendly-order-number
**Status**: Complete

## Summary

Adds human-friendly order numbers (DX-YYYYMMDD-####) derived from createdAt + id. API returns orderNumber on order create, confirmation/admin pages display it, and CSV export includes it as the first column. No database schema changes - purely derived values.

## Changes

### New Files

**frontend/src/lib/orderNumber.ts**:
- Helper function `orderNumber(id: string, createdAt?: string | Date): string`
- Format: `DX-{YYYY}{MM}{DD}-{last 4 chars of ID uppercased}`
- Example: `DX-20251017-A1B2`
- Pad function for zero-padding month and day
- Uses last 4 characters of ID (alphanumeric only) as suffix

### Modified Files

**frontend/src/app/api/orders/route.ts**:
- Import orderNumber helper
- Compute orderNumber after order creation
- Return in JSON response: `{ ok: true, id, orderNumber }`
- Applied to all 3 code paths: Prisma success, Prisma fallback, in-memory only

**frontend/src/app/checkout/payment/page.tsx**:
- Store orderNumber in localStorage as `checkout_order_no`
- Added after storing `checkout_order_id`
- Handles missing orderNumber gracefully

**frontend/src/app/checkout/confirmation/page.tsx**:
- Added `orderNo` state
- Load from localStorage `checkout_order_no`
- Display "Order No" (larger, prominent) above "Order ID" (smaller, less prominent)
- Test ID: `order-no`

**frontend/src/app/admin/orders/page.tsx**:
- Import orderNumber helper
- Added "Order #" column as first column (before ID)
- Compute orderNumber client-side: `orderNumber(r.id, r.createdAt)`
- Updated empty state colspan from 7 to 8

**frontend/src/app/admin/orders/[id]/page.tsx**:
- Import orderNumber helper
- Display "Order No" prominently above "Order ID"
- Compute client-side: `orderNumber(data.id, data.createdAt)`
- Test ID: `detail-order-no`

**frontend/src/app/api/admin/orders/export/route.ts**:
- Import orderNumber helper
- Updated CSV header: "Order No" as first column
- Compute orderNumber for each row: `orderNumber(r.id, r.createdAt)`
- Prepend to row data before escaping

### New Tests

**frontend/tests/e2e/confirmation-shows-ordernumber.spec.ts**:
- E2E test for confirmation page orderNumber display
- Complete checkout flow → confirmation
- Assert `order-no` element is visible
- Regex match: `/^DX-\d{8}-[A-Z0-9]{4}$/`

**frontend/tests/e2e/admin-orders-export-filters.spec.ts** (Modified):
- Updated CSV header check to include "Order No"
- Added regex test for orderNumber pattern in CSV content

## Technical Details

**Order Number Format**:
- Prefix: `DX-` (Dixis brand)
- Date: YYYYMMDD (8 digits from createdAt)
- Suffix: Last 4 characters of ID (uppercased, alphanumeric only)
- Pattern: `DX-\d{8}-[A-Z0-9]{4}`

**Derivation Logic**:
```typescript
function orderNumber(id: string, createdAt?: string | Date): string {
  const safeId = (id || '').replace(/[^a-z0-9]/gi, '');
  const suffix = (safeId.slice(-4) || '0000').toUpperCase();
  const d = createdAt ? new Date(createdAt) : new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `DX-${y}${m}${day}-${suffix}`;
}
```

**Client-Side vs Server-Side**:
- **Server**: API returns orderNumber on order creation
- **Client**: Confirmation reads from localStorage
- **Admin**: Computes client-side from id + createdAt (no API change needed)
- **CSV**: Computes server-side during export

**No Schema Changes**:
- Order number is not stored in database
- Always derived from existing fields (id, createdAt)
- Can be regenerated anytime from these fields

## Testing

- E2E test verifies DX-YYYYMMDD-#### pattern on confirmation
- E2E test verifies orderNumber appears in CSV export
- Admin pages display orderNumber computed from existing data
- Works with both Prisma and in-memory storage

## Notes

- Non-breaking change (adds new field, doesn't remove old ones)
- Order ID still visible everywhere for technical reference
- Order Number more user-friendly for support/tracking
- No database migration required
- Backwards compatible with existing orders

---

**Generated**: 2025-10-17 (continued)
