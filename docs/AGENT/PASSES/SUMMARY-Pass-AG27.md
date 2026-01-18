# Pass-AG27 — Admin Orders summary bar (count & revenue)

**Status**: ✅ COMPLETE
**Branch**: `feat/AG27-admin-orders-summary`
**Protocol**: STOP-on-failure | STRICT NO-VISION

---

## 🎯 OBJECTIVE

Add summary bar to Admin Orders list showing total count and revenue for current filters:
- API: GET /api/admin/orders/summary with same filter support as list
- UI: Display summary bar above table showing filtered count and total amount
- E2E: Test filtering by Order No and verify summary shows 1 order

---

## ✅ IMPLEMENTATION

### 1. API: `/api/admin/orders/summary` (NEW)

**Purpose**: Returns aggregate data for orders matching current filters

**Query Parameters** (same as list endpoint):
- `q`: Search query (ID or email)
- `pc`: Postal code filter
- `method`: Delivery method (COURIER/PICKUP)
- `status`: Payment status (PAID/PENDING/FAILED)
- `from`: Start date (ISO format)
- `to`: End date (ISO format)
- `ordNo`: Order number (DX-YYYYMMDD-####)

**Response**:
```json
{
  "totalCount": 42,
  "totalAmount": 1234.56
}
```

**Implementation Details**:
```typescript
// Fetch orders with only id and total for aggregation
let list = await prisma.checkoutOrder.findMany({
  where,
  select: { id: true, total: true },
  take: 1000, // cap for safety
});

// Apply suffix filter if ordNo provided
if (parsed) {
  list = list.filter((o) => matchSuffix(o.id));
}

const totalCount = list.length;
const totalAmount = list.reduce((acc, o) => acc + Number(o.total ?? 0), 0);

return NextResponse.json({ totalCount, totalAmount });
```

**In-Memory Fallback**: Same filtering logic as list endpoint, limited to 1000 records

### 2. UI Changes (`frontend/src/app/admin/orders/page.tsx`)

**Summary State**:
```typescript
const [sumAmount, setSumAmount] = React.useState(0);
const [sumErr, setSumErr] = React.useState('');
```

**Filter Params Helper**:
```typescript
const buildFilterParams = React.useCallback(() => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (pc) params.set('pc', pc);
  if (method) params.set('method', method);
  if (status) params.set('status', status);
  if (ordNo) params.set('ordNo', ordNo);
  if (fromISO) params.set('from', fromISO);
  if (toISO) params.set('to', toISO);
  return params;
}, [q, pc, method, status, ordNo, fromISO, toISO]);
```

**Summary Fetch Effect** (independent of pagination):
```typescript
React.useEffect(() => {
  const fetchSummary = async () => {
    try {
      const params = buildFilterParams();
      const query = params.toString();
      const url = query ? `/api/admin/orders/summary?${query}` : '/api/admin/orders/summary';

      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) {
        setSumErr('⚠️');
        return;
      }
      const j = await r.json();
      setSumAmount(Number(j.totalAmount ?? 0));
      setSumErr('');
    } catch {
      setSumErr('⚠️');
    }
  };
  fetchSummary();
}, [buildFilterParams]);
```

**Summary Bar UI**:
```tsx
<div className="mt-2 text-sm text-gray-700" data-testid="orders-summary">
  Σύνοψη: {total.toLocaleString()} παραγγελίες · Σύνολο €{sumAmount.toFixed(2)}
  {sumErr && <span className="text-red-600"> {sumErr}</span>}
</div>
```

### 3. E2E Test (`frontend/tests/e2e/admin-orders-summary.spec.ts`)

**Test Flow**:
1. Create order via checkout flow (€42 subtotal)
2. Capture Order No from confirmation page
3. Navigate to admin orders list
4. Filter by Order No
5. Verify summary bar shows "1 παραγγελίες"
6. Verify summary shows "Σύνολο €" with numeric value

**Key Assertions**:
```typescript
const summary = page.getByTestId('orders-summary');
await expect(summary).toBeVisible();

const text = (await summary.textContent()) || '';
expect(text).toMatch(/1\s+παραγγελί/i);
expect(text).toMatch(/Σύνολο\s*€\d+/);
```

---

## 🔍 KEY PATTERNS

### Independent Summary Fetching
- Summary fetch is **independent of pagination** (no skip/take/count params)
- Reacts to filter changes but NOT to page/pageSize changes
- Uses same filter logic as list endpoint for consistency

### Code Reusability
- `buildFilterParams()` helper shared between fetchOrders and fetchSummary
- Reduces duplication and ensures filter consistency
- Updated fetchOrders dependencies to use helper: `[buildFilterParams, page, pageSize]`

### Error Handling
- Summary errors shown as warning icon (⚠️) without disrupting UI
- Failed summary fetch doesn't break the main orders list
- Graceful degradation if API unavailable

---

## 📊 FILES MODIFIED

1. `frontend/src/app/api/admin/orders/summary/route.ts` - Summary API endpoint (NEW)
2. `frontend/src/app/admin/orders/page.tsx` - UI summary bar + fetch logic
3. `frontend/tests/e2e/admin-orders-summary.spec.ts` - E2E test (NEW)
4. `docs/AGENT/PASSES/SUMMARY-Pass-AG27.md` - This documentation (NEW)

---

## ✅ VERIFICATION

**API Endpoint**:
```bash
# Get summary for all orders
curl "/api/admin/orders/summary"

# Get summary with filters
curl "/api/admin/orders/summary?pc=10431&method=COURIER"

# Get summary for specific Order No
curl "/api/admin/orders/summary?ordNo=DX-20251017-A1B2"
```

**E2E Test**:
```bash
cd frontend
npx playwright test admin-orders-summary.spec.ts
```

---

**Generated-by**: Claude Code (AG27 Protocol)
**Timestamp**: 2025-10-17
