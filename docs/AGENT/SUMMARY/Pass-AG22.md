# Pass AG22 — Customer Order Lookup (Order No + Email)

**Date**: 2025-10-17 (continued)
**Branch**: feat/AG22-customer-order-lookup
**Status**: Complete

## Summary

Implements public-facing customer order lookup by Order No (DX-YYYYMMDD-####) + Email. Allows customers to retrieve order details without authentication. Features secure parsing, uniform 404 responses (anti-enumeration), rate limiting, and comprehensive E2E testing.

## Changes

### Modified Files

**frontend/src/lib/orderNumber.ts**:
- Added `parseOrderNo()` helper function alongside existing `orderNumber()`
- Parses DX-YYYYMMDD-#### pattern using regex
- Extracts date range (start/end UTC) and 4-char suffix
- Returns `null` for invalid patterns (type-safe)
- Example:
  ```typescript
  parseOrderNo('DX-20251017-A1B2')
  // => { dateStart: Date(2025-10-17 00:00:00 UTC), dateEnd: Date(2025-10-18 00:00:00 UTC), suffix: 'A1B2' }
  ```

**frontend/src/app/api/order-lookup/route.ts** (New File):
- POST endpoint for customer order lookup
- Rate-limiting: 60 req/min (prod-only via rateLimit helper)
- Request body: `{ orderNo: string, email: string }`
- Validates inputs (400 if missing)
- Uses `parseOrderNo()` to extract date range + suffix
- Queries Prisma with date range + email filter (case-insensitive)
- Matches suffix from last 4 chars of order ID
- Fallback to in-memory store if DB unavailable
- Returns limited fields (no sensitive data):
  - orderNo, createdAt, postalCode, method, total, paymentStatus
- **Security**: Uniform 404 response (prevents order enumeration)

**frontend/src/app/orders/lookup/page.tsx** (New File):
- Public-facing order lookup page
- Client component with form state management
- Input fields:
  - Order No (DX-YYYYMMDD-####)
  - Email (required, type="email")
- Submit button with loading state
- Error handling:
  - 404 → "Δεν βρέθηκε παραγγελία με αυτά τα στοιχεία."
  - 429 → "Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο."
  - Network errors → "Σφάλμα δικτύου."
- Results display (Greek labels):
  - Αριθμός, Ημερομηνία, Τ.Κ., Μέθοδος, Σύνολο, Κατάσταση
- All elements tagged with data-testid for E2E testing

**frontend/tests/e2e/customer-order-lookup.spec.ts** (New File):
- E2E test covering full customer journey:
  1. Complete checkout flow to create order
  2. Capture Order No from confirmation page
  3. Navigate to /orders/lookup
  4. Fill form with Order No + Email
  5. Submit and verify result matches
- Assertions:
  - Order No matches pattern DX-\d{8}-[A-Z0-9]{4}
  - Result displays correct Order No
  - Postal code and method match order details

## Technical Details

### parseOrderNo() Implementation
```typescript
export function parseOrderNo(ordNo: string): null | { dateStart: Date; dateEnd: Date; suffix: string } {
  if (!ordNo) return null;
  const m = /^DX-(\d{4})(\d{2})(\d{2})-([A-Z0-9]{4})$/i.exec(ordNo.trim());
  if (!m) return null;
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3]);
  const dateStart = new Date(Date.UTC(y, mo-1, d, 0, 0, 0));
  const dateEnd   = new Date(Date.UTC(y, mo-1, d+1, 0, 0, 0)); // exclusive
  return { dateStart, dateEnd, suffix: m[4].toUpperCase() };
}
```

### API Lookup Logic
```typescript
// 1. Parse order number
const parsed = parseOrderNo(orderNo);
if (!parsed) return 404; // Uniform response

// 2. Query by date range + email
const candidates = await prisma.checkoutOrder.findMany({
  where: {
    createdAt: { gte: dateStart, lt: dateEnd },
    email: { equals: email, mode: 'insensitive' }
  }
});

// 3. Match suffix (last 4 chars of ID)
const matched = candidates.find((o) => {
  const orderSuffix = o.id.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase();
  return orderSuffix === suffix;
});

if (!matched) return 404; // Uniform response
```

### Security Features
- **Anti-Enumeration**: Uniform 404 for invalid format, wrong email, or non-existent order
- **Rate Limiting**: 60 req/min via token-bucket (prod-only)
- **Limited Response**: Only returns non-sensitive fields (no payment refs, full email, etc.)
- **Case-Insensitive Email**: Prevents bypassing via case variations

## Testing

- E2E test verifies end-to-end customer journey
- Test creates real order via checkout flow
- Captures actual Order No from confirmation
- Submits lookup form and validates results
- Covers happy path (successful lookup)

## Notes

- No authentication required (public endpoint)
- Works with both Prisma and in-memory fallback
- Date range query optimizes DB performance (single day scope)
- Suffix matching ensures exact order match within date range
- Greek UI text for customer-facing page
- Compatible with existing order creation flow (AG20)
- parseOrderNo() is inverse of orderNumber() generation logic

---

**Generated**: 2025-10-17 (continued)
