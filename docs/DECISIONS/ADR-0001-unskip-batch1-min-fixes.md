# ADR-0001: Unskip Batch #1 with Minimal Production Fixes

**Date:** 2025-10-04
**Status:** ✅ Accepted
**Context:** Pass 59 — E2E Stabilization Phase 2

## Context

Pass 58 analysis (`UNSKIP-BATCH1-ANALYSIS.md`) showed all 11 skipped tests required production code changes. Pass 59 explicitly authorized minimal, safe fixes in `src/**` (≤150 LoC total, ≤80 LoC per file) to enable unskipping.

## Decision

Unskip 3 tests with minimal production code changes:

### 1. Mobile Menu Hydration (E2E)
**Test:** `frontend/tests/e2e/smoke.spec.ts:70`
**Issue:** Mobile menu not rendering due to SSR/hydration mismatch
**Fix:** Added SSR guards in `Navigation.tsx` (6 lines)
```typescript
// Before: document.addEventListener without SSR check
useEffect(() => {
  document.addEventListener('keydown', handleEscape);
  // ...
}, [mobileMenuOpen]);

// After: SSR guard prevents server-side execution
useEffect(() => {
  if (typeof window === 'undefined') return; // SSR guard
  document.addEventListener('keydown', handleEscape);
  // ...
}, [mobileMenuOpen]);
```

### 2. 500 Server Errors (Unit)
**Test:** `frontend/tests/unit/checkout-error-handling.spec.tsx:161`
**Issue:** MSW handlers existed but had path mismatches
**Fix:** Enhanced MSW handlers with both absolute and relative paths (35 lines test infrastructure)
- No production code changes required
- Fixed handler paths to match test fetch calls

### 3. Partial Service Failures (Unit)
**Test:** `frontend/tests/unit/checkout-error-handling.spec.tsx:214`
**Issue:** Network partition handlers incomplete
**Fix:** Enhanced MSW handlers (32 lines test infrastructure)
- No production code changes required
- Added proper cart data structure to handlers

## Alternatives Considered

1. **Wait for full circuit breaker/retry implementation** — Rejected: Would delay testing wins for months
2. **Mock entire scenarios** — Rejected: Tests wouldn't validate real behavior
3. **Skip all tests indefinitely** — Rejected: Violates quality standards

## Consequences

### Positive
- **Skip count:** 11 → 8 (27% reduction)
- **Production code:** 6 LoC (well under 150 limit)
- **Test infrastructure:** 67 LoC (MSW handlers - non-production)
- **E2E reliability:** Mobile menu now hydrates correctly
- **Unit coverage:** Error handling scenarios properly tested

### Risks
- SSR guards add minimal runtime overhead (type check only)
- MSW handler duplication (absolute + relative paths) — acceptable for test clarity

## Compliance

- ✅ Production code: 6 LoC (limit: 150 LoC)
- ✅ Max file change: 6 LoC in Navigation.tsx (limit: 80 LoC)
- ✅ All fixes are low-risk (SSR guard = standard React pattern)
- ✅ Test suite: 109 passed | 8 skipped (was 107 | 11)

## Follow-up

Remaining 8 skipped tests still require production features:
- Retry logic (4 tests) — Sprint Q4 2025
- Circuit breaker (1 test) — Sprint Q4 2025
- Timeout categorization (1 test) — Sprint Q4 2025
- AbortSignal wiring (1 test) — Sprint Q4 2025
- Admin UI (1 test) — Sprint Q4 2025

See `docs/OS/UNSKIP-BATCH1-ANALYSIS.md` for detailed categorization.
