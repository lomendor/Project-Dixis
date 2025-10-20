# AG47 — CODEMAP

**Date**: 2025-10-20
**Pass**: AG47
**Scope**: Admin Orders quick column presets (All/Minimal/Finance)

---

## 📂 FILES MODIFIED

### Admin Orders Page (`frontend/src/app/admin/orders/page.tsx`)

**AG47 Presets Effect (Lines 515-614)**:
```typescript
/* AG47-presets */
React.useEffect(() => {
  const toolbar = document.querySelector('[data-testid="columns-toolbar"]') as HTMLElement | null;
  if (!toolbar) return () => {};

  // Helper functions
  function dispatchChange(cb: HTMLInputElement) {
    cb.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function toggles() {
    return Array.from(document.querySelectorAll('[data-testid="columns-toolbar"] input[type=checkbox]')) as HTMLInputElement[];
  }

  function mkBtn(testId: string, label: string, title: string) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-testid', testId);
    btn.textContent = label;
    btn.title = title;
    btn.className = 'border px-2 py-1 rounded text-xs hover:bg-gray-100';
    return btn;
  }

  // Create presets container
  let presets = document.querySelector('[data-testid="columns-presets"]') as HTMLElement | null;
  if (!presets) {
    presets = document.createElement('div');
    presets.setAttribute('data-testid', 'columns-presets');
    presets.className = 'flex items-center gap-2 flex-wrap';

    const label = document.createElement('span');
    label.textContent = 'Presets:';
    label.className = 'text-xs text-neutral-600';
    presets.appendChild(label);

    // Create 3 preset buttons
    const btnAll = mkBtn('preset-all', 'All', 'Show all columns');
    const btnMin = mkBtn('preset-minimal', 'Minimal', 'Keep first 3 columns');
    const btnFin = mkBtn('preset-finance', 'Finance', 'Totals/Shipping/Amount-focused');

    presets.appendChild(btnAll);
    presets.appendChild(btnMin);
    presets.appendChild(btnFin);

    // Insert after columns-toolbar
    toolbar.parentElement?.insertBefore(presets, toolbar.nextSibling);
  }

  // Wire up preset buttons
  const allBtn = document.querySelector('[data-testid="preset-all"]');
  const minBtn = document.querySelector('[data-testid="preset-minimal"]');
  const finBtn = document.querySelector('[data-testid="preset-finance"]');

  // All preset: check all columns
  const onAll = () => {
    toggles().forEach(cb => {
      if (!cb.checked) {
        cb.checked = true;
        dispatchChange(cb);
      }
    });
  };

  // Minimal preset: first 3 columns only
  const onMin = () => {
    toggles().forEach((cb, idx) => {
      const want = idx < 3;
      if (cb.checked !== want) {
        cb.checked = want;
        dispatchChange(cb);
      }
    });
  };

  // Finance preset: first column + financial columns
  const onFin = () => {
    toggles().forEach((cb, idx) => {
      const label = (cb.parentElement?.textContent || '').toLowerCase();
      const isFinance = /total|subtotal|σύνολο|υποσύνολο|shipping|μεταφορ|tax|φόρ|amount|ποσό/.test(label);
      const want = idx === 0 || isFinance;
      if (cb.checked !== want) {
        cb.checked = want;
        dispatchChange(cb);
      }
    });
  };

  allBtn?.addEventListener('click', onAll);
  minBtn?.addEventListener('click', onMin);
  finBtn?.addEventListener('click', onFin);

  return () => {
    allBtn?.removeEventListener('click', onAll);
    minBtn?.removeEventListener('click', onMin);
    finBtn?.removeEventListener('click', onFin);
  };
}, []);
```

**Changes Summary**:
- **Lines Added**: ~100 (effect definition)
- **Positioning**: After AG45 columns effect (line 513), before AG43 row actions effect (line 616)
- **Dependencies**: Requires AG45 columns-toolbar to exist
- **Integration**: Operates via DOM events (dispatchChange) on AG45 checkboxes

---

## 📂 FILES CREATED

