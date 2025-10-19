# AG45 — CODEMAP

**Date**: 2025-10-19
**Pass**: AG45
**Scope**: Admin orders column visibility presets

---

## 📂 FILES MODIFIED

### Admin Orders Page (`frontend/src/app/admin/orders/page.tsx`)

**Column Visibility Effect (Lines 369-513)**:
```typescript
/* AG45-columns */
React.useEffect(() => {
  const KEY = 'dixis.adminOrders.columns';
  // Extract table elements
  // Build headerKeys() function
  // loadMap/saveMap functions for localStorage
  // apply() function to set display style
  // Build toolbar UI with checkboxes
  // MutationObserver for table changes
  return () => mo.disconnect();
}, []);
```

**Key Functions**:
- `headerKeys()` - Extracts column keys from table headers
- `loadMap(keys)` - Loads visibility map from localStorage
- `saveMap(map)` - Persists visibility map to localStorage
- `apply(map, keys)` - Applies visibility (display style) to th/td elements

**DOM Structure Created**:
```
[data-testid="filters-toolbar"]
└── [data-testid="columns-toolbar"]
     ├── <span>Columns:</span>
     ├── <label>
     │    ├── <input type="checkbox" data-testid="col-toggle-0">
     │    └── <span>Order #</span>
     ├── <label>
     │    ├── <input type="checkbox" data-testid="col-toggle-1">
     │    └── <span>Id</span>
     └── ... (one label per column)
```

**localStorage Key**:
- `dixis.adminOrders.columns`
- Value: `{"order #": true, "id": false, "ημ/νία": true, ...}`

**Positioning**:
- Appends to existing `filters-toolbar` (AG41)
- Falls back to creating new toolbar before `orders-scroll`

---

### E2E Test (`frontend/tests/e2e/admin-column-visibility.spec.ts`)

**Lines**: +39 (NEW file)

**Test Flow**:
1. Create order via checkout flow
2. Navigate to `/admin/orders`
3. Assert toolbar visible
4. Uncheck col-toggle-0
5. Assert first header hidden
6. Assert first cell hidden
7. Reload page
8. Assert col-toggle-0 still unchecked
9. Assert first header still hidden
10. Re-check col-toggle-0
11. Assert first header visible

**Test Data Attributes**:
- `columns-toolbar` - Columns toolbar container
- `col-toggle-{index}` - Checkbox for column at index

---

## 🎨 UI COMPONENTS

**Toolbar Structure**:
```
<div data-testid="columns-toolbar" class="flex items-center gap-3 flex-wrap">
  <span class="text-xs text-neutral-600">Columns:</span>
  <label class="text-xs flex items-center gap-1 border rounded px-2 py-1">
    <input type="checkbox" data-testid="col-toggle-0">
    <span>Order #</span>
  </label>
  <!-- repeat for each column -->
</div>
```

**Styling Classes**:
- Toolbar: `flex items-center gap-3 flex-wrap`
- Label: `text-xs flex items-center gap-1 border rounded px-2 py-1`
- Text: `text-xs text-neutral-600`

---

## 🔧 TECHNICAL DETAILS

**Column Key Extraction**:
- Read `th.textContent`
- Trim, lowercase, replace multiple spaces with single space
- Fallback to `col{index}` for empty headers
- Example: "Ημ/νία" → "ημ/νία", "" → "col2"

**Visibility Application**:
- Set `th.style.display = vis ? '' : 'none'`
- Apply to both headers and cells
- Loop through all rows for each column

**MutationObserver**:
- Watches `tbody` and `thead` for changes
- On mutation: re-extract keys, rebuild UI if needed, re-apply visibility
- Ensures visibility persists across pagination, filtering, sorting

**Idempotent Toolbar Creation**:
- Checks if `columns-toolbar` already exists
- Only creates once, then reuses
- Prevents duplicate toolbars on re-renders

---

## 📱 RESPONSIVE DESIGN

**Toolbar Wrapping**:
- `flex-wrap` allows checkboxes to wrap on small screens
- Each checkbox labeled with short column name
- Compact design (text-xs, small padding)

---

## 🔍 STATE MANAGEMENT

**localStorage Persistence**:
- Key: `dixis.adminOrders.columns`
- Value: JSON object mapping column keys to booleans
- Defaults: all columns visible if no saved state
- Saved on every checkbox change

**State Flow**:
1. Load map from localStorage on mount
2. Apply visibility to table
3. User toggles checkbox
4. Update map
5. Save to localStorage
6. Re-apply visibility

---

**Generated-by**: Claude Code (AG45 Protocol)
**Timestamp**: 2025-10-19
