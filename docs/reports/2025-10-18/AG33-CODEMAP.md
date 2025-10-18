# CODEMAP - AG33 Admin Orders Remember Filters

**Date**: 2025-10-18
**PR**: #600
**Pass**: AG33
**Feature**: URL + localStorage filter persistence for admin orders

## Files Modified

### 1. `frontend/src/app/admin/orders/page.tsx`
**Lines Modified**: ~18, 62-66, 120-164, 193-235, 246-247, 366, 508

**Key Changes**:

**Hydration Guard** (line 18):
```typescript
const hydratedRef = React.useRef(false); // AG33: one-time hydration guard
```

**URL Parser** (lines 62-66):
```typescript
// AG33: Parse query string from current browser location
function parseQSFromLocation() {
  if (typeof window === 'undefined') return new URLSearchParams('');
  return new URLSearchParams(window.location.search || '');
}
```

**Hydration Effect** (lines 120-164):
- Runs once on mount (guarded by hydratedRef)
- Reads filters from URL (priority) or localStorage (fallback)
- Restores all 11 filter/state variables
- Uses `pick()` helper for priority logic

**Sync Effect** (lines 193-235):
- Runs on every filter/pagination/sort change
- Updates URL via `window.history.replaceState()`
- Saves to `localStorage.setItem('dixis.adminOrders.filters', ...)`
- Dependency array includes all 11 variables

**Export URL Update** (lines 246-247):
```typescript
params.set('sort', sortKey); // AG33: include sort
params.set('dir', sortDir); // AG33: include dir
```

**UI Fixes**:
- Line 366: Updated placeholder to match E2E expectations
- Line 508: Changed `data-testid="page-size-selector"` → `"page-size"`

## Files Created

### 2. `frontend/tests/e2e/admin-orders-remember-filters.spec.ts` (NEW)
**Purpose**: E2E test for filter persistence across page reload

**Test Steps**:
1. Create order via checkout flow
2. Get ordNo from confirmation
3. Navigate to /admin/orders
4. Set filters: ordNo, Today, sort=total, pageSize=10
5. Verify Export link contains filters
6. Reload page
7. Assert filters persisted

### 3. `docs/AGENT/SUMMARY/Pass-AG33.md` (NEW)
**Purpose**: Complete implementation documentation

**Sections**:
- Implementation details
- Key patterns (URL priority, one-time hydration, replaceState)
- UX improvements
- Integration with AG27/AG28

## Code Map Summary

**Total Changes**: 3 files (+563/-2 lines)
- UI enhancement: 1 file modified (~150 lines added)
- E2E test: 1 file created (~50 lines)
- Documentation: 1 file created (~360 lines)

**State Variables Covered**: 11 total
1. q (search)
2. pc (postal code)
3. method (shipping method)
4. status (payment status)
5. ordNo (order number)
6. fromISO (date range start)
7. toISO (date range end)
8. sortKey (column)
9. sortDir (direction)
10. pageSize (pagination)
11. page (current page)

**Dependencies**: None (uses standard Web APIs: localStorage, History API, URLSearchParams)

**Integration Points**:
- AG27: Summary bar reflects filtered results
- AG28: Sorting state persisted
- Export CSV: Now includes sort/dir parameters
