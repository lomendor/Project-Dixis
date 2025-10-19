# AG41 — CODEMAP

**Date**: 2025-10-19
**Pass**: AG41
**Scope**: Reset filters button on admin orders page

---

## 📂 FILES MODIFIED

### Admin Orders Page (`frontend/src/app/admin/orders/page.tsx`)

**New State (Line 54)**:
```typescript
const [resetMsg, setResetMsg] = React.useState(''); // AG41: reset toast flag
```

**Reset Function (Lines 73-103)**:
```typescript
// AG41: Reset all filters to defaults
function onResetFilters() {
  try {
    // Clear localStorage
    localStorage.removeItem('dixis.adminOrders.filters');
  } catch {}

  try {
    // Reset all filter state to defaults
    setQ('');
    setPc('');
    setMethod('');
    setStatus('');
    setOrdNo('');
    setFromISO('');
    setToISO('');
    setSortKey('createdAt');
    setSortDir('desc');
    setPage(1);
    // Note: pageSize is preserved (admin's choice)

    // Clear URL
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/admin/orders');
    }

    // Show success toast
    setResetMsg('Επαναφέρθηκαν');
    setTimeout(() => setResetMsg(''), 1200);
  } catch {}
}
```

**Toolbar UI (Lines 544-559)**:
```typescript
{/* AG41: Filters toolbar with Reset button */}
<div className="mt-3 mb-2 flex items-center gap-3" data-testid="filters-toolbar">
  <button
    type="button"
    className="border px-3 py-2 rounded hover:bg-gray-100"
    data-testid="filters-reset"
    onClick={onResetFilters}
  >
    Reset filters
  </button>
  {resetMsg && (
    <span data-testid="filters-reset-flag" className="text-xs text-green-700">
      {resetMsg}
    </span>
  )}
</div>
```

---

### E2E Test (`frontend/tests/e2e/admin-orders-reset-filters.spec.ts`)

**Lines**: +60 (NEW file)

**Test Flow**:
1. Create order via checkout flow
2. Navigate to admin orders
3. Apply filters (ordNo, date, sort)
4. Wait for localStorage sync
5. Capture export href (should contain filters)
6. Click Reset button
7. Verify toast appears
8. Verify inputs cleared
9. Verify export href clean
10. Verify localStorage cleared

**Key Test IDs**:
- `filters-reset` - Reset button
- `filters-reset-flag` - Success toast
- `filters-toolbar` - Container div

---

## 🎨 RESET MECHANICS

**1. State Reset**:
All filter state variables reset to empty strings or defaults:
- `q`, `pc`, `method`, `status`, `ordNo`: → `''`
- `fromISO`, `toISO`: → `''`
- `sortKey`: → `'createdAt'`
- `sortDir`: → `'desc'`
- `page`: → `1`
- `pageSize`: **preserved** (admin preference)

**2. localStorage Clear**:
```typescript
localStorage.removeItem('dixis.adminOrders.filters');
```

**3. URL Reset**:
```typescript
window.history.replaceState(null, '', '/admin/orders');
```

**4. Toast Pattern**:
- Message: "Επαναφέρθηκαν"
- Duration: 1.2 seconds
- Color: `text-green-700`

---

## 🔗 INTEGRATION

**Related Features**:
- **AG33**: Filter persistence (localStorage) - AG41 clears this
- **AG36**: Keyboard shortcuts - Reset can be triggered after using filters
- **AG37**: CSV export - Reset affects export filename
- **AG39**: Sticky header - Visual layout remains consistent

**Sync Effect**:
After reset, the AG33 sync effect (lines 293-334) will:
1. Detect empty filters
2. Update URL to `/admin/orders` (no params)
3. Save defaults to localStorage

---

**Generated-by**: Claude Code (AG41 Protocol)
**Timestamp**: 2025-10-19
