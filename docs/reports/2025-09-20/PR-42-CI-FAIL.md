# PR #42 — CI Failure Report (2025-09-20T20:36:18+03:00)

## Status Summary
- ❌ **integration**: FAILURE
- ⏳ **e2e-tests**: IN_PROGRESS (still running) 
- ✅ **php-tests**: SUCCESS

## Root Cause Identified

### Integration Test Failure
**Issue**: Greek localization broke integration test selectors

**Failed Test**: catalog-filters.spec.ts:66:7 › Catalog Filters & Search › filter persistence and URL integration

**Error**: Test timeout waiting for input[placeholder="Search products..."]

**Cause**: Our Greek localization changed placeholder from "Search products..." to "Αναζήτηση προϊόντων..."

## Technical Details
Frontend successfully loads with Greek UI but tests expect English selectors.

## Required Fix
Update test selectors in backend/frontend/tests/e2e/catalog-filters.spec.ts:71 to use Greek placeholders or data-testid attributes.

## Failed Jobs Links
- integration → https://github.com/lomendor/Project-Dixis/actions/runs/17882770813/job/50852567802

## Next Steps
1. Fix integration test selectors for Greek localization
2. Re-run CI pipeline  
3. Manual merge only after all tests pass

---
**Report Generated**: 2025-09-20T20:36:18+03:00
**CI Run**: 17882770813
**Root Cause**: Greek localization broke English test selectors
**Status**: 🔴 **LOCALIZATION MISMATCH**