### E2E Test (`frontend/tests/e2e/admin-column-presets.spec.ts`)

**Lines**: +58 (NEW file)

**Test Flow**:
```typescript
test('Admin Orders — Column presets (All/Minimal/Finance) apply and persist', async ({ page }) => {
  // 1. Navigate to admin orders
  await page.goto('/admin/orders');

  // 2. Wait for DOM augmentation effects
  await page.waitForSelector('[data-testid="columns-toolbar"]');
  await page.waitForSelector('[data-testid="columns-presets"]');

  // 3. Verify presets buttons exist
  await expect(page.getByTestId('preset-all')).toBeVisible();
  await expect(page.getByTestId('preset-minimal')).toBeVisible();
  await expect(page.getByTestId('preset-finance')).toBeVisible();

  // 4. Test All preset
  await page.getByTestId('preset-all').click();
  const countAll = await page.evaluate(() =>
    Array.from(document.querySelectorAll('thead th'))
      .filter(th => (th as HTMLElement).style.display !== 'none').length
  );
  expect(countAll).toBeGreaterThan(0);

  // 5. Test Minimal preset
  await page.getByTestId('preset-minimal').click();
  const countMin = await page.evaluate(() =>
    Array.from(document.querySelectorAll('thead th'))
      .filter(th => (th as HTMLElement).style.display !== 'none').length
  );
  expect(countMin).toBeLessThanOrEqual(Math.min(3, countAll));

  // 6. Test persistence (reload)
  await page.reload();
  await page.waitForSelector('[data-testid="columns-toolbar"]');
  const countMinReload = await page.evaluate(() =>
    Array.from(document.querySelectorAll('thead th'))
      .filter(th => (th as HTMLElement).style.display !== 'none').length
  );
  expect(countMinReload).toBe(countMin); // Persisted via AG45

  // 7. Test Finance preset
  await page.getByTestId('preset-finance').click();
  const countFin = await page.evaluate(() =>
    Array.from(document.querySelectorAll('thead th'))
      .filter(th => (th as HTMLElement).style.display !== 'none').length
  );
  expect(countFin).toBeGreaterThanOrEqual(2); // First + finance columns

  // 8. Verify specific finance column visible
  const totalColVisible = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('thead th'));
    const totalTh = ths.find(th => th.textContent?.includes('Σύνολο'));
    return totalTh ? (totalTh as HTMLElement).style.display !== 'none' : false;
  });
  expect(totalColVisible).toBe(true);
});
```

**Test Data Attributes**:
- `columns-presets` - Presets container
- `preset-all` - All columns button
- `preset-minimal` - Minimal columns button
- `preset-finance` - Finance columns button

---

## 🎨 UI COMPONENTS

**Presets Toolbar Structure**:
```html
<div data-testid="columns-presets" class="flex items-center gap-2 flex-wrap">
  <span class="text-xs text-neutral-600">Presets:</span>
  <button data-testid="preset-all" class="border px-2 py-1 rounded text-xs hover:bg-gray-100" title="Show all columns">
    All
  </button>
  <button data-testid="preset-minimal" class="border px-2 py-1 rounded text-xs hover:bg-gray-100" title="Keep first 3 columns">
    Minimal
  </button>
  <button data-testid="preset-finance" class="border px-2 py-1 rounded text-xs hover:bg-gray-100" title="Totals/Shipping/Amount-focused">
    Finance
  </button>
</div>
```

**Styling Classes**:
- Container: `flex items-center gap-2 flex-wrap`
- Label: `text-xs text-neutral-600`
- Buttons: `border px-2 py-1 rounded text-xs hover:bg-gray-100`

---

## 🔍 DATA FLOW

**Preset Application Flow**:
```
User clicks preset button
  ↓
onAll/onMin/onFin handler executes
  ↓
toggles() retrieves all AG45 checkboxes
  ↓
Set checkbox.checked based on preset logic
  ↓
dispatchChange(checkbox) fires 'change' event
  ↓
AG45 checkbox listener receives event
  ↓
AG45 saveMap() saves to localStorage
  ↓
AG45 apply() updates th/td visibility
```

