# AG44 — CODEMAP

**Date**: 2025-10-19
**Pass**: AG44
**Scope**: Confirmation collapsible shipping & totals

---

## 📂 FILES MODIFIED

### Confirmation Page (`frontend/src/app/checkout/confirmation/page.tsx`)

**Collapsible Section (Lines 168-215)**:
```typescript
{/* AG44 — Collapsible: Αποστολή & Σύνολα */}
{orderNo && json && (
  <details data-testid="confirm-collapsible" className="mt-4 max-w-xl rounded border">
    <summary className="cursor-pointer select-none px-4 py-2 text-sm font-semibold bg-neutral-50 border-b hover:bg-neutral-100">
      Αποστολή &amp; Σύνολα
    </summary>
    <div className="p-4 space-y-3">
      {/* Summary section */}
      <div data-testid="confirm-collapsible-summary">
        Order number + link
      </div>

      {/* Shipping & Totals details */}
      <div data-testid="confirm-collapsible-details">
        Postal code, method, total
      </div>
    </div>
  </details>
)}
```

**Positioning**:
- After AG42 Order Summary card (line 166)
- Before AG40 Greek copy button (line 217)
- Inside main element

---

### E2E Test (`frontend/tests/e2e/customer-confirmation-collapsible.spec.ts`)

**Lines**: +40 (NEW file)

**Test Flow**:
1. Create order via checkout flow
2. Navigate to confirmation
3. Assert collapsible visible
4. Click summary → open
5. Assert open attribute
6. Assert ordNo inside
7. Assert share link
8. Assert details visible
9. Click summary → close
10. Assert no open attribute

**Test Data Attributes**:
- `confirm-collapsible` - Details container
- `confirm-collapsible-summary` - Summary card inside
- `confirm-collapsible-ordno` - Order number span
- `confirm-collapsible-share` - Share link
- `confirm-collapsible-details` - Shipping/totals section
- `confirm-collapsible-total` - Total amount

---

## 🎨 UI COMPONENTS

**Collapsible Structure**:
```
<details data-testid="confirm-collapsible">
  ├── <summary>Αποστολή & Σύνολα</summary>
  └── <div class="p-4">
       ├── <div data-testid="confirm-collapsible-summary">
       │    ├── Περίληψη παραγγελίας
       │    ├── Order number (monospace)
       │    └── Link
       └── <div data-testid="confirm-collapsible-details">
            ├── Τ.Κ.: {postalCode}
            ├── Μέθοδος: {method}
            └── Σύνολο: {total}
```

**Styling Classes**:
- Container: `mt-4 max-w-xl rounded border`
- Summary: `cursor-pointer select-none px-4 py-2 text-sm font-semibold bg-neutral-50 border-b hover:bg-neutral-100`
- Content: `p-4 space-y-3`
- Summary card: `rounded border shadow-sm p-3 bg-white`
- Details: `space-y-2`

---

## 🔗 STATE DEPENDENCIES

**Required State**:
- `orderNo` - From localStorage
- `json` - Checkout summary from localStorage
- `shareUrl` - From AG40 implementation

**Conditional Rendering**:
Collapsible only renders when both `orderNo` and `json` exist.

---

## 📱 RESPONSIVE DESIGN

**Max Width**: `max-w-xl` (576px)
- Comfortable reading width
- Fits most mobile screens
- Prevents stretching on desktop

**Font Sizing**:
- Summary: `text-sm font-semibold`
- Label: `text-xs uppercase tracking-wide`
- Content: `text-sm`

---

## 🔍 TECHNICAL DETAILS

**Native `<details>` Element**:
- No JavaScript state management needed
- `open` attribute controls visibility
- Accessible by default (keyboard, screen readers)
- Browser handles toggle logic

**Data Flow**:
- `orderNo` from localStorage via useEffect
- `json` from localStorage via useEffect
- `shareUrl` computed from orderNo via AG40 effect

---

**Generated-by**: Claude Code (AG44 Protocol)
**Timestamp**: 2025-10-19
