# Pass SEARCH-FTS-01 Summary

**Date**: 2026-01-16
**Status**: ✅ CLOSED

## What Changed

Implemented ranked full-text product search using PostgreSQL tsvector with frontend search input.

## Files Created/Modified

| File | Change |
|------|--------|
| `backend/database/migrations/2026_01_16_163733_add_search_vector_to_products_table.php` | NEW - tsvector + GIN index |
| `backend/app/Http/Controllers/Public/ProductController.php` | MODIFIED - FTS ranking |
| `backend/tests/Feature/PublicProductsTest.php` | MODIFIED - 2 new search tests |
| `frontend/src/components/ProductSearchInput.tsx` | NEW - Debounced search input |
| `frontend/src/app/(storefront)/products/page.tsx` | MODIFIED - Added search UI |
| `frontend/tests/e2e/filters-search.spec.ts` | MODIFIED - Updated for /products |

## Key Decisions

1. **websearch_to_tsquery**: Safely parses user input (handles phrases, operators)
2. **'simple' config**: No stemming, works with Greek and English
3. **ILIKE fallback**: Non-PostgreSQL (CI SQLite) uses existing LIKE search
4. **300ms debounce**: Reduces API calls while typing

## How Ranking Works

On PostgreSQL:
1. User query is passed to `websearch_to_tsquery('simple', ?)`
2. Products matching `search_vector @@ query` are selected
3. Results ranked by `ts_rank_cd(search_vector, query)`
4. Ordered by rank DESC (best match first)

On SQLite (CI):
- Falls back to `WHERE name LIKE '%term%' OR description LIKE '%term%'`
- No ranking, just matching

## Evidence

- PR #2242: https://github.com/lomendor/Project-Dixis/pull/2242 (MERGED)
- All checks passed: E2E PostgreSQL, PHPUnit, quality-gates, heavy-checks

## Next

Pick EN-LANGUAGE-01 (English Language Support) or PRODUCER-DASHBOARD-01 from NEXT-7D.
