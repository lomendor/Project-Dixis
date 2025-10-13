# Pass 174R.4 — Money Contract Normalization Summary

**Date**: 2025-10-13  
**Branch**: `feat/pass-174r4-money`  
**PR**: TBD (will be created)

## Summary

Normalize money contract across helpers/adapters with cents-first approach using branded types for type safety. This is a **non-breaking** change that adds `*Cents` fields alongside existing fields.

## Changes

### (A) Money Types (`frontend/src/types/money.ts`)
- **Created**: New branded `Cents` type for type-safe cents handling
- `toCents(n)`: Convert decimal to cents with proper rounding
- `fromCents(c)`: Convert cents back to decimal
- `fmtEUR(n)`: Format decimal as EUR with Greek locale

### (B) Enhanced Totals Helper (`frontend/src/lib/cart/totals.ts`)
- **Added**: Import of `Cents` and `toCents` from money types
- **Enhanced**: `TotalsOutput` interface now includes branded Cents fields:
  - `subtotalCents: Cents`
  - `shippingCents: Cents`
  - `codFeeCents: Cents`
  - `taxCents: Cents`
  - `grandTotalCents: Cents`
- **Modified**: `calcTotals()` now returns both regular and branded Cents fields
- **Non-breaking**: Existing fields (`subtotal`, `shipping`, etc.) remain unchanged

### (C) Enhanced Wire Adapter (`frontend/src/lib/cart/totals-wire.ts`)
- **Added**: Import of `Cents` and `toCents` from money types
- **Modified**: `computeTotalsFromContext()` now returns branded Cents types
- **Added**: `withCentsProjection()` helper function
  - Ensures `*Cents` fields always exist in totals objects
  - Non-breaking: adds fields only if missing
  - Does not override existing `*Cents` fields

### (D) Comprehensive Tests (`frontend/tests/totals/cents.spec.ts`)
- 7 test cases covering money contract normalization:
  1. `toCents` conversion accuracy
  2. `fromCents` conversion accuracy
  3. `calcTotals` exposes both regular and `*Cents` fields
  4. Totals projection consistency
  5. `withCentsProjection` ensures cents fields exist
  6. `withCentsProjection` does not override existing fields
  7. PICKUP method cents projection

## Files Created/Modified

**Created** (2 files, ~180 LOC):
- `frontend/src/types/money.ts` (23 LOC)
- `frontend/tests/totals/cents.spec.ts` (119 LOC)

**Modified** (3 files, ~40 LOC changed):
- `frontend/src/lib/cart/totals.ts` (+15 LOC)
- `frontend/src/lib/cart/totals-wire.ts` (+25 LOC)
- `frontend/docs/OPS/STATE.md` (+1 LOC)

## Technical Details

### Branded Types for Type Safety
```typescript
export type Cents = number & { readonly __brand: 'Cents' };
```
This provides compile-time type safety while maintaining runtime compatibility with regular numbers.

### Conversion Functions
```typescript
// Decimal → Cents (with rounding)
export const toCents = (n: number): Cents => 
  Math.round((Number(n||0)+Number.EPSILON) * 100) as Cents;

// Cents → Decimal
export const fromCents = (c: Cents): number => Number(c)/100;
```

### Non-Breaking Interface Extension
```typescript
export interface TotalsOutput {
  // Existing fields (unchanged)
  subtotal: number;
  shipping: number;
  // ...
  
  // New branded Cents fields (non-breaking addition)
  subtotalCents: Cents;
  shippingCents: Cents;
  // ...
}
```

## Testing

- ✅ **TypeScript typecheck**: PASS
- ✅ **7 new test cases**: All covering cents-first contract
- ✅ **Zero breaking changes**: All existing tests still pass

## Impact

- **Zero Breaking Changes**: Existing API contracts remain unchanged
- **Type Safety**: Branded `Cents` type prevents accidental mixing of cents/dollars
- **Future-Proof**: Provides foundation for consistent money handling across codebase
- **Non-Intrusive**: Changes limited to helpers/adapters/tests only

## Next Steps

1. Commit all changes to `feat/pass-174r4-money` branch
2. Push to origin
3. Create PR with `ai-pass` and `risk-ok` labels
4. Enable auto-merge (squash on green)
5. Monitor CI checks

## Notes

- Branded types provide compile-time safety without runtime overhead
- All existing code continues to work with regular number fields
- New code can opt-in to using branded `Cents` fields for type safety
- Helper functions ensure cents fields are always present where needed
