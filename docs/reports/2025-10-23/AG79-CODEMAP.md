# AG79 — CODEMAP: Pagination & Sorting Architecture

**Date**: 2025-10-23
**Pass**: AG79
**Branch**: `feat/AG79-orders-pagination-sorting`

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface Layer                   │
│  AdminOrdersMain.tsx (React Client Component)           │
│  - Pagination controls (Prev/Next)                      │
│  - Page size selector (5, 10, 20)                       │
│  - Sort toggle (Date/Total, Asc/Desc)                   │
│  - Status filter dropdown                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP GET /api/admin/orders?
                     │ page=1&pageSize=10&sort=-createdAt
                     │
┌────────────────────▼────────────────────────────────────┐
│                   API Route Layer                        │
│  /api/admin/orders/route.ts                             │
│  - Parse query params (page, pageSize, sort, status)    │
│  - Validate inputs                                       │
│  - Call provider.list(params)                           │
│  - Return JSON { items, count }                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ list(ListParams)
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Provider Layer                          │
│  OrdersRepo interface (types.ts)                        │
│  - list(params?: ListParams): Promise<{items,count}>    │
└─────────────┬───────────────┬──────────────┬────────────┘
              │               │              │
      ┌───────▼───┐   ┌───────▼───┐  ┌──────▼──────┐
      │  demo.ts  │   │   pg.ts   │  │ sqlite.ts   │
      │  (static) │   │ (Prisma)  │  │  (Prisma)   │
      └───────────┘   └───────────┘  └─────────────┘
```

---

## 🔧 Component Details

### 1. Types Layer (`types.ts`)

**Purpose**: Define contracts for pagination & sorting

**Key Types**:
```typescript
// Sort keys (extendable)
export type SortKey = 'createdAt'|'total';

// Sort argument (with direction prefix)
export type SortArg = `${''|'-'}${SortKey}`;

// List parameters (pagination + filters)
export interface ListParams {
  status?: OrderStatus;
  page?: number;       // 1-based (default: 1)
  pageSize?: number;   // 5..100 (default: 10)
  sort?: SortArg;      // default: -createdAt
}

// Provider interface
export interface OrdersRepo {
  list(params?: ListParams): Promise<{ items: Order[]; count: number }>;
}
```

**Design Notes**:
- **1-based pagination**: User-friendly (page 1, not page 0)
- **Clamped page size**: Prevents abuse (5-100 items)
- **Sort prefix**: `-` = descending (e.g., `-createdAt` = newest first)

---

### 2. Helper Functions (`_map.ts`)

**Purpose**: Shared utilities for parsing & clamping

**Functions**:
```typescript
// Parse sort string → { key, desc }
export function parseSort(s?: string): { key: SortKey; desc: boolean } {
  const str = s ?? '-createdAt';
  const desc = str.startsWith('-');
  const key = (desc ? str.slice(1) : str) as SortKey;
  return { key, desc };
}

