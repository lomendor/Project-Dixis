# Pass 203A — Admin Orders Totals Display + Optional Checkout Shipping Selector

**Status**: Pre-Plan Complete (PDAC Phase 3: Assess)
**Type**: UI Enhancement (read-only totals display) + Optional UX improvement
**Scope**: Admin Orders detail page + Optional Checkout shipping selector
**Complexity**: LOW (read-only display) + MEDIUM (optional shipping selector)

---

## Goal

**Primary**: Display comprehensive totals breakdown on Admin Orders detail page using unified `calcTotals()` helper (read-only, no schema changes).

**Optional**: Add shipping method selector to Checkout UI (PICKUP/COURIER/COURIER_COD) with live totals update.

---

## Context & Discovery

### Current State (from scan-agent)

**Admin Orders Detail** (`frontend/src/app/admin/orders/[id]/page.tsx`):
- Lines 186-198: "Best-effort" totals breakdown exists
- Currently shows:
  - Υποσύνολο (subtotal): Sum of order items
  - Μεταφορικά: "Περιλαμβάνονται στο σύνολο" (generic message)
  - Σημείωση: "Τα μεταφορικά και η μέθοδος αποστολής αποθηκεύονται στο σύνολο"
- Does NOT show: ΦΠΑ, Αντικαταβολή breakdown

**Admin Orders API** (`frontend/src/app/api/admin/orders/[id]/route.ts`):
- Already wired to unified helper (Pass 201S)
- Returns `totals` object in response: `{ subtotal, shipping, codFee, tax, grandTotal }`
- Test coverage: `admin-orders-totals.spec.ts` (lines 44-47)

**Checkout UI** (`frontend/src/app/(storefront)/checkout/CheckoutClient.tsx`):
- Line 19: Hardcoded `shippingMethod: 'COURIER'` (no user selection)
- Uses unified helper for totals calculation
- No UI for PICKUP/COURIER_COD selection

**Unified Totals Helper** (`frontend/src/lib/cart/totals.ts`):
- `calcTotals()`: Accepts `shippingMethod: 'PICKUP'|'COURIER'|'COURIER_COD'`
- `shippingLabel()`: Greek labels for all 3 methods
- Calculates shipping (€0 for PICKUP, €3.5 default), COD fee (€2.0 for COURIER_COD), tax

### Gap Analysis

**Admin Orders Detail**:
- API returns full totals breakdown ✅
- UI displays partial breakdown (subtotal only) ❌
- Missing: ΦΠΑ, Μεταφορικά (with actual value), Αντικαταβολή

**Checkout UI** (optional scope):
- User cannot choose shipping method
- Totals always assume COURIER (no COD, no PICKUP)
- No UX for comparing shipping costs

---

## Acceptance Criteria

### Primary Scope (Admin Orders Totals)
- [ ] Admin Orders detail page displays full totals breakdown from API:
  - Υποσύνολο (subtotal)
  - Μεταφορικά (shipping) with actual value (not generic message)
  - Αντικαταβολή (codFee) if > 0
  - ΦΠΑ (tax) with percentage
  - Σύνολο (grandTotal)
- [ ] Totals card uses `data-testid="totals-card"` for E2E verification
- [ ] All amounts formatted with `fmtEUR()` (Greek locale)
- [ ] Existing test `admin-orders-ui-totals.spec.ts` passes without modification
- [ ] NO schema changes (backward compatible)
- [ ] NO TypeScript errors in strict mode

### Optional Scope (Checkout Shipping Selector)
- [ ] Checkout UI displays 3 radio buttons for shipping method:
  - Παραλαβή από το κατάστημα (PICKUP) - €0
  - Κούριερ (COURIER) - €3.50
  - Κούριερ με αντικαταβολή (COURIER_COD) - €3.50 + €2.00
- [ ] Totals sidebar updates dynamically when user changes shipping method
- [ ] Selected method included in checkout API request (`shipping.method`)
- [ ] Default: COURIER (current behavior)
- [ ] E2E test verifies PICKUP selection shows €0 shipping
- [ ] NO schema changes (backward compatible)

---

## Technical Decisions (from plan-agent)

### Architecture Approach

