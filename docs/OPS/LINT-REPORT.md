# LINT REPORT — 2025-10-13 12:45:20

## Summary
✅ **ESLint: 0 errors, 430 warnings across 236 files** (Pass 208 - ESLint Zero achieved!)

## Command
```bash
cd frontend
npx eslint "src/**/*.{ts,tsx,js,jsx}" --format json
```

## Results

### Overall Stats
- **Total Files Scanned**: 236
- **Total Errors**: 0 ✅
- **Total Warnings**: 430 🟡
- **Status**: GREEN (zero blocking errors)

### Top 15 Rules by Occurrence

| Rule | Count | Type |
|------|-------|------|
| `no-unused-vars` | 184 | Warning |
| `@typescript-eslint/no-explicit-any` | 142 | Warning |
| `@typescript-eslint/no-unused-vars` | 56 | Warning |
| `@typescript-eslint/no-non-null-assertion` | 12 | Warning |
| `react-hooks/exhaustive-deps` | 12 | Warning |
| `@next/next/no-img-element` | 8 | Warning |
| `react/no-unescaped-entities` | 6 | Warning |
| `@next/next/no-html-link-for-pages` | 4 | Warning |
| `@typescript-eslint/no-empty-object-type` | 3 | Warning |
| `@typescript-eslint/no-unused-expressions` | 2 | Warning |
| `@typescript-eslint/ban-ts-comment` | 1 | Warning |
| `prefer-const` | 1 | Warning |

### Top 20 Files by Total Issues

| File | Issues |
|------|--------|
| `src/lib/events.ts` | 36 |
| `src/lib/errors.ts` | 35 |
| `src/lib/gdpr-dsr.ts` | 30 |
| `src/lib/payment-providers.ts` | 27 |
| `src/app/api/checkout/route.ts` | 13 |
| `src/app/api/admin/orders/[id]/status/route.ts` | 12 |
| `src/contexts/ToastContext.tsx` | 12 |
| `src/lib/types/checkout-hook.ts` | 12 |
| `src/app/api/orders/public/[token]/route.ts` | 10 |
| `src/lib/api/checkout.ts` | 10 |
| `src/lib/checkout/shippingRetry.ts` | 9 |
| `src/app/admin/page.tsx` | 7 |
| `src/app/api/checkout/pay/route.ts` | 7 |
| `src/app/test-error/page.tsx` | 7 |
| `src/components/shipping/DeliveryMethodSelector.tsx` | 7 |
| `src/hooks/useCheckout.ts` | 7 |
| `src/hooks/useProducerAuth.ts` | 7 |
| `src/lib/api/producer-analytics.ts` | 7 |
| `src/components/SEOHead.tsx` | 6 |
| `src/lib/notify/deliver.ts` | 6 |

## Analysis

### Critical Issues (0 Errors) ✅
- **0 blocking errors** - ESLint Zero achieved in Pass 208!
- Fixed: `@ts-ignore` → `@ts-expect-error` in `src/app/api/orders/public/[token]/route.ts:41`
- Most issues are warnings (430 total) rather than hard errors

### Pattern Analysis

#### Unused Variables (240 total)
- `no-unused-vars`: 184 occurrences
- `@typescript-eslint/no-unused-vars`: 56 occurrences
- **Impact**: Code bloat, potential confusion
- **Fix**: Remove unused imports and variables

#### Type Safety (142 occurrences)
- `@typescript-eslint/no-explicit-any`: 142 occurrences
- **Impact**: Reduced type safety, harder to catch bugs
- **Fix**: Replace `any` with proper TypeScript types

#### React Best Practices (26 occurrences)
- `react-hooks/exhaustive-deps`: 12 (missing dependencies in useEffect)
- `@next/next/no-img-element`: 8 (use next/image instead)
- `react/no-unescaped-entities`: 6 (escape quotes in JSX)
- `@next/next/no-html-link-for-pages`: 4 (use next/link)

### Hot Spots

Files with highest issue density (>25 issues):
1. **src/lib/events.ts** (36 issues) — likely event system with many unused params
2. **src/lib/errors.ts** (35 issues) — error handling utilities
3. **src/lib/gdpr-dsr.ts** (30 issues) — GDPR data subject request handlers
4. **src/lib/payment-providers.ts** (27 issues) — payment integration layer

## Recommendations

### Immediate Actions (Priority 1)
1. ~~**Fix the 1 blocking error**~~ — ✅ DONE in Pass 208 (@ts-ignore → @ts-expect-error)
2. **Remove unused variables** in top 4 hot spot files (events, errors, gdpr-dsr, payment-providers)
3. **Run ESLint fix** for auto-fixable issues: `npx eslint --fix "src/**/*.{ts,tsx}"`

### Short-term Improvements (Priority 2)
4. **Replace `any` types** in lib/ files with proper TypeScript interfaces
5. **Fix React hooks dependencies** (12 occurrences)
6. **Migrate to next/image** (8 occurrences of <img>)

### Long-term Quality (Priority 3)
7. **Enable ESLint in CI** as a required check (currently warnings)
8. **Set up pre-commit hooks** to prevent new lint violations
9. **Incremental cleanup** — fix 10-20 issues per PR to avoid large diffs

## Next Actions

- [x] ~~Identify and fix the 1 blocking error~~ (Pass 208 ✅)
- [ ] Run `eslint --fix` for auto-fixable issues
- [ ] Create PR for top 4 hot spot file cleanups
- [ ] Update CI to fail on errors (currently passes with warnings)
- [ ] Track lint debt reduction weekly

---

**Generated**: Pass 207 — Lint Report + PR Hygiene Sweep
**Baseline**: 1 error, 430 warnings (2025-10-13)
**Target**: 0 errors, <100 warnings by end of month
