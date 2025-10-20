# AG50 — CODEMAP

**Date**: 2025-10-20
**Pass**: AG50
**Scope**: Admin Orders: Quick filter chips (status/method) + Clear-all

---

## 📂 FILES MODIFIED

### Admin Orders Page (`frontend/src/app/admin/orders/page.tsx`)

**AG50-filter-chips Effect (Lines 616-754)**:
```typescript
/* AG50-filter-chips */
React.useEffect(() => {
  // Helper to update URL params
  function setParam(key: string, val: string) { ... }

  // Helper to get current URL param
  function getParam(key: string): string { ... }

  // Helper to create chip button
  function mkChip(testId: string, label: string, filterKey: string, filterVal: string) { ... }

  // Find or create chips toolbar
  let toolbar = document.querySelector('[data-testid="chips-toolbar"]') as HTMLElement | null;
  if (!toolbar) {
    // Create toolbar
    // Add status chips (PAID/PENDING/CANCELED)
    // Add method chips (COURIER/PICKUP)
    // Add clear-all button
    // Insert before orders-scroll
  }

  // Sync visual state with URL changes (popstate)
  function syncVisual() { ... }

  window.addEventListener('popstate', syncVisual);
  return () => window.removeEventListener('popstate', syncVisual);
}, [setStatus, setMethod, setPage]);
```

**Positioning**: After AG47-presets effect, before AG43-row-actions effect

---

## 📂 FILES CREATED

### E2E Test (`frontend/tests/e2e/admin-filter-chips.spec.ts`)

**Test Flow**:
```typescript
test('Admin Orders — Filter chips (status/method) + Clear-all', async ({ page }) => {
  // 1. Navigate to admin orders
  // 2. Verify chips toolbar visible
  // 3. Verify all chips exist (PAID/PENDING/CANCELED/COURIER/PICKUP)
  // 4. Verify clear-all button exists

  // 5. Test status chip toggle
  //    - Click chip
  //    - Verify URL contains status=PAID
  //    - Verify chip background is black (rgb(0, 0, 0))

  // 6. Test method chip toggle
  //    - Click chip
  //    - Verify URL contains method=COURIER
  //    - Verify chip background is black

  // 7. Test clear-all button
  //    - Click clear-all
  //    - Verify URL params removed
  //    - Verify chip backgrounds reset

  // 8. Test chip deactivation
  //    - Click active chip again
  //    - Verify URL param removed
});
```

---

## 🎨 UI COMPONENT STRUCTURE

### Chips Toolbar
```html
<div data-testid="chips-toolbar" class="mt-3 mb-2 flex items-center gap-2 flex-wrap">
  <span class="text-xs text-neutral-600">Quick Filters:</span>

  <span class="text-xs text-neutral-500 ml-2">Status:</span>
  <button data-testid="chip-status-paid" class="border px-2 py-1 rounded text-xs hover:bg-gray-200">PAID</button>
  <button data-testid="chip-status-pending" class="border px-2 py-1 rounded text-xs hover:bg-gray-200">PENDING</button>
  <button data-testid="chip-status-canceled" class="border px-2 py-1 rounded text-xs hover:bg-gray-200">CANCELED</button>

  <span class="text-xs text-neutral-500 ml-2">Method:</span>
  <button data-testid="chip-method-courier" class="border px-2 py-1 rounded text-xs hover:bg-gray-200">COURIER</button>
  <button data-testid="chip-method-pickup" class="border px-2 py-1 rounded text-xs hover:bg-gray-200">PICKUP</button>

  <button data-testid="chip-clear" class="border px-2 py-1 rounded text-xs hover:bg-gray-200 ml-2">Clear all</button>
</div>
```

**Positioning**: Inserted before `[data-testid="orders-scroll"]` using `insertBefore`

---

## 🔧 HELPER FUNCTIONS

### 1. setParam(key, val)
**Purpose**: Update URL parameter and history state
**Logic**:
- If val is truthy, set param
- If val is empty, delete param
- Update URL using `window.history.replaceState`

