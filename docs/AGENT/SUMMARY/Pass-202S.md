# TL;DR — Pass 202S

## Goal
Wire unified totals helper (`lib/cart/totals.ts` from Pass 201S) into Checkout UI for consistent calculations across frontend and backend.

## Approach

### Key Discovery
- ✅ **Admin Orders API** already uses unified helper (since Pass 201S)
- ✅ **Admin Orders UI** already displays subtotal breakdown (Pass 201S)
- ⚠️ **Checkout UI** still uses old `@/lib/checkout/totals` (needs refactor)

### Primary Task
Refactor `CheckoutClient.tsx` to use unified helper:
1. Change import: `@/lib/checkout/totals` → `@/lib/cart/totals`
2. Update function call: `calc(lines)` → `calcTotals({ items: lines, shippingMethod, ... })`
3. Adjust UI display to use new return structure (`subtotal`, `shipping`, `codFee`, `tax`, `grandTotal`)

### Scope
- **Files affected**: 1 file (`CheckoutClient.tsx`)
- **Tests needed**: 1 new E2E test (`checkout-ui-totals.spec.ts`)
- **NO schema changes**: Totals computed on-the-fly
- **EL-first**: Greek labels and `fmtEUR` formatting intact

## Risks

### 🟡 Medium Risk
- **Function signature change**: `calc()` → `calcTotals()` requires UI adjustments
- **Mitigation**: Use same interface pattern, minimal changes

### 🟢 Low Risk
- **Admin components**: Already updated (Pass 201S), no changes needed
- **Backward compatibility**: Existing orders work without migration

## Quality Gates

✅ **Acceptance Criteria defined**: 7 criteria in TASKS/Pass-202S.md
✅ **Test plan exists**: 1 new E2E + 2 existing tests cover functionality
✅ **Risks documented**: Medium/Low risks identified with mitigation
✅ **NO schema changes**: Confirmed by scan-agent

## Next Steps (Codify Gate)

**Ready for implementation** after plan approval:
1. Create feature branch `feat/pass-202s-checkout-totals`
2. Refactor CheckoutClient.tsx (import + function call + UI display)
3. Add E2E test `tests/storefront/checkout-ui-totals.spec.ts`
4. Verify existing test `admin-orders-totals.spec.ts` passes
5. Commit, PR, CI green → merge

**Estimated LOC**: ≤50 lines (1 file change + 1 new test file)
**Estimated Time**: 30-45 minutes

---

**Token Count**: ~450 tokens (well under 2000 limit)