**Admin Orders Totals** (Primary):
1. **Read API response** in Admin Orders detail page (server component)
2. **Destructure `totals`** from API response (already returned by Pass 201S)
3. **Refactor lines 186-198** in `page.tsx`:
   - Replace inline subtotal calculation with `totals.subtotal`
   - Replace generic message with `fmtEUR(totals.shipping)`
   - Add COD fee row (conditional: only if `totals.codFee > 0`)
   - Add tax row with percentage (from `VAT_RATE` env)
4. **Add `data-testid="totals-card"`** wrapper for E2E stability
5. **Reuse `fmtEUR()`** for all currency formatting

**Checkout Shipping Selector** (Optional):
1. **Add state hook** in `CheckoutClient.tsx`: `const [shipMethod, setShipMethod] = useState<ShippingMethod>('COURIER')`
2. **Update `calcTotals()` call** to use `shipMethod` instead of hardcoded 'COURIER'
3. **Add radio button group** before shipping form:
   ```tsx
   <div>
     <label><input type="radio" checked={shipMethod==='PICKUP'} onChange={()=>setShipMethod('PICKUP')} /> Παραλαβή - €0</label>
     <label><input type="radio" checked={shipMethod==='COURIER'} onChange={()=>setShipMethod('COURIER')} /> Κούριερ - €3.50</label>
     <label><input type="radio" checked={shipMethod==='COURIER_COD'} onChange={()=>setShipMethod('COURIER_COD')} /> Κούριερ με αντικαταβολή - €5.50</label>
   </div>
   ```
4. **Include `shipping.method`** in checkout API request (line 46-50)
5. **E2E test**: Select PICKUP, verify shipping = €0 in totals sidebar

### Component Reuse Opportunities

- **`fmtEUR()` from `@/lib/cart/totals`**: Already imported in Admin Orders page (line 9)
- **`shippingLabel()` helper**: Could be used in Checkout selector labels
- **Existing E2E test pattern**: `admin-orders-ui-totals.spec.ts` uses `data-testid="totals-card"`
- **Existing API contract**: Admin Orders API already returns full totals (no backend changes)

### Risks & Mitigations

**Risk 1**: Admin Orders API might not return `totals` for old orders (pre-Pass-201S)
- **Mitigation**: Fallback to inline calculation if `totals` is undefined (best-effort)
- **Code**:
  ```typescript
  const totals = order.totals || {
    subtotal: order.items.reduce((s,i)=>s+Number(i.price)*Number(i.qty),0),
    shipping: 0, codFee: 0, tax: 0,
    grandTotal: Number(order.total || 0)
  }
  ```

**Risk 2**: Checkout shipping selector might confuse users if they don't see PICKUP option availability
- **Mitigation**: Add helper text: "Παραλαβή διαθέσιμη για Αθήνα/Θεσσαλονίκη" (future: check availability by postal code)
- **Mitigation**: Start with COURIER default (current behavior unchanged)

**Risk 3**: E2E test flakiness if totals card loads asynchronously
- **Mitigation**: Use `page.waitForSelector('[data-testid="totals-card"]')` with explicit timeout
- **Mitigation**: Verify element visibility before assertions

---

## Implementation Steps (Placeholder — to be filled in Codify phase)

### Phase 1: Admin Orders Totals Display

**Step 1.1**: Refactor Admin Orders detail page totals section (lines 186-198)
- Destructure `totals` from API response (with fallback)
- Replace inline subtotal with `totals.subtotal`
- Add shipping row: `Μεταφορικά: {fmtEUR(totals.shipping)}`
- Add COD row (conditional): `Αντικαταβολή: {fmtEUR(totals.codFee)}`
- Add tax row: `ΦΠΑ (13%): {fmtEUR(totals.tax)}`
- Wrap in `<div data-testid="totals-card">`

**Step 1.2**: Verify E2E test passes
- Run `admin-orders-ui-totals.spec.ts`
- Verify `data-testid="totals-card"` is visible
- Check test logs for any warnings

**Step 1.3**: TypeScript type-check
- Run `npm run type-check`
- Verify 0 errors

### Phase 2: Checkout Shipping Selector (Optional — user decides)

**Step 2.1**: Add state hook in `CheckoutClient.tsx`
- `const [shipMethod, setShipMethod] = useState<ShippingMethod>('COURIER')`

