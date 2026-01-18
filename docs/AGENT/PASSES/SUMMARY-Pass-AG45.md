# Pass-AG45 — Admin Orders: Column Visibility Presets

**Status**: ✅ COMPLETE
**Branch**: `feat/AG45-admin-column-visibility`
**Protocol**: STOP-on-failure | STRICT NO-VISION
**Date**: 2025-10-19

---

## 🎯 OBJECTIVE

Add column visibility controls on `/admin/orders` page:
1. Toolbar with checkbox toggles for each column
2. Persist visibility state to localStorage
3. Reapply visibility on table changes (pagination, filtering, sorting)
4. Pure client-side DOM augmentation (no backend changes)

**Before AG45**: All columns always visible, no customization
**After AG45**: Admins can hide/show columns per preference, state persists across sessions

---

## ✅ IMPLEMENTATION

### UI Changes (`frontend/src/app/admin/orders/page.tsx`)

**Column Visibility Effect (Lines 369-513)**:
```typescript
/* AG45-columns */
React.useEffect(() => {
  const KEY = 'dixis.adminOrders.columns';
  const scroll = document.querySelector('[data-testid="orders-scroll"]');
  const table = scroll?.querySelector('table') || document.querySelector('table');
  if (!table) return () => {};

  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody') || table;
  if (!thead || !tbody) return () => {};

  // Extract current header keys
  function headerKeys() {
    const ths = Array.from(thead.querySelectorAll('th'));
    return ths.map((th, i) => {
      const k = (th.textContent || `col${i}`).trim().toLowerCase().replace(/\s+/g,' ');
      return { i, key: k || `col${i}` };
    });
  }

  // Load/Save visibility map
  function loadMap(keys: {i:number, key:string}[]) {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return Object.fromEntries(keys.map(k => [k.key, true]));
      const parsed = JSON.parse(raw);
      const map = Object.fromEntries(keys.map(k => [k.key, parsed[k.key] !== false]));
      return map;
    } catch { return Object.fromEntries(keys.map(k => [k.key, true])); }
  }
  function saveMap(map: any) {
    try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
  }

  // Apply visibility to th/td
  function apply(map: any, keys: {i:number, key:string}[]){
    const ths = Array.from(thead!.querySelectorAll('th'));
    keys.forEach(({i, key}) => {
      const vis = map[key] !== false;
      const disp = vis ? '' : 'none';
      if (ths[i]) (ths[i] as HTMLElement).style.display = disp;
    });
    const rows = Array.from(tbody!.querySelectorAll('tr'));
    rows.forEach(tr => {
      const tds = Array.from(tr.querySelectorAll('td'));
      keys.forEach(({i, key}) => {
        const vis = map[key] !== false;
        const disp = vis ? '' : 'none';
        if (tds[i]) (tds[i] as HTMLElement).style.display = disp;
      });
    });
  }

  // Build/attach toolbar UI
  const keys = headerKeys();
  let map = loadMap(keys);

  // Find toolbar host (reuse filters-toolbar if exists)
  let host = document.querySelector('[data-testid="filters-toolbar"]') as HTMLElement | null;
  const scrollDiv = document.querySelector('[data-testid="orders-scroll"]');
  if (!host) {
    host = document.createElement('div');
    host.className = 'mb-2 flex items-center gap-3';
    host.setAttribute('data-testid','filters-toolbar');
    if (scrollDiv && scrollDiv.parentElement) {
      scrollDiv.parentElement.insertBefore(host, scrollDiv);
    } else {
      table.parentElement?.insertBefore(host, table);
    }
  }

  // Columns sub-toolbar
  let bar = document.querySelector('[data-testid="columns-toolbar"]') as HTMLElement | null;
  if (!bar) {
    bar = document.createElement('div');
    bar.setAttribute('data-testid','columns-toolbar');
    bar.className = 'flex items-center gap-3 flex-wrap';
    const label = document.createElement('span');
    label.textContent = 'Columns:';
    label.className = 'text-xs text-neutral-600';
    bar.appendChild(label);

    keys.forEach(({i, key}) => {
      const pretty = key.charAt(0).toUpperCase() + key.slice(1);
      const wrap = document.createElement('label');
      wrap.className = 'text-xs flex items-center gap-1 border rounded px-2 py-1';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = map[key] !== false;
      cb.setAttribute('data-testid', `col-toggle-${i}`);
      cb.addEventListener('change', () => {
        map[key] = cb.checked;
        saveMap(map);
        apply(map, keys);
      });
      const txt = document.createElement('span');
      txt.textContent = pretty;
      wrap.appendChild(cb); wrap.appendChild(txt);
      bar!.appendChild(wrap);
    });

    host.appendChild(bar);
  }

  // First apply
  apply(map, keys);

  // Observe changes and re-apply (paging, filtering, etc.)
  const mo = new MutationObserver(() => {
    const newKeys = headerKeys();
    // If headers changed, extend map and rebuild UI silently
    if (newKeys.length !== keys.length || newKeys.some((k,idx)=>k.key!==keys[idx].key)) {
      // merge defaults
      newKeys.forEach(k => { if (!(k.key in map)) map[k.key] = true; });
      saveMap(map);
      // Rebuild checkboxes
      const old = bar!.querySelectorAll('label');
      old.forEach(el => el.remove());
      newKeys.forEach(({i, key}) => {
        const pretty = key.charAt(0).toUpperCase() + key.slice(1);
        const wrap = document.createElement('label');
        wrap.className = 'text-xs flex items-center gap-1 border rounded px-2 py-1';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = map[key] !== false;
        cb.setAttribute('data-testid', `col-toggle-${i}`);
        cb.addEventListener('change', () => {
          map[key] = cb.checked;
          saveMap(map);
          apply(map, newKeys);
        });
        const txt = document.createElement('span');
        txt.textContent = pretty;
        wrap.appendChild(cb); wrap.appendChild(txt);
        bar!.appendChild(wrap);
      });
      (keys as any).length = 0; newKeys.forEach(k=>keys.push(k));
    }
    apply(map, keys);
  });
  mo.observe(tbody, { childList: true, subtree: true });
  mo.observe(thead, { childList: true, subtree: true });

  return () => mo.disconnect();
}, []);
```