// Clamp numeric value to range
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
```

**Usage**:
```typescript
const { key, desc } = parseSort('-total');  // { key: 'total', desc: true }
const ps = clamp(pageSize ?? 10, 5, 100);   // Ensure 5 <= pageSize <= 100
```

---

### 3. Demo Provider (`demo.ts`)

**Purpose**: Static in-memory data with client-side pagination

**Implementation**:
```typescript
export const demoRepo: OrdersRepo = {
  async list(params?: ListParams) {
    let arr = DEMO; // Static array of 6 orders

    // Filter by status
    if (params?.status) arr = arr.filter(o=>o.status===params.status);

    // Sort
    const { key, desc } = parseSort(params?.sort);
    arr = [...arr].sort((a,b)=>{
      let aVal = key === 'total' ? parseFloat(a.total.replace(/[^\d.]/g,'')) : a.id;
      let bVal = key === 'total' ? parseFloat(b.total.replace(/[^\d.]/g,'')) : b.id;
      return desc ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });

    // Paginate
    const pageSize = clamp(params?.pageSize ?? 10, 5, 100);
    const page = Math.max(params?.page ?? 1, 1);
    const skip = (page - 1) * pageSize;
    const items = arr.slice(skip, skip + pageSize);

    return { items, count: arr.length };
  }
};
```

**Characteristics**:
- **No database**: Pure JavaScript array operations
- **Fast**: All operations in-memory
- **Limited**: Only 6 static orders (A-2001 to A-2006)
- **Sort workaround**: Parse `€42.00` string to float for numeric sorting

---

### 4. PostgreSQL Provider (`pg.ts`)

**Purpose**: Real database queries with Prisma ORM

**Implementation**:
```typescript
export const pgRepo: OrdersRepo = {
  async list(params?: ListParams) {
    const where = params?.status ? { status: params.status } : undefined;
    const { key, desc } = parseSort(params?.sort);
    const orderBy = { [key]: desc ? 'desc' : 'asc' } as any;

    const pageSize = clamp(params?.pageSize ?? 10, 5, 100);
    const page = Math.max(params?.page ?? 1, 1);
    const skip = (page - 1) * pageSize;

    const [rows, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: { id: true, buyerName: true, total: true, status: true },
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(toDto), count };
  },
};
```

**Characteristics**:
- **Database-backed**: Real PostgreSQL queries
- **Optimized**: Single query for data + count (parallel `Promise.all`)
- **Prisma features**: `orderBy`, `skip`, `take`, `where`
- **Production-ready**: Scales to thousands of orders

---

### 5. SQLite Provider (`sqlite.ts`)

**Purpose**: Local dev/CI database with identical logic to PG

**Implementation**:
- **Identical to `pg.ts`**: Copy-paste implementation
- **Database**: SQLite instead of PostgreSQL
- **Use Case**: CI workflows, local development

**Characteristics**:
- **File-based**: No server required
- **Fast**: Good for small datasets (<10k rows)
- **CI-friendly**: Easy setup in GitHub Actions

---

### 6. API Route (`/api/admin/orders/route.ts`)

**Purpose**: HTTP endpoint exposing pagination API

**Flow**:
```typescript
export async function GET(req: NextRequest) {
  // 1. Parse query params
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const page = url.searchParams.get('page');
  const pageSize = url.searchParams.get('pageSize');
  const sort = url.searchParams.get('sort');

  // 2. Validate status
  const ALLOWED = new Set(['pending','paid','shipped','cancelled','refunded']);
  if (status && !ALLOWED.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // 3. Get provider (demo, pg, sqlite)
  const mode = forceDemo ? 'demo' : (process.env.DIXIS_DATA_SRC || ...);
  const repo = getOrdersRepo(mode);

  // 4. Call provider
  const data = await repo.list({
    status: status as OrderStatus | undefined,
    page: page ? parseInt(page, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    sort: sort as SortArg | undefined,
  });

  // 5. Return JSON
  return NextResponse.json(data, { status: 200 });
}
```

**Response Format**:
```json
{
  "items": [
    { "id": "A-3006", "customer": "Κώστας", "total": "€31.70", "status": "pending" },
    { "id": "A-3005", "customer": "Άννα", "total": "€19.50", "status": "shipped" }
  ],
  "count": 6
}
```

**Error Handling**:
- `400 Bad Request`: Invalid status value
- `500 Internal Error`: Unexpected provider error
- `501 Not Implemented`: Provider not available

---

### 7. UI Component (`AdminOrdersMain.tsx`)

**Purpose**: User-facing pagination controls & data display

**State Management**:
```typescript
const [orders, setOrders] = React.useState<Order[]>([]);
const [count, setCount] = React.useState(0);
const [page, setPage] = React.useState(1);
const [pageSize, setPageSize] = React.useState(10);
const [sort, setSort] = React.useState<SortArg>('-createdAt');
const [status, setStatus] = React.useState<OrderStatus | ''>('');
```

**Data Fetching**:
```typescript
const fetchOrders = React.useCallback(async () => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  params.set('sort', sort);

  const res = await fetch(`/api/admin/orders?${params.toString()}`);
  const data = await res.json();
  setOrders(data.items || []);
  setCount(data.count || 0);
}, [status, page, pageSize, sort]);

React.useEffect(() => {
  fetchOrders();
}, [fetchOrders]);
```

**UI Controls**:
- **Status Filter**: Dropdown (All, Pending, Paid, Shipped, Cancelled, Refunded)
- **Page Size**: Dropdown (5, 10, 20)
- **Sort Toggle**: Button cycling through 4 states
- **Pagination**: Previous/Next buttons with disabled states

**Sort Cycle**:
```
Date ↓ → Date ↑ → Total ↓ → Total ↑ → Date ↓ ...
(-createdAt → createdAt → -total → total → -createdAt)
```

---

## 🧪 Test Architecture

### Test Layer 1: API Tests (`api-orders-pagination.spec.ts`)

**Coverage**:
- ✅ Default pagination (no params)
- ✅ Page and pageSize params
- ✅ Sort param (asc/desc)
- ✅ Filter + pagination
- ✅ Count consistency
- ✅ Invalid page handling

**Example**:
```typescript
test('should accept page and pageSize params', async ({ request }) => {
  const res = await request.get('/api/admin/orders?demo=1&page=1&pageSize=5');
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.items.length).toBeLessThanOrEqual(5);
});
```

---

### Test Layer 2: UI Tests (`admin-orders-ui-pagination.spec.ts`)

**Coverage**:
- ✅ Controls visibility
- ✅ Page size selector
- ✅ Sort toggle cycling
- ✅ Navigation (Prev/Next)
- ✅ Disabled states
- ✅ Results count
- ✅ Error handling

**Example**:
```typescript
test('should cycle through sort options', async ({ page }) => {
  const sortBtn = page.getByTestId('sort-toggle');
  await expect(sortBtn).toContainText('Date ↓');
  await sortBtn.click();
  await expect(sortBtn).toContainText('Date ↑');
});
```

---

### Test Layer 3: PG Gated Tests (`api-orders-pg-pagination.spec.ts`)

**Coverage** (only runs when `PG_E2E=1`):
- ✅ Real PostgreSQL queries
- ✅ Pagination through seeded data
- ✅ Sort accuracy
- ✅ Filter count validation
- ✅ PageSize clamping (max 100)
- ✅ Edge cases (large page numbers)

**Example**:
```typescript
(shouldRun ? test : test.skip)('Orders API PG Pagination', async ({ request }) => {
  const res = await request.get('/api/admin/orders?page=1&pageSize=5');
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.items.length).toBeLessThanOrEqual(5);
});
```

---

## 📊 Data Flow Diagram

```
User Action
    │
    ▼
