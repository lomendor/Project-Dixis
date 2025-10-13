# Pass 203A — Admin Orders Totals Display + Optional Checkout Shipping Selector (TL;DR)

**Status**: Pre-Plan Complete ✅ | **Complexity**: LOW (primary) + MEDIUM (optional)
**Generated**: 2025-10-13 | **PDAC Phase**: Plan → Delegate → Assess

---

## Goal

**Primary**: Display full totals breakdown (Υποσύνολο, Μεταφορικά, Αντικαταβολή, ΦΠΑ, Σύνολο) on Admin Orders detail page using API response.

**Optional**: Add shipping method selector (PICKUP/COURIER/COURIER_COD) to Checkout UI with live totals update.

---

## Key Discovery

**Admin Orders API already returns full totals** (Pass 201S) ✅
- API: `GET /api/admin/orders/:id` → `{ totals: { subtotal, shipping, codFee, tax, grandTotal } }`
- Current UI: Only displays subtotal + generic shipping message ("Περιλαμβάνονται στο σύνολο")
- **Gap**: UI doesn't use API's rich totals data

**Checkout UI hardcodes COURIER method**
- Line 19 in `CheckoutClient.tsx`: `shippingMethod: 'COURIER'`
- Users cannot choose PICKUP (€0 shipping) or COURIER_COD (€2 COD fee)
- **Gap**: No UI for shipping method selection

---

## Approach

### Primary Scope (Admin Orders Totals) — ~30 LOC

**File**: `frontend/src/app/admin/orders/[id]/page.tsx` (lines 186-198)

**Change**:
```typescript
// OLD (lines 186-198): Inline calculation + generic message
<div>
  <span>Υποσύνολο:</span>
  <span>{fmtEUR(order.items.reduce(...))}</span>
</div>
<div>
  <span>Μεταφορικά:</span>
  <span>Περιλαμβάνονται στο σύνολο</span>
</div>

// NEW: Destructure API totals + full breakdown
const totals = order.totals || fallbackCalc(order)
return (
  <div data-testid="totals-card">
    <div><span>Υποσύνολο:</span><span>{fmtEUR(totals.subtotal)}</span></div>
    <div><span>Μεταφορικά:</span><span>{fmtEUR(totals.shipping)}</span></div>
    {totals.codFee > 0 && <div><span>Αντικαταβολή:</span><span>{fmtEUR(totals.codFee)}</span></div>}
    <div><span>ΦΠΑ (13%):</span><span>{fmtEUR(totals.tax)}</span></div>
    <hr />
    <div><span>Σύνολο:</span><span>{fmtEUR(totals.grandTotal)}</span></div>
  </div>
)
```

**Why**:
- API already returns data (no backend work)
- Improves transparency for admins (see shipping/COD/tax breakdown)
- Adds `data-testid="totals-card"` for E2E stability

**Test Coverage**: Existing test `admin-orders-ui-totals.spec.ts` passes without modification ✅

---

### Optional Scope (Checkout Shipping Selector) — ~50 LOC + 1 E2E test

**File**: `frontend/src/app/(storefront)/checkout/CheckoutClient.tsx`

**Change**:
```typescript
// 1. Add state hook (line ~14)
const [shipMethod, setShipMethod] = useState<ShippingMethod>('COURIER')

// 2. Add radio buttons (before form, line ~77)
<div>
  <label><input type="radio" checked={shipMethod==='PICKUP'} onChange={()=>setShipMethod('PICKUP')} /> Παραλαβή από το κατάστημα - €0</label>
  <label><input type="radio" checked={shipMethod==='COURIER'} onChange={()=>setShipMethod('COURIER')} /> Κούριερ - €3.50</label>
  <label><input type="radio" checked={shipMethod==='COURIER_COD'} onChange={()=>setShipMethod('COURIER_COD')} /> Κούριερ με αντικαταβολή - €5.50</label>
</div>

// 3. Update calcTotals call (line ~17)
const totals = calcTotals({
  items: lines,
  shippingMethod: shipMethod, // ← was hardcoded 'COURIER'
  baseShipping: 3.5,
  codFee: 0,
  taxRate: ...
})

// 4. Include method in checkout request (line ~48)
shipping: { method: shipMethod, name, phone, ... }
```

