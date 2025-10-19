# AG43 — CODEMAP

**Date**: 2025-10-19
**Pass**: AG43
**Scope**: Admin Orders per-row copy actions

---

## 📂 FILES MODIFIED

### Admin Orders Page (`frontend/src/app/admin/orders/page.tsx`)

**AG43 Effect (Lines 369-460)**:
```typescript
/* AG43-row-actions */
React.useEffect(() => {
  const table = document.querySelector('[data-testid="orders-scroll"] table') || document.querySelector('table');
  if (!table) return;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  function enhanceRow(tr: HTMLTableRowElement) {
    // Idempotent check
    if ((tr as any).__dixis_actions) return;

    // Extract order number from row text
    const text = tr.innerText || '';
    const m = text.match(/DX-\d{8}-\d{4}/);
    const ordNo = m ? m[0] : null;
    if (!ordNo) return;

    // Inject actions into last cell
    const tds = tr.querySelectorAll('td');
    if (!tds.length) return;
    const host = tds[tds.length - 1];

    // Create action buttons + toast
    const wrap = document.createElement('div');
    wrap.setAttribute('data-testid', 'row-actions');
    // ... button creation ...

    btn1.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(ordNo!); } catch { }
      showToast();
    });

    btn2.addEventListener('click', async () => {
      const url = origin ? `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo!)}` : ordNo!;
      try { await navigator.clipboard.writeText(url); } catch { }
      showToast();
    });

    host.appendChild(wrap);
    (tr as any).__dixis_actions = true;
  }

  // Initial enhancement
  const tbody = table.querySelector('tbody') || table;
  Array.from(tbody.querySelectorAll('tr')).forEach(enhanceRow);

  // Watch for new rows (pagination/filtering)
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => {
        if (n instanceof HTMLTableRowElement) enhanceRow(n);
        if (n instanceof HTMLElement) n.querySelectorAll && n.querySelectorAll('tr').forEach((tr) => enhanceRow(tr as HTMLTableRowElement));
      });
    }
  });
  mo.observe(tbody, { childList: true, subtree: true });

  return () => mo.disconnect();
}, []);
```

**Positioning**:
- After localStorage sync effect (line 367)
- Before buildExportUrl function (line 462)
- Inside AdminOrders component

---

### E2E Test (`frontend/tests/e2e/admin-row-copy-actions.spec.ts`)

**Lines**: +38 (NEW file)

**Test Flow**:
1. Create 2 orders via checkout flow
2. Navigate to `/admin/orders`
3. Assert `row-copy-ordno` visible
4. Assert `row-copy-link` visible
5. Click `row-copy-ordno` → assert toast visible
6. Click `row-copy-link` → assert toast visible

**Test Data Attributes**:
- `row-actions` - Container div
- `row-copy-ordno` - Copy order number button
- `row-copy-link` - Copy lookup link button
- `row-copy-toast` - Success toast span

---

## 🎨 UI COMPONENTS

**Action Block Structure**:
```
<div data-testid="row-actions">
  ├── <button data-testid="row-copy-ordno">Copy ordNo</button>
  ├── <button data-testid="row-copy-link">Copy link</button>
  └── <span data-testid="row-copy-toast">Αντιγράφηκε</span>
</div>
```

**Styling Classes**:
- Container: `display:flex; gap:6px; align-items:center; flex-wrap:wrap`
- Buttons: `border px-2 py-1 rounded text-xs`
- Toast: `text-xs text-green-700` + `display:none` (shown for 1.2s)

---

## 🔗 STATE DEPENDENCIES

**Required Data**:
- Order number from row text (regex extraction: `/DX-\d{8}-\d{4}/`)
- Window origin for building lookup URL

**No React State Required**:
- All state is DOM-based (button click → toast display)
- No useState or useEffect dependencies

---

## 📱 RESPONSIVE DESIGN

**Flex Wrap**: `flex-wrap:wrap` ensures buttons wrap on narrow cells
**Text Size**: `text-xs` (12px) for compact appearance
**Gap**: 6px spacing between buttons and toast

---

## 🔍 TECHNICAL DETAILS

**MutationObserver**:
- Watches `tbody` for added nodes (new rows from pagination/filtering)
- Idempotent enhancement via `__dixis_actions` flag
- Disconnects on component unmount

**Order Number Extraction**:
- Regex: `/DX-\d{8}-\d{4}/` matches "DX-20251019-0001" format
- Searches entire row text (not just Order # cell)

**Clipboard API**:
- Uses `navigator.clipboard.writeText()`
- No fallback (assumes modern browser in admin context)

---

**Generated-by**: Claude Code (AG43 Protocol)
**Timestamp**: 2025-10-19
