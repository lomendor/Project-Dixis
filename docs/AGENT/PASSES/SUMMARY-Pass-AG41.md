# Pass-AG41 — Admin Orders: Reset Filters

**Status**: ✅ COMPLETE
**Branch**: `feat/AG41-admin-orders-reset-filters`
**Protocol**: STOP-on-failure | STRICT NO-VISION
**Date**: 2025-10-19

---

## 🎯 OBJECTIVE

Add "Reset filters" button on `/admin/orders` page that:
1. Clears all filter inputs to defaults
2. Removes `dixis.adminOrders.filters` from localStorage
3. Resets URL to `/admin/orders` (no query params)
4. Shows success toast "Επαναφέρθηκαν" for 1.2s

**Before AG41**: No quick way to reset all filters
**After AG41**: One-click reset to defaults

---

## ✅ IMPLEMENTATION

### UI Changes (`frontend/src/app/admin/orders/page.tsx`)

**State Management**:
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

**UI Elements (Lines 544-559)**:
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

**Test Flow**:
1. Create order to get orderNo
2. Navigate to `/admin/orders`
3. Apply multiple filters (ordNo, date range, sort by total)
4. Wait for localStorage sync
5. Verify export href contains filters (before reset)
6. Click "Reset filters" button
7. Verify success toast appears
8. Verify inputs cleared
9. Verify export href without ordNo/from/to
10. Verify localStorage cleared/reset

**Key Assertions**:
```typescript
// Before reset
expect(hrefBefore || '').toMatch(/ordNo=/);

// After reset
await expect(page.getByTestId('filters-reset-flag')).toBeVisible();
await expect(page.getByTestId('filters-reset-flag')).toHaveText('Επαναφέρθηκαν');
await expect(page.getByPlaceholder('Order No (DX-YYYYMMDD-####)')).toHaveValue('');
expect(hrefAfter || '').not.toMatch(/ordNo=/);
expect(hrefAfter || '').not.toMatch(/from=|to=/);
```

---

## 📊 FILES MODIFIED

1. `frontend/src/app/admin/orders/page.tsx` - Reset functionality + toolbar
2. `frontend/tests/e2e/admin-orders-reset-filters.spec.ts` - E2E test (NEW)
3. Documentation files (NEW)

**Total Changes**: 1 code file (~35 lines), 1 test file (~60 lines), 4 documentation files

---

## 🎯 UX IMPROVEMENTS

### Before AG41
- ❌ No quick way to reset filters
- ❌ Must manually clear each input
- ❌ Must manually clear URL
- ❌ localStorage persists old filters

### After AG41
- ✅ One-click reset button
- ✅ All inputs cleared to defaults
- ✅ URL reset to base path
- ✅ localStorage cleared
- ✅ Visual feedback toast

---

## 🔍 RESET BEHAVIOR

**What gets reset:**
- All filter inputs (q, pc, method, status, ordNo)
- Date range (fromISO, toISO)
- Sort settings (back to createdAt desc)
- Page number (back to 1)
- URL query params (cleared)
- localStorage key (removed)

**What is preserved:**
- Page size (admin's preference)

**After reset defaults:**
- sortKey: 'createdAt'
- sortDir: 'desc'
- page: 1
- All filters: empty

---

## 🔒 SECURITY & PRIVACY

**Security**: 🟢 NO CHANGE (client-side state only)
**Privacy**: 🟢 NO CHANGE

---

**Generated-by**: Claude Code (AG41 Protocol)
**Timestamp**: 2025-10-19
**Status**: ✅ Ready for review
