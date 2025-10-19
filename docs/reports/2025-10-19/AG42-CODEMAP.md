# AG42 — CODEMAP

**Date**: 2025-10-19
**Pass**: AG42
**Scope**: Compact Order Summary card on confirmation page

---

## 📂 FILES MODIFIED

### Confirmation Page (`frontend/src/app/checkout/confirmation/page.tsx`)

**Summary Card (Lines 142-166)**:
```typescript
{/* AG42 — Compact Order Summary card */}
{orderNo && (
  <div
    data-testid="order-summary-card"
    className="mt-4 max-w-sm rounded border shadow-sm p-4 bg-white"
  >
    <div className="text-sm font-semibold mb-2">Περίληψη παραγγελίας</div>
    <div className="text-sm mb-1">
      Αρ. παραγγελίας:{' '}
      <span data-testid="order-summary-ordno" className="font-mono">
        {orderNo}
      </span>
    </div>
    <div className="text-sm">
      <a
        data-testid="order-summary-share"
        href={shareUrl || '#'}
        className="underline text-blue-600 hover:text-blue-800"
        aria-disabled={!shareUrl}
      >
        Προβολή παραγγελίας
      </a>
    </div>
  </div>
)}
```

**Positioning**:
- After main `<Card>` component (line 140)
- Before AG40 Greek copy button (line 168)
- Before AG38 back-to-shop link (line 189)

---

### E2E Test (`frontend/tests/e2e/customer-order-summary-card.spec.ts`)

**Lines**: +35 (NEW file)

**Test Flow**:
1. Navigate to `/checkout/flow`
2. Fill checkout form
3. Complete payment
4. Reach confirmation page
5. Extract orderNo
6. Assert card visibility
7. Assert orderNo match
8. Assert share link href

**Test Data Attributes**:
- `order-summary-card` - Card container
- `order-summary-ordno` - Order number span
- `order-summary-share` - View order link

---

## 🎨 UI COMPONENTS

**Card Structure**:
```
<div data-testid="order-summary-card">
  ├── Header: "Περίληψη παραγγελίας"
  ├── Order No: "Αρ. παραγγελίας: {orderNo}"
  └── Link: "Προβολή παραγγελίας"
</div>
```

**Styling Classes**:
- Container: `mt-4 max-w-sm rounded border shadow-sm p-4 bg-white`
- Header: `text-sm font-semibold mb-2`
- Order No label: `text-sm mb-1`
- Order No value: `font-mono`
- Link: `text-sm underline text-blue-600 hover:text-blue-800`

---

## 🔗 STATE DEPENDENCIES

**Required State** (from AG40):
- `orderNo` - From localStorage
- `shareUrl` - Built from orderNo + origin

**Conditional Rendering**:
Card only renders when `orderNo` is truthy (non-empty string).

---

## 📱 RESPONSIVE DESIGN

**Max Width**: `max-w-sm` (384px)
- Ensures compact layout on desktop
- Prevents card from being too wide
- Mobile-friendly (fits most screen widths)

**Font Sizing**:
- All text: `text-sm` (14px) for compact appearance

---

**Generated-by**: Claude Code (AG42 Protocol)
**Timestamp**: 2025-10-19