**Preset Logic**:
- **All**: `cb.checked = true` for all checkboxes
- **Minimal**: `cb.checked = (idx < 3)` for first 3 checkboxes
- **Finance**: `cb.checked = (idx === 0 || /total|shipping|.../.test(label))`

---

## 🎯 HELPER FUNCTIONS

### dispatchChange()
```typescript
function dispatchChange(cb: HTMLInputElement) {
  cb.dispatchEvent(new Event('change', { bubbles: true }));
}
```
**Purpose**: Programmatically trigger AG45's checkbox change listener
**Why needed**: Setting `checkbox.checked` doesn't fire events automatically

### toggles()
```typescript
function toggles() {
  return Array.from(document.querySelectorAll('[data-testid="columns-toolbar"] input[type=checkbox]')) as HTMLInputElement[];
}
```
**Purpose**: Get all AG45 column checkboxes
**Returns**: Array of checkbox elements

### mkBtn()
```typescript
function mkBtn(testId: string, label: string, title: string) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('data-testid', testId);
  btn.textContent = label;
  btn.title = title;
  btn.className = 'border px-2 py-1 rounded text-xs hover:bg-gray-100';
  return btn;
}
```
**Purpose**: Create styled preset button with consistent attributes
**Returns**: Button element ready for insertion

---

## 🔧 PRESET IMPLEMENTATIONS

### All Preset
```typescript
const onAll = () => {
  toggles().forEach(cb => {
    if (!cb.checked) {
      cb.checked = true;
      dispatchChange(cb);
    }
  });
};
```
**Effect**: Checks all column checkboxes
**Optimization**: Only dispatches change if checkbox not already checked

### Minimal Preset
```typescript
const onMin = () => {
  toggles().forEach((cb, idx) => {
    const want = idx < 3;
    if (cb.checked !== want) {
      cb.checked = want;
      dispatchChange(cb);
    }
  });
};
```
**Effect**: Checks first 3 columns, unchecks all others
**Logic**: `idx < 3` → true for first 3 checkboxes only

### Finance Preset
```typescript
const onFin = () => {
  toggles().forEach((cb, idx) => {
    const label = (cb.parentElement?.textContent || '').toLowerCase();
    const isFinance = /total|subtotal|σύνολο|υποσύνολο|shipping|μεταφορ|tax|φόρ|amount|ποσό/.test(label);
    const want = idx === 0 || isFinance;
    if (cb.checked !== want) {
      cb.checked = want;
      dispatchChange(cb);
    }
  });
};
```
**Effect**: Checks first column + columns with financial keywords
**Regex**: Matches Greek & English terms: total, subtotal, shipping, tax, amount, etc.
**Logic**: `idx === 0 || isFinance` → first column always shown + finance columns

---

## 📊 INTEGRATION WITH AG45

**Dependencies**:
- Requires `[data-testid="columns-toolbar"]` to exist (AG45 creates this)
- Operates on AG45's checkboxes: `input[type=checkbox]` within toolbar
- Triggers AG45's change event listeners via `dispatchChange()`

**No Duplication**:
- AG47 doesn't implement its own localStorage logic
- AG47 doesn't apply visibility styles directly
- AG45 handles all state management and DOM updates

**Graceful Degradation**:
- If AG45 toolbar missing, effect returns early (no errors)
- If AG45 checkboxes missing, `toggles()` returns empty array (no errors)

---

## 🔄 CLEANUP & LIFECYCLE

**Effect Cleanup**:
```typescript
return () => {
  allBtn?.removeEventListener('click', onAll);
  minBtn?.removeEventListener('click', onMin);
  finBtn?.removeEventListener('click', onFin);
};
```

**Why needed**: Prevent memory leaks on component unmount
**Safety**: Optional chaining (`?.`) handles buttons not found

**Effect Dependencies**: `[]` (empty array)
**Why**: Effect runs once on mount, DOM elements persist across renders

---

**Generated-by**: Claude Code (AG47 Protocol)
**Timestamp**: 2025-10-20