**Step 2.2**: Add radio button group above shipping form
- 3 radio buttons (PICKUP/COURIER/COURIER_COD)
- Labels with Greek text + prices
- `onChange` handlers update `shipMethod`

**Step 2.3**: Update `calcTotals()` call
- Replace `shippingMethod: 'COURIER'` with `shippingMethod: shipMethod`

**Step 2.4**: Include method in checkout API request
- Line 49: `shipping: { method: shipMethod, name, phone, ... }`

**Step 2.5**: Add E2E test scenario
- New test: `checkout-shipping-selector.spec.ts`
- Select PICKUP radio button
- Verify totals sidebar shows "Μεταφορικά: €0.00"

---

## Test Plan (from test-agent)

### Existing Test Coverage (NO MODIFICATIONS)

**Test 1**: `admin-orders-totals.spec.ts` (API-level)
- Verifies admin GET `/api/admin/orders/:id` returns `totals` object
- Assertions: `totals.subtotal > 0`, `totals.grandTotal > 0`
- **Status**: PASSING (Pass 201S)

**Test 2**: `admin-orders-ui-totals.spec.ts` (UI-level)
- Seeds product → places order → visits admin order page
- Looks for `data-testid="totals-card"` visibility
- **Status**: PASSING (tolerant test, skips if card not present)

### New Test Coverage (OPTIONAL — only if optional scope implemented)

**Test 3**: `checkout-shipping-selector.spec.ts` (E2E)
- Scenario: User selects PICKUP method
- Steps:
  1. Seed 1 product (€10)
  2. Add to cart
  3. Navigate to /checkout
  4. Verify 3 radio buttons present (Παραλαβή, Κούριερ, Κούριερ με αντικαταβολή)
  5. Select "Παραλαβή" radio button
  6. Wait for totals sidebar update
  7. Verify "Μεταφορικά: €0.00" displayed
  8. Submit checkout
  9. Verify order created with `shipping.method = 'PICKUP'`
- **Assertions**:
  - `page.locator('input[value="PICKUP"]').check()`
  - `expect(page.locator('text=/Μεταφορικά/').locator('..').locator('text=/€0/')).toBeVisible()`
  - API response contains `shipping.method: 'PICKUP'`

### Edge Cases

**Edge Case 1**: Old orders without `totals` field (pre-Pass-201S)
- **Test**: Manually query old order from DB (if any exist)
- **Expected**: Fallback calculation displays subtotal, generic shipping message
- **Coverage**: Manual verification (low priority)

**Edge Case 2**: Checkout shipping selector with empty cart
- **Expected**: User redirected to /cart before reaching checkout
- **Coverage**: Existing logic (line 35 in CheckoutClient.tsx)

---

## Risks & Dependencies

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Admin Orders API `totals` missing for old orders | LOW | Fallback to inline calculation |
| E2E test flakiness (async totals load) | MEDIUM | Use explicit `waitForSelector()` with timeout |
| Checkout shipping selector UX confusion | LOW | Add helper text, default to COURIER |
| TypeScript errors if `totals` type not imported | LOW | Import `Totals` type from `@/lib/cart/totals` |

### Dependencies

- **NO schema changes** (backward compatible)
- **NO API changes** (Admin Orders API already returns totals)
- **Optional scope depends on user decision** (Checkout shipping selector)
- **Unified totals helper** (`@/lib/cart/totals`) already stable (Pass 201S)

---

## PR Draft

### Title
```
feat: Admin Orders totals display + (optional) Checkout shipping selector (HF-203A)
```

