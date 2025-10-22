# AG80 CODEMAP: Orders Advanced Filters

**Generated**: 2025-10-23
**Feature**: Search query (q) + Date range (fromDate/toDate) filtering

## File Dependency Graph

```
types.ts (ListParams interface)
   ↓
_map.ts (parseDateRange helper)
   ↓
├─ demo.ts (client-side filtering)
├─ pg.ts (Prisma where clauses)
└─ sqlite.ts (Prisma where clauses)
   ↓
index.ts (exports ListParams)
   ↓
route.ts (API accepts q, fromDate, toDate)
   ↓
AdminOrdersMain.tsx (UI with search + date inputs)
```

## Data Flow

### 1. User Input → URL State
```typescript
// User types in search box
<input value={q} onChange={e=>setQ(e.target.value)} />

// User clicks Apply
onSubmitFilters() {
  writeParam('q', q || null);
  writeParam('fromDate', fromDate || null);
  writeParam('toDate', toDate || null);
}
```

### 2. URL State → API Request
```typescript
// Read from URL
const url = new URL(window.location.href);
const q = url.searchParams.get('q') || '';
const fromDate = url.searchParams.get('fromDate') || '';
const toDate = url.searchParams.get('toDate') || '';

// Build API query
const qs = new URLSearchParams();
if (q) qs.set('q', q);
if (fromDate) qs.set('fromDate', fromDate);
if (toDate) qs.set('toDate', toDate);

fetch(`/api/admin/orders?${qs.toString()}`);
```

### 3. API → Provider
```typescript
// route.ts extracts query params
const q = url.searchParams.get('q') || undefined;
const fromDate = url.searchParams.get('fromDate') || undefined;
const toDate = url.searchParams.get('toDate') || undefined;

// Pass to provider
const data = await repo.list({
  status, page, pageSize, sort,
  q, fromDate, toDate
});
```

### 4. Provider → Database/Filter
```typescript
// pg.ts builds Prisma where clause
const where:any = {};
if (p.q) {
  where.OR = [
    { id: { contains: p.q, mode: 'insensitive' } },
    { buyerName: { contains: p.q, mode: 'insensitive' } },
  ];
}
const range = parseDateRange(p);
if (range.gte || range.lte) {
  where.createdAt = {
    ...(range.gte && { gte: range.gte }),
    ...(range.lte && { lte: range.lte })
  };
}

// Execute query
const [items, count] = await Promise.all([
  prisma.order.findMany({ where, skip, take, orderBy }),
  prisma.order.count({ where })
]);
```

## Key Functions

### `parseDateRange(p?: Pick<ListParams,'fromDate'|'toDate'>)`
**Location**: frontend/src/lib/orders/providers/_map.ts
**Purpose**: Convert ISO date strings to Date objects with timezone handling
**Returns**: `{ gte?: Date; lte?: Date }`

**Logic**:
- Appends T00:00:00Z to fromDate (start of day UTC)
- Appends T23:59:59Z to toDate (end of day UTC)
- Returns undefined for invalid dates

### `onSubmitFilters(e: React.FormEvent)`
**Location**: frontend/src/app/admin/orders/_components/AdminOrdersMain.tsx:129
**Purpose**: Apply search and date filters to URL and reset pagination
**Side Effects**: Updates URL params, triggers API refetch via useEffect

### Provider `list()` implementations
**Locations**: demo.ts:31, pg.ts:31, sqlite.ts:31
**Purpose**: Execute filtering logic before pagination
**Pattern**: Filter → Count → Paginate → Return

## Test Coverage

### API Tests
- **api-orders-filters.spec.ts**: Verifies API accepts q + status + date params (demo mode)
- **api-orders-pg-filters.spec.ts**: PG-gated test for filter acceptance

### UI Tests
- **admin-orders-ui-filters.spec.ts**: E2E test of search box, Apply, and Clear buttons

## State Management

### URL as Source of Truth
All filter state is synchronized with URL query parameters:
- `?q=A-200` → Search query
- `?fromDate=2024-01-01` → Date range start
- `?toDate=2024-12-31` → Date range end
- `?useApi=1` → Feature flag for API mode

### React State
Local state mirrors URL for immediate UI updates:
```typescript
const [q, setQ] = React.useState('');
const [fromDate, setFromDate] = React.useState<string>('');
const [toDate, setToDate] = React.useState<string>('');
```

### Effect Hook
Refetches data whenever filter state changes:
```typescript
React.useEffect(() => {
  // Build API request with current filters
  // Update rows and count
}, [active, page, pageSize, sort, mode, q, fromDate, toDate]);
```

## Backward Compatibility

All new ListParams fields are optional:
```typescript
export interface ListParams {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
  sort?: SortArg;
  q?: string;          // ← NEW (optional)
  fromDate?: string;   // ← NEW (optional)
  toDate?: string;     // ← NEW (optional)
}
```

Existing code calling `repo.list({ status, page })` continues to work without modification.