### 2. getParam(key)
**Purpose**: Get current URL parameter value
**Logic**:
- Parse window.location.search
- Return param value or empty string

### 3. mkChip(testId, label, filterKey, filterVal)
**Purpose**: Create chip button with click handler
**Logic**:
- Create button element
- Set data-testid, label, className
- Check if currently active (black background if URL matches)
- Add click listener:
  - If active → deactivate (clear URL + React state)
  - If inactive → activate (set URL + React state)
  - Reset to page 1

### 4. syncVisual()
**Purpose**: Sync chip backgrounds with URL state (for popstate events)
**Logic**:
- Query all chip buttons
- For each chip:
  - Extract filterKey and filterVal from testId
  - Check current URL param
  - Set background black if active, reset if inactive

---

## 🔄 STATE SYNCHRONIZATION

### React State → URL
```typescript
btn.addEventListener('click', () => {
  const current = getParam(filterKey);
  if (current === filterVal) {
    setParam(filterKey, ''); // Clear URL
    if (filterKey === 'status') setStatus(''); // Clear React state
    if (filterKey === 'method') setMethod(''); // Clear React state
  } else {
    setParam(filterKey, filterVal); // Set URL
    if (filterKey === 'status') setStatus(filterVal); // Set React state
    if (filterKey === 'method') setMethod(filterVal); // Set React state
  }
  setPage(1); // Reset to page 1
});
```

### URL → React State
**Automatic via AG33**: AG33's existing effect (lines 326-367) reads URL params and saves to localStorage, ensuring filter state persists across page reloads.

### Browser Navigation
```typescript
window.addEventListener('popstate', syncVisual);
```
When user hits back/forward, `popstate` fires → `syncVisual()` updates chip backgrounds to match URL.

---

## 🎯 INTEGRATION POINTS

### With AG33 (URL + localStorage)
- **AG50 writes URL params** → AG33 reads them → AG33 saves to localStorage
- **AG33 hydrates state on load** → AG50 reflects state in chip backgrounds
- **No duplication**: AG50 doesn't manage localStorage directly

### With AG36 (Pagination)
- **AG50 calls setPage(1)** when chip toggled
- Ensures paginated results reset to first page on filter change

### With Existing Filter Dropdowns
- **AG50 calls setStatus()/setMethod()** when chips clicked
- Dropdowns and chips stay in sync (both update React state)
- URL params shared between chips and dropdowns

---

## 📊 CSS ACTIVE STATE

**Active Chip**:
```javascript
btn.style.backgroundColor = '#000'; // black
btn.style.color = '#fff'; // white text
```

**Inactive Chip**:
```javascript
btn.style.backgroundColor = ''; // default (white)
btn.style.color = ''; // default (black text)
```

**E2E Verification**:
```typescript
const paidBg = await paidChip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
expect(paidBg).toContain('rgb(0, 0, 0)'); // black = active
```

---

## 🔍 TEST IDS

| Test ID | Purpose |
|---------|---------|
| `chips-toolbar` | Container for all chips |
| `chip-status-paid` | PAID status filter chip |
| `chip-status-pending` | PENDING status filter chip |
| `chip-status-canceled` | CANCELED status filter chip |
| `chip-method-courier` | COURIER method filter chip |
| `chip-method-pickup` | PICKUP method filter chip |
| `chip-clear` | Clear all filters button |

---

## 📐 POSITIONING LOGIC

**Insertion Point**: Before `[data-testid="orders-scroll"]`

**Why**: Chips should appear directly above the orders table, providing visual context for what they're filtering.

**DOM Structure**:
```
<main>
  ...filters controls...
  [data-testid="filters-toolbar"] (AG41 reset button)
  [data-testid="chips-toolbar"] (AG50 - NEW)
  [data-testid="orders-scroll"] (existing table container)
</main>
```

---

**Generated-by**: Claude Code (AG50 Protocol)
**Timestamp**: 2025-10-20