### Body Template
```markdown
## Summary

Wire full totals breakdown into Admin Orders detail page using unified helper. Optionally add shipping method selector to Checkout UI.

**Changes**:
- Admin Orders detail (`app/admin/orders/[id]/page.tsx`): Display subtotal/shipping/COD/tax/grandTotal from API response
- Add `data-testid="totals-card"` for E2E stability
- (Optional) Checkout UI: Add PICKUP/COURIER/COURIER_COD radio buttons with live totals update
- (Optional) E2E test: Verify PICKUP selection shows €0 shipping

**Technical Details**:
- NO schema changes (read-only display)
- API already returns full totals (Pass 201S)
- Fallback for old orders without `totals` field
- EL-first formatting (`fmtEUR`, Greek labels)

## Acceptance Criteria

- [ ] Admin Orders detail displays full totals breakdown (Υποσύνολο, Μεταφορικά, Αντικαταβολή, ΦΠΑ, Σύνολο)
- [ ] Totals card uses `data-testid="totals-card"`
- [ ] All amounts formatted with `fmtEUR()`
- [ ] Existing test `admin-orders-ui-totals.spec.ts` passes
- [ ] NO TypeScript errors
- [ ] (Optional) Checkout shipping selector with 3 methods
- [ ] (Optional) Totals update dynamically on method change
- [ ] (Optional) E2E test verifies PICKUP shows €0 shipping

## Test Plan

- **Existing E2E test**: `admin-orders-ui-totals.spec.ts` (UI visibility)
- **Existing E2E test**: `admin-orders-totals.spec.ts` (API response)
- **(Optional) New E2E test**: `checkout-shipping-selector.spec.ts` (PICKUP selection)
- **TypeScript check**: `npm run type-check` (0 errors)
- **CI**: Build, E2E (PostgreSQL)

## Reports

- **CODEMAP**: `docs/AGENT/SYSTEM/routes.md` (Admin Orders detail)
- **TEST-REPORT**: GitHub Actions → this PR run
- **RISKS-NEXT**: `docs/OPS/STATE.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Appendices (PDAC Phases 1-3)

### Plan Appendix (plan-agent emulated)

**High-Level Approach**:
1. Admin Orders: Read-only UI refactor (destructure API `totals`, update JSX)
2. Optional Checkout: Add state hook + radio buttons + dynamic recalc
3. NO backend changes (API already returns full totals)
4. Small diff: ~30 LOC for Admin Orders, ~50 LOC for Checkout (if implemented)

**Component Reuse**:
- `fmtEUR()` already imported in Admin Orders page
- `shippingLabel()` available for Checkout labels
- `calcTotals()` already wired in Checkout (just change parameter)
- E2E pattern: `data-testid` + `waitForSelector()` (stable)

**Architectural Patterns**:
- **Read-only display**: No state management, just destructure API response
- **Controlled component**: Checkout shipping selector uses React state hook
- **Progressive enhancement**: Optional scope doesn't break existing flow

**Risks**:
- Old orders: Fallback to inline calculation (best-effort)
- E2E flakiness: Explicit waits for async content
- UX confusion: Helper text for PICKUP availability

**Dependencies**:
- Admin Orders API (Pass 201S) ✅ STABLE
- Unified totals helper ✅ STABLE
- No schema changes required ✅

---

### Inventory Appendix (scan-agent emulated)

**Routes Inventory** (App Router):
```
frontend/src/app/admin/orders/
├── page.tsx              (list view - NO CHANGES)
├── [id]/
│   ├── page.tsx          (detail view - PRIMARY TARGET)
│   ├── CopyTrackingLink.tsx
│   └── OrderStatusQuickActions.tsx
└── widget.tsx

frontend/src/app/(storefront)/checkout/
└── CheckoutClient.tsx    (OPTIONAL TARGET)
```

**API Endpoints** (already wired):
```
GET /api/admin/orders/:id
  Returns: { id, status, total, items[], totals: { subtotal, shipping, codFee, tax, grandTotal }, ... }
  Status: ✅ Returns full totals (Pass 201S)

POST /api/checkout
  Accepts: { items[], shipping: { method, name, phone, ... }, payment: { method } }
  Status: ✅ Accepts `shipping.method` (needs UI to populate it)
```

**Database Models** (no changes):
```prisma
model Order {
  id              String   @id @default(uuid())
  total           Decimal  // grandTotal stored here
  // ... other fields
  // NO totals JSON field (calculated on-the-fly)
}
```

**Existing Test Coverage**:
```
tests/admin/
├── admin-orders-totals.spec.ts        (API-level: verifies API response)
├── admin-orders-ui-totals.spec.ts     (UI-level: verifies totals-card visibility)
├── orders-status.spec.ts
├── orders-dashboard.spec.ts
└── orders-list-filters.spec.ts

tests/storefront/checkout/
└── checkout-totals.spec.ts            (verifies Checkout totals display)
```

**Reusable Components/Utilities**:
- `@/lib/cart/totals`: `calcTotals()`, `fmtEUR()`, `shippingLabel()`, `ShippingMethod` type
- `@/components/admin/StatusBadge`: Badge component (no changes)
- `@/components/PrintButton`: Print functionality (no changes)