**Key Features**:
- ✅ DOM augmentation pattern (idempotent, reuses filters-toolbar)
- ✅ Extracts column keys from table headers
- ✅ Loads/saves visibility map to localStorage (`dixis.adminOrders.columns`)
- ✅ Creates checkbox toggle for each column
- ✅ Applies visibility by setting `display: none` on th/td elements
- ✅ MutationObserver re-applies on table changes (pagination, filtering)
- ✅ Handles dynamic header changes (rebuilds UI if headers change)

---

## 🧪 E2E TEST

**File**: `frontend/tests/e2e/admin-column-visibility.spec.ts` (NEW)

**Test Flow**:
1. Create order via checkout flow
2. Navigate to `/admin/orders`
3. Verify columns toolbar is visible
4. Uncheck first column checkbox (col-toggle-0)
5. Assert first header (`thead th`.first()) is hidden
6. Assert first cell in first row is hidden
7. Reload page
8. Assert columns toolbar still visible
9. Assert col-toggle-0 is still unchecked (persistence)
10. Assert first header still hidden
11. Re-check col-toggle-0
12. Assert first header visible again

**Coverage**: Toggle visibility, localStorage persistence, reload behavior, re-enable

---

## 📊 FILES MODIFIED

1. ✅ `frontend/src/app/admin/orders/page.tsx` (+144 lines)
2. ✅ `frontend/tests/e2e/admin-column-visibility.spec.ts` (+39 lines, NEW)
3. ✅ `docs/AGENT/PASSES/SUMMARY-Pass-AG45.md` (NEW)
4. ✅ `docs/reports/2025-10-19/AG45-CODEMAP.md` (NEW)
5. ✅ `docs/reports/2025-10-19/AG45-TEST-REPORT.md` (NEW)
6. ✅ `docs/reports/2025-10-19/AG45-RISKS-NEXT.md` (NEW)

**Total Changes**: 1 code file, 1 test file, 4 documentation files

---

## 🎯 UX IMPROVEMENTS

### Before AG45
- ❌ All columns always visible
- ❌ No customization for admin preferences
- ❌ Cluttered table on small screens

### After AG45
- ✅ Toggle any column on/off
- ✅ Preferences persist across sessions
- ✅ Cleaner table layout (hide irrelevant columns)
- ✅ Toolbar integrates with existing filters toolbar

---

## 🎨 DESIGN CHOICES

**DOM Augmentation Pattern**:
- Reuses existing `[data-testid="filters-toolbar"]` if present
- Creates toolbar only once (idempotent)
- MutationObserver ensures re-application on table updates

**localStorage Key**:
- `dixis.adminOrders.columns` stores visibility map
- Example: `{"order #": true, "id": false, "ημ/νία": true}`
- Defaults: all columns visible if no saved state

**Column Keys**:
- Extracted from header text (lowercase, spaces replaced)
- Fallback: `col{index}` for empty headers
- Pretty labels: First char uppercase

**Visibility Application**:
- CSS `display` property (`'' | 'none'`)
- Applied to both th (header) and td (cells)
- Re-applied on every table mutation

---

## 🔗 INTEGRATION

**Related Features**:
- **AG41**: Reuses filters-toolbar element ✅
- **AG39**: Works with sticky header scroll container ✅
- **AG36**: Compatible with pagination/sorting ✅

---

## 🔒 SECURITY & PRIVACY

**Security**: 🟢 NO CHANGE (client-side display only)
**Privacy**: 🟢 NO CHANGE (no data exposed, only visibility toggled)

---

**Generated-by**: Claude Code (AG45 Protocol)
**Timestamp**: 2025-10-19
**Status**: ✅ Ready for review
