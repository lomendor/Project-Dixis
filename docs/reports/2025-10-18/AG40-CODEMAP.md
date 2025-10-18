# AG40 — CODEMAP

**Date**: 2025-10-18
**Pass**: AG40
**Scope**: Copy order link with toast on confirmation and lookup pages

---

## 📂 FILES MODIFIED

### 1. Confirmation Page (`frontend/src/app/checkout/confirmation/page.tsx`)

**New State (Lines 11-12)**:
```typescript
const [shareUrl, setShareUrl] = React.useState(''); // AG40: share URL state
const [copiedGreek, setCopiedGreek] = React.useState(false); // AG40: Greek toast state
```

**Share URL Builder (Lines 28-36)**:
```typescript
// AG40: Build share URL from orderNo
React.useEffect(() => {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (orderNo && origin) {
      setShareUrl(`${origin}/orders/lookup?ordNo=${encodeURIComponent(orderNo)}`);
    }
  } catch {}
}, [orderNo]);
```

**Copy Handler (Lines 38-57)**:
```typescript
// AG40: Greek copy link handler
async function onCopyLink() {
  try {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopiedGreek(true);
      setTimeout(() => setCopiedGreek(false), 1200);
    }
  } catch {}
}
```

**UI Elements (Lines 142-161)**:
```typescript
{/* AG40: Greek copy order link + toast */}
<div className="mt-3 flex items-center gap-3">
  <button
    type="button"
    className="border px-3 py-2 rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
    data-testid="copy-order-link"
    onClick={onCopyLink}
    disabled={!shareUrl}
  >
    Αντιγραφή συνδέσμου
  </button>
  {copiedGreek && (
    <span data-testid="copy-toast" className="text-xs text-green-700">
      Αντιγράφηκε
    </span>
  )}
  <span data-testid="share-url" style={{ display: 'none' }}>
    {shareUrl}
  </span>
</div>
```

---

### 2. Lookup Page (`frontend/src/app/orders/lookup/page.tsx`)

**New State (Line 33)**:
```typescript
const [copyMsg, setCopyMsg] = React.useState(''); // AG40: copy toast message
```

**Copy Handler (Lines 82-104)**:
```typescript
// AG40: Copy current order link handler
async function onCopyCurrent() {
  try {
    const ord = result?.orderNo;
    if (!ord) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = origin ? `${origin}/orders/lookup?ordNo=${encodeURIComponent(ord)}` : '';
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopyMsg('Αντιγράφηκε');
    setTimeout(() => setCopyMsg(''), 1200);
  } catch {}
}
```

**UI Elements (Lines 256-271)** - Inside result block:
```typescript
{/* AG40: Copy order link button */}
<div className="mb-2 flex items-center gap-3">
  <button
    type="button"
    data-testid="copy-order-link-lookup"
    onClick={onCopyCurrent}
    className="border px-3 py-2 rounded text-sm"
  >
    Αντιγραφή συνδέσμου
  </button>
  {copyMsg && (
    <span data-testid="copy-toast-lookup" className="text-xs text-green-700">
      {copyMsg}
    </span>
  )}
</div>
```

---

### 3. E2E Test (`frontend/tests/e2e/customer-copy-order-link.spec.ts`)

**Lines**: +70 (NEW file)

**Test 1 - Confirmation Page**:
- Creates order via checkout flow
- Extracts orderNo and builds expected URL
- Verifies hidden share-url element
- Clicks copy button
- Verifies toast appears with "Αντιγράφηκε"

**Test 2 - Lookup Page**:
- Creates order and navigates to lookup
- Searches for order
- Waits for result
- Verifies copy button exists
- Clicks button and verifies toast

---

## 🎨 KEY PATTERNS USED

**1. Clipboard API with Fallback**:
- Primary: `navigator.clipboard.writeText()`
- Fallback: `document.execCommand('copy')` for older browsers

**2. Toast Pattern**:
- 1.2 second timeout for auto-dismiss
- Green color (`text-green-700`) for success

**3. Greek Localization**:
- Button: "Αντιγραφή συνδέσμου"
- Toast: "Αντιγράφηκε"

**4. Test Data Attributes**:
- `copy-order-link` / `copy-order-link-lookup` - Copy buttons
- `copy-toast` / `copy-toast-lookup` - Toast messages
- `share-url` - Hidden URL element (confirmation only)

---

**Generated-by**: Claude Code (AG40 Protocol)
**Timestamp**: 2025-10-18
