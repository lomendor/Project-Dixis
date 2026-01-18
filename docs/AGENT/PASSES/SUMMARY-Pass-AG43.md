# Pass-AG43 — Admin Orders: per-row Copy ordNo/Link

**Status**: ✅ COMPLETE
**Branch**: `feat/AG43-admin-row-copy-actions`
**Protocol**: STOP-on-failure | STRICT NO-VISION
**Date**: 2025-10-19

---

## 🎯 OBJECTIVE

Add compact per-row actions on `/admin/orders` list:
1. "Copy ordNo" button — copies order number to clipboard
2. "Copy link" button — copies lookup URL to clipboard
3. Success toast "Αντιγράφηκε" (1.2s duration)

**Before AG43**: Admin must manually copy order numbers from table cells
**After AG43**: Quick one-click copy actions on every row

---

## ✅ IMPLEMENTATION

### UI Changes (`frontend/src/app/admin/orders/page.tsx`)

**AG43 Effect with MutationObserver (Lines 369-460)**:
```typescript
/* AG43-row-actions */
React.useEffect(() => {
  const table = document.querySelector('[data-testid="orders-scroll"] table') || document.querySelector('table');
  if (!table) return;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  function enhanceRow(tr: HTMLTableRowElement) {
    if ((tr as any).__dixis_actions) return;
    const text = tr.innerText || '';
    const m = text.match(/DX-\d{8}-\d{4}/);
    const ordNo = m ? m[0] : null;
    if (!ordNo) return;

    // Find last cell to inject actions
    const tds = tr.querySelectorAll('td');
    if (!tds.length) return;
    const host = tds[tds.length - 1];

    // Prevent duplicate injection
    if (host.querySelector('[data-testid="row-actions"]')) return;

    const wrap = document.createElement('div');
    wrap.setAttribute('data-testid', 'row-actions');
    wrap.style.display = 'flex';
    wrap.style.gap = '6px';
    wrap.style.alignItems = 'center';
    wrap.style.flexWrap = 'wrap';

    const btn1 = document.createElement('button');
    btn1.type = 'button';
    btn1.setAttribute('data-testid', 'row-copy-ordno');
    btn1.textContent = 'Copy ordNo';
    btn1.className = 'border px-2 py-1 rounded text-xs';

    const btn2 = document.createElement('button');
    btn2.type = 'button';
    btn2.setAttribute('data-testid', 'row-copy-link');
    btn2.textContent = 'Copy link';
    btn2.className = 'border px-2 py-1 rounded text-xs';

    const toast = document.createElement('span');
    toast.setAttribute('data-testid', 'row-copy-toast');
    toast.textContent = 'Αντιγράφηκε';
    toast.className = 'text-xs text-green-700';
    toast.style.display = 'none';

    function showToast() {
      toast.style.display = '';
      setTimeout(() => { toast.style.display = 'none'; }, 1200);
    }

    btn1.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(ordNo!); } catch { }
      showToast();
    });

    btn2.addEventListener('click', async () => {
      const url = origin ? `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo!)}` : ordNo!;
      try { await navigator.clipboard.writeText(url); } catch { }
      showToast();
    });

    wrap.appendChild(btn1);
    wrap.appendChild(btn2);
    wrap.appendChild(toast);

    // Add separator if cell has existing content
    if (host.childNodes.length) {
      const sep = document.createElement('div');
      sep.style.height = '4px';
      host.appendChild(sep);
    }
    host.appendChild(wrap);
    (tr as any).__dixis_actions = true;
  }

  const tbody = table.querySelector('tbody') || table;
  Array.from(tbody.querySelectorAll('tr')).forEach(enhanceRow);

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

**Key Features**:
- ✅ DOM augmentation with MutationObserver for dynamic rows
- ✅ Idempotent flag `__dixis_actions` prevents duplicate injection
- ✅ Regex extraction of order number from row text
- ✅ Two actions per row: Copy ordNo, Copy link
- ✅ Greek toast "Αντιγράφηκε" (1.2s duration)
- ✅ Compact styling (text-xs buttons)

---

### E2E Test (`frontend/tests/e2e/admin-row-copy-actions.spec.ts`)

**Test Flow**:
1. Create 2 orders via checkout flow
2. Navigate to `/admin/orders`
3. ✅ Verify "Copy ordNo" button visible on first row
4. ✅ Verify "Copy link" button visible on first row
5. ✅ Click "Copy ordNo" → toast appears
6. ✅ Click "Copy link" → toast appears

**Assertions**:
```typescript
await expect(page.getByTestId('row-copy-ordno').first()).toBeVisible();
await expect(page.getByTestId('row-copy-link').first()).toBeVisible();

await firstCopyOrd.click();
await expect(page.getByTestId('row-copy-toast').first()).toBeVisible();

await firstCopyLink.click();
await expect(page.getByTestId('row-copy-toast').first()).toBeVisible();
```

---

## 📊 FILES MODIFIED

1. ✅ `frontend/src/app/admin/orders/page.tsx` - AG43 effect (~92 lines)
2. ✅ `frontend/tests/e2e/admin-row-copy-actions.spec.ts` - E2E test (NEW, ~38 lines)
3. ✅ `docs/AGENT/PASSES/SUMMARY-Pass-AG43.md` - Complete implementation guide (NEW)
4. ✅ `docs/reports/2025-10-19/AG43-CODEMAP.md` - Code structure (NEW)
5. ✅ `docs/reports/2025-10-19/AG43-TEST-REPORT.md` - Test coverage (NEW)
6. ✅ `docs/reports/2025-10-19/AG43-RISKS-NEXT.md` - Risk assessment (NEW)

**Total Changes**: 1 code file, 1 test file, 4 documentation files

---

## 🎯 UX Improvements

### Before AG43
- ❌ Admin must manually select and copy order numbers from table cells
- ❌ No quick way to copy lookup links
- ❌ Multi-step process (select, copy, paste)

### After AG43
- ✅ One-click copy actions on every row
- ✅ Quick access to both order number and lookup link
- ✅ Visual feedback with toast confirmation
- ✅ Improved admin productivity

---

## 🎨 DESIGN CHOICES

**DOM Augmentation Pattern**:
- MutationObserver watches for new rows (pagination/filtering)
- Idempotent flag prevents duplicate injection
- Actions injected into last cell (Email column)

**Button Styling**:
- `text-xs` for compact size
- `border px-2 py-1 rounded` for minimal visual weight
- Flex layout with 6px gap for clean spacing

**Toast Behavior**:
- Greek text "Αντιγράφηκε" (Copied)
- 1.2 second duration (consistent with AG40/AG41)
- Green color (`text-green-700`)

---

## 🔗 INTEGRATION

**Related Features**:
- **AG40**: Uses same toast pattern and Greek text ✅
- **AG41**: Uses same 1.2s toast duration ✅
- **AG39**: Positioned inside sticky scroll container ✅

---

## 🔒 SECURITY & PRIVACY

**Security**: 🟢 NO CHANGE (clipboard API, no server requests)
**Privacy**: 🟢 NO CHANGE (order numbers already visible in table)

---

**Generated-by**: Claude Code (AG43 Protocol)
**Timestamp**: 2025-10-19
**Status**: ✅ Ready for review
