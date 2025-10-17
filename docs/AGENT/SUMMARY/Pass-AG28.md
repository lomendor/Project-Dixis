# Pass-AG28 — Admin Orders sorting (date & total)

**Status**: ✅ COMPLETE
**Branch**: `feat/AG28-admin-orders-sorting`
**Protocol**: STOP-on-failure | STRICT NO-VISION

---

## 🎯 OBJECTIVE

Add sorting capability to Admin Orders list by date (createdAt) and total:
- API: Support `?sort=createdAt|total` and `?dir=asc|desc` parameters
- UI: Clickable table headers with sort indicators
- E2E: Test sorting by total (descending) shows highest value first

---

## ✅ IMPLEMENTATION

### 1. API Changes (`frontend/src/app/api/admin/orders/route.ts`)

**Sorting Parameters**:
```typescript
// Sorting parameters
const rawSort = (url.searchParams.get('sort') || 'createdAt').trim();
const rawDir = (url.searchParams.get('dir') || 'desc').trim().toLowerCase();
const sortKey: 'createdAt' | 'total' = ['createdAt', 'total'].includes(rawSort) ? rawSort as any : 'createdAt';
const sortDir: 'asc' | 'desc' = (rawDir === 'asc' || rawDir === 'desc') ? rawDir : 'desc';
```

**Prisma Query** (dynamic orderBy):
```typescript
let list = await prisma.checkoutOrder.findMany({
  where,
  orderBy: { [sortKey]: sortDir },
  skip,
  take,
});
```

**In-Memory Fallback** (sorted before pagination):
```typescript
// Sort in-memory list
memList = memList.sort((a: any, b: any) => {
  const av = sortKey === 'total' ? Number(a.total || 0) : new Date(a.createdAt).getTime();
  const bv = sortKey === 'total' ? Number(b.total || 0) : new Date(b.createdAt).getTime();
  const cmp = av === bv ? 0 : (av < bv ? -1 : 1);
  return sortDir === 'asc' ? cmp : -cmp;
});
```

### 2. UI Changes (`frontend/src/app/admin/orders/page.tsx`)

**Sorting State**:
```typescript
const [sortKey, setSortKey] = React.useState<'createdAt' | 'total'>('createdAt');
const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
```

**Include in Fetch**:
```typescript
// Sorting params
params.set('sort', sortKey);
params.set('dir', sortDir);
```

**Update Dependencies**:
```typescript
}, [buildFilterParams, page, pageSize, sortKey, sortDir]);
```

**Clickable Headers with Indicators**:
```tsx
<th>
  <button
    onClick={() => {
      if (sortKey === 'createdAt') {
        setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
      } else {
        setSortKey('createdAt');
        setSortDir('desc');
      }
      setPage(0);
    }}
    className="underline cursor-pointer"
    data-testid="th-date"
  >
    Ημ/νία {sortKey === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
  </button>
</th>

<th>
  <button
    onClick={() => {
      if (sortKey === 'total') {
        setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
      } else {
        setSortKey('total');
        setSortDir('desc');
      }
      setPage(0);
    }}
    className="underline cursor-pointer"
    data-testid="th-total"
  >
    Σύνολο {sortKey === 'total' && (sortDir === 'asc' ? '↑' : '↓')}
  </button>
</th>
```

**Total Column with Euro Symbol**:
```tsx
<td className="pr-2" data-testid="cell-total">
  €{typeof r.total === 'number' ? r.total.toFixed(2) : String(r.total)}
</td>
```

### 3. E2E Test (`frontend/tests/e2e/admin-orders-sorting.spec.ts`)

**Test Flow**:
1. Create 2 orders with different totals (€42 and €99)
2. Navigate to admin orders list
3. Click "Σύνολο" header to sort by total
4. Verify first value ≥ second value (descending order)
5. Verify highest value (€99) is in first cell

**Key Assertions**:
```typescript
const totals = await page.locator('[data-testid="cell-total"]').allTextContents();
const v1 = Number((totals[0] || '').replace(/[^\d.]/g, ''));
const v2 = Number((totals[1] || '').replace(/[^\d.]/g, ''));

expect(v1).toBeGreaterThanOrEqual(v2);
expect(v1).toBeGreaterThanOrEqual(99);
```

---

## 🔍 KEY PATTERNS

### Whitelist Pattern for Sort Keys
- Only `createdAt` and `total` allowed
- Invalid values default to `createdAt`
- Prevents SQL injection-like attacks

### Toggle Direction on Same Column
```typescript
if (sortKey === 'createdAt') {
  // Already sorting by this column - toggle direction
  setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
} else {
  // New column - set column and default to desc
  setSortKey('createdAt');
  setSortDir('desc');
}
```

### Reset Page on Sort Change
- Clicking a sort header resets to page 0
- Prevents confusing UX (being on page 5 of a re-sorted list)

### Visual Indicators
- Up arrow (↑) for ascending
- Down arrow (↓) for descending
- Only shown on active sort column

---

## 📊 FILES MODIFIED

1. `frontend/src/app/api/admin/orders/route.ts` - API sorting support
2. `frontend/src/app/admin/orders/page.tsx` - UI clickable headers + state
3. `frontend/tests/e2e/admin-orders-sorting.spec.ts` - E2E test (NEW)
4. `docs/AGENT/SUMMARY/Pass-AG28.md` - This documentation (NEW)

---

## ✅ VERIFICATION

**API Endpoint**:
```bash
# Sort by date (desc, default)
curl "/api/admin/orders"

# Sort by date ascending
curl "/api/admin/orders?sort=createdAt&dir=asc"

# Sort by total descending
curl "/api/admin/orders?sort=total&dir=desc"

# Sort by total ascending
curl "/api/admin/orders?sort=total&dir=asc"
```

**E2E Test**:
```bash
cd frontend
npx playwright test admin-orders-sorting.spec.ts
```

---

**Generated-by**: Claude Code (AG28 Protocol)
**Timestamp**: 2025-10-17