[Change Page Size to 20]
    │
    ▼
setPageSize(20)
setPage(1)  ← Reset to page 1
    │
    ▼
fetchOrders() triggered (useEffect dependency)
    │
    ▼
Build query string:
/api/admin/orders?page=1&pageSize=20&sort=-createdAt
    │
    ▼
API route parses params
    │
    ▼
getOrdersRepo(mode) → pgRepo
    │
    ▼
pgRepo.list({page:1, pageSize:20, sort:'-createdAt'})
    │
    ▼
Prisma query:
  findMany({ skip: 0, take: 20, orderBy: {createdAt: 'desc'} })
  count()
    │
    ▼
Return { items: Order[], count: number }
    │
    ▼
API returns JSON
    │
    ▼
setOrders(data.items)
setCount(data.count)
    │
    ▼
React re-renders table with 20 items
```

---

## 🔑 Key Design Principles

### 1. Provider Abstraction
**Benefit**: Switch data sources without UI changes
**Implementation**: Shared `OrdersRepo` interface

### 2. Type Safety
**Benefit**: Catch errors at compile time
**Implementation**: `SortArg`, `ListParams` types

### 3. Constrained Inputs
**Benefit**: Prevent abuse, ensure performance
**Implementation**: `clamp(pageSize, 5, 100)`

### 4. Separation of Concerns
**Benefit**: Each layer has single responsibility
**Layers**: UI → API → Provider → Database

### 5. Testability
**Benefit**: Comprehensive test coverage
**Strategy**: API tests + UI tests + PG-gated tests

---

**Generated**: 2025-10-23
**Pass**: AG79
**Status**: ✅ Complete
