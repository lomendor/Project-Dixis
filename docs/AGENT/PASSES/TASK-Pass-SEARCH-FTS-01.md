# Pass SEARCH-FTS-01 — Full-Text Product Search

**When**: 2026-01-16

## Goal

Implement ranked full-text product search with PostgreSQL FTS and frontend search input.

## Why

- PRD requirement: "Product search functionality"
- Identified in PRD-AUDIT-01 as unblocked gap
- Improves product discoverability for consumers

## How

### Backend

1. **Migration** (`2026_01_16_163733_add_search_vector_to_products_table.php`):
   - Adds `search_vector` tsvector column (PostgreSQL-only)
   - Combines `name` and `description` fields
   - Creates GIN index for fast FTS queries

2. **ProductController::index()** updated:
   - Uses `websearch_to_tsquery('simple', ?)` for safe query construction
   - Ranks results with `ts_rank_cd()`
   - Orders by relevance (best match first)
   - ILIKE fallback for non-PostgreSQL (SQLite in CI)

### Frontend

1. **ProductSearchInput** component:
   - 300ms debounce to reduce API calls
   - Syncs with `?search=` URL param for shareable links
   - Shows loading spinner during search

2. **Products page** (`/products`):
   - Search input with `data-testid="search-input"`
   - "No results" message with `data-testid="no-results"`
   - Result count shows search term

## Definition of Done

- [x] Backend migration adds tsvector + GIN index (pgsql-only)
- [x] Backend uses websearch_to_tsquery for safe FTS
- [x] Backend ranks by ts_rank_cd (best match first)
- [x] Frontend search input on /products page
- [x] Frontend URL sync (?search=...) for shareable links
- [x] Frontend "no results" message
- [x] PHPUnit tests pass (nonsense query, Greek chars)
- [x] E2E tests pass (filters-search.spec.ts updated)
- [x] TASKS + SUMMARY + STATE + NEXT-7D updated

## PRs

| PR | Title | Status |
|----|-------|--------|
| #2242 | feat: Pass SEARCH-FTS-01 full-text product search | MERGED |

## Technical Notes

- **Greek handling**: Uses `'simple'` text search config (no stemming). Accent handling is client-side only.
- **CI compatibility**: Migration conditional on `DB::getDriverName() === 'pgsql'`
- **No silent fallback**: FTS errors on PostgreSQL will propagate (no try/catch hiding)
