# TL;DR — Pass 174Q (Quick-Wins Triad)

## Summary
Three quick-win improvements for developer experience and code quality.

## Changes

### (A) PR Hygiene
- PR template with Summary/Reports/Test Summary sections
- Labeler config for auto-applying ai-pass/risk-ok labels
- Applied to all open PRs #479-#485

### (B) Totals/Taxes Helper
- Single source of truth: `frontend/src/lib/cart/totals.ts`
- Functions: calcTotals(), fmtEUR(), round2()
- Features: Subtotal, shipping, COD fee, configurable tax
- Tests: 2 Playwright tests (COD with tax, pickup without)

### (C) Minimal Observability
- requestId utility: Extract or generate UUID
- /api/dev/health: Dev-only health check endpoint
- Returns env, requestId, timestamp
- Sets x-request-id response header

## Impact
- ✅ Consistent PR documentation structure
- ✅ Type-safe order total calculations
- ✅ EL-formatted currency (€34,32)
- ✅ Request tracing for debugging
- ✅ Dev-only health check endpoint
