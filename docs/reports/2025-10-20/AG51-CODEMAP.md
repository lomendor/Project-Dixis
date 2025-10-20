# AG51 — CODEMAP

**Date**: 2025-10-20
**Pass**: AG51
**Scope**: Confirmation — Copy ordNo / Copy link with toast

---

## 📂 FILES MODIFIED

### Confirmation Page (`frontend/src/app/checkout/confirmation/page.tsx`)

**AG51 State & Helpers (Lines 14-48)**:
```typescript
// AG51: Copy helpers
const [copiedAG51, setCopiedAG51] = React.useState<'' | 'ordno' | 'link'>('');

function showToast(kind: 'ordno' | 'link') {
  setCopiedAG51(kind);
  setTimeout(() => setCopiedAG51(''), 1200);
}

function getOrd() {
  try {
    return (document.querySelector('[data-testid="order-no"]') as HTMLElement)?.textContent?.trim() || '';
  } catch {
    return '';
  }
}

function copyOrd() {
  try {
    const v = getOrd();
    if (v) navigator.clipboard?.writeText?.(v).catch(() => {});
  } finally {
    showToast('ordno');
  }
}

function copyLink() {
  try {
    const v = getOrd();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = (v && origin) ? `${origin}/orders/lookup?ordNo=${encodeURIComponent(v)}` : '';
    if (url) navigator.clipboard?.writeText?.(url).catch(() => {});
  } finally {
    showToast('link');
  }
}
```

**AG51 UI Toolbar (Lines 318-343)**:
```tsx
{/* AG51 — Copy actions */}
<div className="mt-2 flex items-center gap-3 flex-wrap" data-testid="confirm-copy-toolbar">
  <button
    type="button"
    className="border px-3 py-2 rounded text-sm"
    data-testid="copy-ordno"
    onClick={copyOrd}
  >
    Copy ordNo
  </button>
  <button
    type="button"
    className="border px-3 py-2 rounded text-sm"
    data-testid="copy-link"
    onClick={copyLink}
  >
    Copy link
  </button>
  <span
    data-testid="copy-toast"
    className="text-xs text-green-700"
    style={{ display: copiedAG51 ? '' : 'none' }}
  >
    {copiedAG51 === 'ordno' ? 'Αντιγράφηκε ο αριθμός' : copiedAG51 === 'link' ? 'Αντιγράφηκε ο σύνδεσμος' : ''}
  </span>
</div>
```

**Positioning**: After AG48 print toolbar (`[data-testid="print-toolbar"]`), before "Back to shop" link

---

## 📂 FILES CREATED

### E2E Test (`frontend/tests/e2e/customer-confirmation-copy.spec.ts`)

**Test Flow**:
```typescript
test('Confirmation — Copy ordNo / Copy link show toast and copy payloads', async ({ page }) => {
  // 1. Stub clipboard to track copied values
  await page.addInitScript(() => {
    window.__copied = [];
    navigator.clipboard = { writeText: (v) => { window.__copied.push(v); return Promise.resolve(); } };
  });

  // 2. Create order through checkout flow
  // ... (fill form, proceed, pay) ...

  // 3. Extract ordNo from page
  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';

  // 4. Click copy ordNo
  await page.getByTestId('copy-ordno').click();
  await expect(page.getByTestId('copy-toast')).toBeVisible();
  await expect(page.getByTestId('copy-toast')).toContainText('Αντιγράφηκε ο αριθμός');

  // 5. Wait for toast to disappear
  await page.waitForTimeout(1300);

  // 6. Click copy link
  await page.getByTestId('copy-link').click();
  await expect(page.getByTestId('copy-toast')).toBeVisible();
  await expect(page.getByTestId('copy-toast')).toContainText('Αντιγράφηκε ο σύνδεσμος');

  // 7. Verify clipboard payloads
  const copied = await page.evaluate(() => (window as any).__copied);
  expect(copied.some((v: string) => v === ordNo)).toBeTruthy();
  const expectedLink = `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo)}`;
  expect(copied.some((v: string) => v === expectedLink)).toBeTruthy();
});
```