---

### Test Plan Appendix (test-agent emulated)

**Proposed E2E Scenarios** (Minimal Coverage):

**Scenario 1**: Admin Orders Totals Display (PRIMARY)
- **Test File**: Reuse `admin-orders-ui-totals.spec.ts` (NO MODIFICATIONS)
- **Given**: Product seeded, order placed via checkout API
- **When**: Admin visits order detail page
- **Then**: `data-testid="totals-card"` is visible
- **Assertions**:
  - `expect(page.locator('[data-testid="totals-card"]')).toBeVisible()`
- **Edge Case**: Old orders without `totals` field (manual verification)

**Scenario 2**: Checkout Shipping Selector - PICKUP (OPTIONAL)
- **Test File**: NEW `checkout-shipping-selector.spec.ts`
- **Given**: Product seeded (€10), cart has 1 item
- **When**: User navigates to /checkout, selects "Παραλαβή" radio button
- **Then**: Totals sidebar shows "Μεταφορικά: €0.00"
- **Assertions**:
  - `page.locator('input[value="PICKUP"]').check()`
  - `expect(page.locator('text=/Μεταφορικά/').locator('xpath=following-sibling::*').locator('text=/€0,00|€0.00/')).toBeVisible()`
- **Submission**: Verify checkout API request includes `shipping.method = 'PICKUP'`

**Scenario 3**: Checkout Shipping Selector - COURIER_COD (OPTIONAL)
- **Test File**: Same as Scenario 2 (additional test case)
- **Given**: Product seeded (€10), cart has 1 item
- **When**: User selects "Κούριερ με αντικαταβολή" radio button
- **Then**: Totals sidebar shows "Αντικαταβολή: €2.00", "Μεταφορικά: €3.50"
- **Assertions**:
  - `page.locator('input[value="COURIER_COD"]').check()`
  - `expect(page.locator('text=/Αντικαταβολή/').locator('xpath=following-sibling::*').locator('text=/€2,00|€2.00/')).toBeVisible()`

**Required Fixtures/Seed Data**:
- Admin account (already available via `ADMIN_PHONES` env)
- 1 product (€10, any category, stock > 0)
- OTP bypass for E2E auth (already configured)

**Expected Assertions** (Summary):
- `data-testid="totals-card"` visible on Admin Orders detail
- Subtotal/Shipping/COD/Tax/GrandTotal rows present
- Currency formatted with € symbol (el-GR locale)
- (Optional) Radio buttons for PICKUP/COURIER/COURIER_COD present
- (Optional) Totals update dynamically on radio button change

---

## Quality Gates Checklist (PDAC Phase 3: Assess)

- [x] **Acceptance Criteria defined** (7 primary + 3 optional)
- [x] **Technical approach documented** (read-only display + optional state hook)
- [x] **Component reuse identified** (fmtEUR, shippingLabel, existing E2E patterns)
- [x] **Test plan proposed** (2-3 scenarios, minimal coverage)
- [x] **Risks assessed** (old orders fallback, E2E stability, UX confusion)
- [x] **Dependencies verified** (NO schema changes, API stable from Pass 201S)
- [x] **Scope clearly defined** (primary = Admin Orders, optional = Checkout selector)
- [x] **PR template prepared** (Summary, AC, Test Plan, Reports)
- [x] **Inventory complete** (routes, API endpoints, DB models, tests)
- [x] **EL-first UX maintained** (Greek labels, fmtEUR formatting)

**Assessment Result**: ✅ **READY FOR CODIFY** (if user approves scope)

---

## Notes

- **Primary scope is SMALL**: Only Admin Orders detail page (~30 LOC change)
- **Optional scope is MEDIUM**: Checkout shipping selector (~50 LOC + 1 new E2E test)
- **User decision required**: Implement both scopes, or primary only?
- **Backward compatibility**: 100% (no schema changes, fallback for old orders)
- **Test coverage**: Existing tests pass without modification (primary scope)
- **Diff strategy**: Two separate commits (primary + optional) for clean PR review

---

**Generated**: 2025-10-13
**PDAC Phase**: Plan → Delegate → Assess (Phase 4 "Codify" awaits user approval)
**Next Step**: User review & decision on optional scope → Create feature branch → Implement → PR