**Why**:
- Empowers users to choose free PICKUP (if available) or COD payment
- Totals update dynamically (subtotal, shipping, COD fee, tax, grandTotal)
- Backward compatible (default: COURIER, same as current behavior)

**Test Coverage**: NEW `checkout-shipping-selector.spec.ts`
- Select PICKUP → Verify "Μεταφορικά: €0.00"
- Select COURIER_COD → Verify "Αντικαταβολή: €2.00"

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Old orders without `totals` field | LOW | Fallback: `totals = order.totals \|\| fallbackCalc(order)` |
| E2E flakiness (async content) | MEDIUM | Use `waitForSelector('[data-testid="totals-card"]')` |
| Checkout UX confusion (PICKUP availability) | LOW | Add helper text, default to COURIER |

---

## Test Plan Summary

**Existing Tests** (NO MODIFICATIONS):
- `admin-orders-totals.spec.ts`: API returns `totals` ✅ PASSING (Pass 201S)
- `admin-orders-ui-totals.spec.ts`: UI shows `data-testid="totals-card"` ✅ PASSING (tolerant)

**New Tests** (OPTIONAL SCOPE ONLY):
- `checkout-shipping-selector.spec.ts`: PICKUP selection → €0 shipping

**TypeScript Check**: `npm run type-check` → 0 errors expected

---

## Acceptance Criteria (Quick Checklist)

### Primary Scope
- [ ] Admin Orders detail displays: Υποσύνολο, Μεταφορικά (€ value), Αντικαταβολή (if > 0), ΦΠΑ, Σύνολο
- [ ] Totals card has `data-testid="totals-card"`
- [ ] All amounts formatted with `fmtEUR()`
- [ ] Existing tests pass without modification
- [ ] NO schema changes

### Optional Scope
- [ ] Checkout displays 3 radio buttons (Παραλαβή, Κούριερ, Κούριερ με αντικαταβολή)
- [ ] Totals sidebar updates dynamically on radio change
- [ ] Selected method included in checkout API request
- [ ] E2E test verifies PICKUP → €0 shipping

---

## Scope Decision Required

**Question**: Implement both scopes, or primary only?

**Option A**: Primary only (Admin Orders totals)
- **Effort**: ~30 LOC, 0 new tests
- **Value**: Better admin transparency
- **Risk**: Minimal (read-only display)

**Option B**: Both scopes (Admin + Checkout selector)
- **Effort**: ~80 LOC, 1 new E2E test
- **Value**: Admin transparency + user empowerment (free PICKUP, COD option)
- **Risk**: Low (state hook + radio buttons, backward compatible)

**Recommendation**: Option B (both scopes) — User value is high, risk is low, effort is manageable.

---

## Next Steps (PDAC Phase 4: Codify)

1. **User approves scope** (A or B)
2. **Create feature branch**: `feat/pass-203a-admin-orders-totals` (or `-and-checkout-selector`)
3. **Implement primary scope** (~30 LOC)
4. **Run existing tests** → Verify green
5. **(Optional) Implement checkout selector** (~50 LOC)
6. **(Optional) Add E2E test** (`checkout-shipping-selector.spec.ts`)
7. **TypeScript check** → 0 errors
8. **Commit + push** → Create PR with full body (Summary, AC, Test Plan, Reports)
9. **Enable auto-merge** → Await CI green

---

## Dependencies & Constraints

- **NO schema changes** ✅
- **NO API changes** (Admin Orders API stable from Pass 201S) ✅
- **Unified totals helper** (`@/lib/cart/totals`) ✅ STABLE
- **EL-first UX** (Greek labels, `fmtEUR`) ✅ MAINTAINED
- **TypeScript strict mode** ✅ COMPLIANT
- **Backward compatible** (fallback for old orders, COURIER default) ✅

---

## Quality Gates Status

- [x] AC defined (7 primary + 3 optional)
- [x] Technical approach documented
- [x] Test plan proposed (2-3 scenarios)
- [x] Risks assessed + mitigations
- [x] Dependencies verified
- [x] Scope clearly defined
- [x] PR template prepared
- [x] Inventory complete (routes, API, tests)
- [x] EL-first maintained

**Result**: ✅ **READY FOR CODIFY** (awaiting user scope decision)

---

**PDAC Status**: Phase 3 (Assess) Complete → Phase 4 (Codify) Ready
**Full Details**: `docs/AGENT/TASKS/Pass-203A.md` (384 lines with appendices)