---

## 🎨 COMPONENT STRUCTURE

### Copy Toolbar
```
confirm-copy-toolbar
├── copy-ordno (button) → copyOrd()
├── copy-link (button) → copyLink()
└── copy-toast (span) → shows Greek feedback based on copiedAG51 state
```

### State Flow
```
User clicks button
    ↓
copyOrd() or copyLink() executes
    ↓
navigator.clipboard.writeText(payload)
    ↓
showToast(kind) updates copiedAG51 state
    ↓
Toast renders with Greek message
    ↓
setTimeout clears copiedAG51 after 1200ms
    ↓
Toast hides
```

---

## 🔧 HELPER FUNCTIONS

### 1. showToast(kind)
**Purpose**: Update toast state and auto-hide after 1200ms
**Parameters**: `'ordno'` or `'link'`
**Logic**:
- Sets `copiedAG51` state
- Schedules `setCopiedAG51('')` after 1200ms

### 2. getOrd()
**Purpose**: Extract ordNo from DOM
**Returns**: Order number string or empty string
**Logic**:
- Queries `[data-testid="order-no"]` element
- Extracts `textContent` and trims whitespace
- Catches errors and returns empty string

### 3. copyOrd()
**Purpose**: Copy order number to clipboard
**Logic**:
- Calls `getOrd()` to get ordNo
- Copies to clipboard via `navigator.clipboard.writeText()`
- Always calls `showToast('ordno')` in finally block

### 4. copyLink()
**Purpose**: Copy share link to clipboard
**Logic**:
- Calls `getOrd()` to get ordNo
- Builds share URL: `${origin}/orders/lookup?ordNo=${ordNo}`
- Copies URL to clipboard
- Always calls `showToast('link')` in finally block

---

## 🔄 STATE MANAGEMENT

### copiedAG51 State
**Type**: `'' | 'ordno' | 'link'`
**Initial**: `''`
**Purpose**: Track which copy action was performed

**State Transitions**:
- `''` (empty) → Hidden toast
- `'ordno'` → Show "Αντιγράφηκε ο αριθμός"
- `'link'` → Show "Αντιγράφηκε ο σύνδεσμος"

**Auto-reset**: After 1200ms

---

## 📊 INTEGRATION POINTS

### With AG40 (Greek Copy Link)
- **AG40**: `copiedGreek` state + `onCopyLink()` handler
- **AG51**: `copiedAG51` state + `copyOrd()` + `copyLink()` handlers
- **No conflict**: Independent state variables

### With AG42 (Order Summary Card)
- **AG42**: Displays ordNo in `[data-testid="order-summary-ordno"]`
- **AG51**: Reads ordNo from `[data-testid="order-no"]` (main card)
- **Integration**: AG51 copies ordNo that AG42 displays

### With AG48 (Print Toolbar)
- **AG48**: `[data-testid="print-toolbar"]` with print button
- **AG51**: `[data-testid="confirm-copy-toolbar"]` positioned after AG48
- **Pattern**: Consistent toolbar + button styling

---

## 🎯 TEST IDS

| Test ID | Purpose |
|---------|---------|
| `confirm-copy-toolbar` | Container for copy buttons + toast |
| `copy-ordno` | Button to copy order number |
| `copy-link` | Button to copy share link |
| `copy-toast` | Toast notification with Greek feedback |
| `order-no` | Source element for ordNo (used by `getOrd()`) |

---

## 📐 POSITIONING LOGIC

**Insertion Point**: After `[data-testid="print-toolbar"]`

**DOM Structure**:
```
<main>
  ...
  [data-testid="print-toolbar"] (AG48)
  [data-testid="confirm-copy-toolbar"] (AG51 - NEW)
  "Back to shop" link (AG38)
  @media print styles (AG49)
</main>
```

---

**Generated-by**: Claude Code (AG51 Protocol)
**Timestamp**: 2025-10-20
