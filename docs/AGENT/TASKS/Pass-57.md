# Pass 57 — Producer Orders CSV Export

## Goal
- Producers can export their orders list to CSV from /my/orders.
- Export is authenticated (producer only) and scoped to that producer's orders.

## Scope
Included:
- Laravel endpoint that returns CSV
- Frontend button on /my/orders to download CSV
- Playwright regression test for export response

Excluded:
- No refactors, no redesign of orders domain, no new DB schema

## DoD
- [ ] Endpoint returns 200 text/csv (UTF-8, Excel-friendly)
- [ ] Only producer's orders exported (auth scoped)
- [ ] UI button works (downloads file)
- [ ] Playwright test added + CI green
- [ ] docs/OPS/STATE.md + docs/AGENT/SUMMARY/Pass-57.md updated
