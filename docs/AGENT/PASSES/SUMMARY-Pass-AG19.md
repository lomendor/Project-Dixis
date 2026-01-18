# Pass AG19 — Admin Orders CSV Export + Filters

**Date**: 2025-10-17 (continued)
**Branch**: feat/AG19-admin-orders-csv-filters
**Status**: Complete

## Summary

Adds comprehensive filtering and CSV export functionality to admin orders interface with query parameter support, CSV generation with proper escaping, filter UI controls, and E2E test coverage.

## Changes

### Modified Files

**frontend/src/app/api/admin/orders/route.ts**:
- Changed signature from `GET()` to `GET(req: Request)` to accept query params
- Added URLSearchParams parsing for filters: q, pc, method, status, from, to, take
- Built Prisma `where` clause dynamically based on provided filters
- Applied same filters to in-memory fallback with JavaScript filtering
- Limits: `take` parameter capped at 1000, default 50
- Filter details:
  - `q`: Search in Order ID or email (case-insensitive, contains)
  - `pc`: Postal code (contains)
  - `method`: Exact match (COURIER, PICKUP, etc.)
  - `status`: Payment status exact match
  - `from`: Created date >= (ISO date string)
  - `to`: Created date <= (ISO date string)
  - `take`: Result limit (max 1000)

**frontend/src/app/admin/orders/page.tsx**:
- Added filter state management (q, pc, method, status)
- Created `fetchOrders` callback to build query string and fetch filtered list
- Added `buildExportUrl` function to generate CSV export link with current filters
- Added filter UI controls section:
  - Search input (q) for ID/email
  - Postal code input (pc)
  - Method dropdown (COURIER, PICKUP)
  - Status dropdown (PAID, PENDING, FAILED)
  - "Εφαρμογή Φίλτρων" button to apply filters
  - "Καθαρισμός" button to clear all filters
  - "Export CSV" link/button with download attribute
- All inputs have data-testid attributes for E2E testing
- Filters auto-apply via useEffect when state changes

### New Files

**frontend/src/app/api/admin/orders/export/route.ts**:
- GET endpoint for CSV export
- Guarded by `adminEnabled()` (BASIC_AUTH=1)
- Accepts same filter parameters as list endpoint
- Fetches filtered orders from Prisma or in-memory fallback
- Generates CSV with proper escaping via `escapeCSV` utility
- CSV columns:
  - Order ID, Created At, Postal Code, Method
  - Weight (g), Subtotal, Shipping Cost, COD Fee
  - Total, Email, Payment Status, Payment Ref
- Returns with proper headers:
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="orders.csv"`
- Max 1000 rows for export (default), configurable via `take` param

**frontend/tests/e2e/admin-orders-export-filters.spec.ts**:
- Two E2E test scenarios:

1. **CSV export test**:
   - Creates order via checkout flow
   - Captures Order ID from confirmation
   - Navigates to admin orders page
   - Clicks "Export CSV" button
   - Waits for download event
   - Reads downloaded file from disk
   - Asserts CSV contains header row
   - Asserts CSV contains Order ID and postal code

2. **Filter by postal code test**:
   - Creates order with unique postal code (12345)
   - Navigates to admin orders page
   - Fills filter input with postal code
   - Clicks apply filters button
   - Asserts filtered order appears in table
   - Verifies postal code is visible in results

**docs/AGENT/PASSES/SUMMARY-Pass-AG19.md**: This file

### Updated Files

**docs/AGENT/SYSTEM/routes.md**:
- Updated `GET /api/admin/orders` documentation with filter parameters
- Added new `GET /api/admin/orders/export` endpoint documentation

## Technical Details

**Filter Implementation Pattern**:
- Query string parsing: `new URL(req.url).searchParams`
- Prisma dynamic where clause building with spread operator
- In-memory filtering with JavaScript array methods
- Same logic applied to both Prisma and in-memory paths

**CSV Escaping Strategy**:
```typescript
function escapeCSV(val: any): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
```

**UI State Management**:
- React useState for each filter field
- useCallback for fetchOrders to prevent infinite loops
- useEffect with dependencies to auto-fetch on filter change
- Query string built client-side via URLSearchParams

**E2E Download Testing**:
- Playwright `waitForEvent('download')` pattern
- `download.path()` to get temp file location
- Node.js `fs.readFileSync` to read CSV content
- Content assertions using `expect().toContain()`

## Testing

- E2E test verifies CSV export flow end-to-end
- Tests filter functionality with postal code search
- Validates CSV format (header + data rows)
- Works with both Prisma and in-memory orders
- Tests include proper error handling (skip if flow not available)

## Notes

- No changes to business logic or data models
- Filter parameters are optional (all default to empty)
- CSV export respects same filters as list view
- Admin guard applied to both list and export endpoints
- Graceful fallback to in-memory storage maintained
- Take limit enforced at API level (max 1000)
- Export filename is static: "orders.csv"

---

**Generated**: 2025-10-17 (continued)
