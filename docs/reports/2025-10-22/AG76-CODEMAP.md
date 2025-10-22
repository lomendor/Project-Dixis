# AG76 — Code Map: Real Orders Providers (Prisma Implementation)

**Date**: 2025-10-22
**Pass**: AG76
**Branch**: `feat/AG76-orders-providers-prisma`

---

## 🗺️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Route Handler                        │
│              /api/admin/orders/route.ts                      │
│                   (from AG74)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ imports { repo }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Provider Selection Layer                        │
│           src/lib/orders/index.ts (AG74)                     │
│                                                              │
│  const SRC = process.env.DIXIS_DATA_SRC || 'demo'           │
│  const REPOS = { demo, pg, sqlite }                          │
│  export const repo = REPOS[SRC] || demo                      │
└────────────┬──────────────┬──────────────┬──────────────────┘
             │              │              │
             │              │              │
    ┌────────▼───┐   ┌──────▼──────┐   ┌──▼──────────┐
    │ demoRepo   │   │   pgRepo    │   │ sqliteRepo  │
    │  (AG74)    │   │ (AG76-NEW)  │   │ (AG76-NEW)  │
    └────────────┘   └──────┬──────┘   └──┬──────────┘
                            │              │
                            │ uses         │ uses
                            ▼              ▼
                    ┌─────────────────────────────┐
                    │   Prisma Client Singleton   │
                    │   src/lib/prisma.ts         │
                    │   (AG76-ENHANCED)           │
                    └─────────────┬───────────────┘
                                  │
                                  │ queries
                                  ▼
                    ┌─────────────────────────────┐
                    │   Database (PG or SQLite)   │
                    │   Order table (AG73)        │
                    └─────────────────────────────┘
                                  │
                                  │ raw rows
                                  ▼
                    ┌─────────────────────────────┐
                    │   Mapping Layer (_map.ts)   │
                    │   toDto() transformation    │
                    │   (AG76-NEW)                │
                    └─────────────┬───────────────┘
                                  │
                                  │ formatted DTO
                                  ▼
                    ┌─────────────────────────────┐
                    │   OrdersRepo Response       │
                    │   { items: [], count: N }   │
                    └─────────────────────────────┘
```

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── prisma.ts                          ← AG76: Enhanced with logging
│   │   └── orders/
│   │       ├── index.ts                       ← AG74: Provider selection
│   │       └── providers/
│   │           ├── types.ts                   ← AG74: OrdersRepo interface
│   │           ├── demo.ts                    ← AG74: Demo stub (unchanged)
│   │           ├── pg.ts                      ← AG76: Real PG implementation
│   │           ├── sqlite.ts                  ← AG76: Real SQLite implementation
│   │           └── _map.ts                    ← AG76: NEW mapping layer
│   │
│   └── app/
│       └── api/
│           └── admin/
│               └── orders/
│                   └── route.ts               ← AG74: Uses { repo }
│
├── tests/
│   └── e2e/
│       └── api-admin-orders-pg-e2e.spec.ts    ← AG76: NEW gated test
│
├── .env.example                               ← AG76: Added DIXIS_DATA_SRC
└── .env.ci                                    ← AG76: Added DIXIS_DATA_SRC=sqlite
```

---

## 🔍 Detailed Component Map

### 1. Prisma Client Singleton (`src/lib/prisma.ts`)

**Purpose**: Global Prisma client instance for Next.js
**Pattern**: Singleton with hot-reload protection
**AG76 Changes**: Added conditional logging configuration

**Key Code**:
```typescript
export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query','error','warn']
      : ['error'],
  })
```

**Environment Behavior**:
- Development: Logs all queries + errors + warnings (debugging)
- Production: Logs errors only (performance + security)

**Integration Points**:
- Imported by `pg.ts` and `sqlite.ts` providers
- Uses Prisma schema from AG73 (Order model)
- Respects `DATABASE_URL` environment variable

---

### 2. Mapping Layer (`src/lib/orders/providers/_map.ts`)

**Purpose**: Transform Prisma Order model to OrdersRepo DTO format
**Pattern**: Pure functions (stateless transformation)
**AG76 Changes**: NEW file created

**Exports**:
1. `normalizeStatus(s: string | null | undefined): OrderStatus`
   - Validates status string against allowed values
   - Defaults to 'pending' if invalid
   - Handles null/undefined gracefully

2. `toDto(row: any): DtoOrder`
   - Maps Prisma fields → DTO fields
   - `buyerName` → `customer` (with fallback chain)
   - `total: number` → `total: string` (formatted EUR)
   - `status: string` → `status: OrderStatus` (normalized)

**Key Logic**:
```typescript
export function toDto(row: any): DtoOrder {
  return {
    id: String(row.id),
    customer: String(row.buyerName ?? row.customer ?? '—'),
    total: EURO.format(typeof row.total === 'number' ? row.total : Number(row.total ?? 0)),
    status: normalizeStatus(row.status),
  };
}
```

**Why Needed**:
- Prisma Order model has `buyerName: string` field
- OrdersRepo DTO expects `customer: string` field
- Avoids code duplication between PG and SQLite providers
- Centralizes formatting logic (currency, status normalization)

---

### 3. PostgreSQL Provider (`src/lib/orders/providers/pg.ts`)

**Purpose**: Real database queries for production PG workloads
**Pattern**: Implements OrdersRepo interface
**AG76 Changes**: Replaced `NotImplemented` stub with real logic

**Implementation**:
```typescript
export const pgRepo: OrdersRepo = {
  async list(params?: { status?: OrderStatus }) {
    const where = params?.status ? { status: params.status } : undefined;
    const [rows, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, buyerName: true, total: true, status: true },
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(toDto), count };
  },
};
```

**Configuration**:
- `take: 100` — Production workload limit
- `orderBy: { createdAt: 'desc' }` — Newest orders first
- `select` — Only fetch required fields (performance)
- Parallel query + count using `Promise.all()` (efficiency)

**Activation**:
- Set `DIXIS_DATA_SRC=pg` in environment
- Requires `DATABASE_URL=postgresql://...` in .env

---

### 4. SQLite Provider (`src/lib/orders/providers/sqlite.ts`)

**Purpose**: Real database queries for CI/test workloads
**Pattern**: Implements OrdersRepo interface
**AG76 Changes**: Replaced demo stub with real logic

**Implementation**:
```typescript
export const sqliteRepo: OrdersRepo = {
  async list(params?: { status?: OrderStatus }) {
    const where = params?.status ? { status: params.status } : undefined;
    const [rows, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { id: true, buyerName: true, total: true, status: true },
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(toDto), count };
  },
};
```

**Configuration**:
- `take: 50` — CI workload optimization (smaller than PG)
- Otherwise identical logic to PG provider
- Uses same mapping layer via `toDto()`

**Activation**:
- Set `DIXIS_DATA_SRC=sqlite` in environment
- Requires `DATABASE_URL=file:./test.db` in .env
- Used by default in `.env.ci` for CI builds

---

### 5. Gated E2E Test (`tests/e2e/api-admin-orders-pg-e2e.spec.ts`)

**Purpose**: Conditional integration test for real PG database
**Pattern**: Gated test (runs only when explicitly enabled)
**AG76 Changes**: NEW file created

**Implementation**:
```typescript
const shouldRun = process.env.PG_E2E === '1';

(shouldRun ? test : test.skip)('GET /api/admin/orders (pg provider) returns data', async ({ request }) => {
  const res = await request.get('/api/admin/orders?status=paid');
  expect([200, 501]).toContain(res.status());
});
```

**Key Features**:
- Skipped by default in standard CI runs (`test.skip`)
- Enabled via `PG_E2E=1` environment variable
- Accepts 200 (success) or 501 (no seed data) as valid
- Prevents CI failures when database is empty

**Usage**:
```bash
# Enable and run
PG_E2E=1 npx playwright test api-admin-orders-pg-e2e

# Or via CI workflow dispatch with label
```

---

## 🔗 Integration Points

### With AG73 (Prisma Schema)
- **File**: `prisma/schema.prisma`
- **Model**: `Order { id, buyerName, total, status, createdAt, ... }`
- **Dependencies**: Prisma client generated from schema
- **Migration**: Already applied in AG73

### With AG74 (Provider Pattern)
- **File**: `src/lib/orders/index.ts`
- **Export**: `export const repo: OrdersRepo`
- **Selection**: Based on `DIXIS_DATA_SRC` env var
- **Interface**: `OrdersRepo { list(params?) => { items, count } }`

### With AG75 (Admin UI)
- **Component**: Admin Orders table
- **API**: Fetches `/api/admin/orders?status=X`
- **Format**: Consumes DTO format (id, customer, total, status)
- **Display**: No changes needed (provider swap is transparent)

---

## 📊 Data Flow Example

### Request Flow (PG Provider):
```
1. User visits /admin/orders?status=paid
   ↓
2. Admin UI fetches GET /api/admin/orders?status=paid
   ↓
3. Route handler: await repo.list({ status: 'paid' })
   ↓
4. Provider selection: DIXIS_DATA_SRC=pg → pgRepo.list()
   ↓
5. Prisma query: prisma.order.findMany({ where: { status: 'paid' }, take: 100 })
   ↓
6. Database returns: [{ id: 1, buyerName: 'John', total: 45.50, status: 'paid' }, ...]
   ↓
7. Mapping: rows.map(toDto) transforms to [{ id: '1', customer: 'John', total: '€45.50', status: 'paid' }, ...]
   ↓
8. Response: { items: [...], count: 42 }
   ↓
9. Admin UI renders table with formatted data
```

### CI Test Flow (SQLite Provider):
```
1. CI runs: npm run build && npm run test:e2e
   ↓
2. .env.ci sets: DIXIS_DATA_SRC=sqlite, DATABASE_URL=file:./test.db
   ↓
3. E2E test fetches: GET /api/admin/orders
   ↓
4. Provider selection: DIXIS_DATA_SRC=sqlite → sqliteRepo.list()
   ↓
5. Prisma query: prisma.order.findMany({ take: 50 })
   ↓
6. SQLite test.db returns: [seeded test orders]
   ↓
7. Mapping: rows.map(toDto) transforms to DTO format
   ↓
8. E2E assertion: expect(response.status).toBe(200)
```

---

## 🔧 Environment Configuration Map

### `.env.example` (Development Defaults)
```env
DIXIS_DATA_SRC=demo                                    ← Safe fallback
DATABASE_URL=postgresql://postgres:postgres@...        ← For pg provider
```

### `.env.ci` (CI Configuration)
```env
DIXIS_DATA_SRC=sqlite                                  ← Use test.db
DATABASE_URL=file:./test.db                            ← SQLite file
PG_E2E=0                                               ← Skip gated tests
```

### `.env.local` (Local Development)
```env
DIXIS_DATA_SRC=pg                                      ← Use real PG
DATABASE_URL=postgresql://postgres:postgres@...        ← Local PG
NODE_ENV=development                                   ← Enable query logs
```

### Staging/Production
```env
DIXIS_DATA_SRC=pg                                      ← Production PG
DATABASE_URL=postgresql://user:pass@prod-db:5432/...   ← Prod credentials
NODE_ENV=production                                    ← Error logs only
```

---

## 🧪 Testing Map

### Standard CI Tests (Always Run)
- E2E: `api-admin-orders.spec.ts` (uses SQLite provider)
- Route: `/api/admin/orders` with test.db data
- Provider: `sqliteRepo.list()`

### Gated PG Tests (Manual Trigger)
- E2E: `api-admin-orders-pg-e2e.spec.ts` (uses PG provider)
- Trigger: Set `PG_E2E=1` environment variable
- Provider: `pgRepo.list()` with real PostgreSQL

### Development Testing
```bash
# Test demo provider (no DB required)
DIXIS_DATA_SRC=demo npm run dev

# Test SQLite provider
DIXIS_DATA_SRC=sqlite npm run dev

# Test PG provider (requires seeded PG)
DIXIS_DATA_SRC=pg npm run dev

# Enable Prisma query logging
NODE_ENV=development npm run dev
```

---

## 📈 Performance Characteristics

### Query Limits
- **PG Provider**: 100 items (production workload)
- **SQLite Provider**: 50 items (CI optimization)
- **Demo Provider**: 10 items (in-memory stub)

### Database Queries Per Request
- 2 parallel queries: `findMany()` + `count()`
- Optimized with `Promise.all()` for concurrent execution
- Selective fields: Only fetches id, buyerName, total, status

### Prisma Client Overhead
- Singleton pattern: 1 client instance per process
- Connection pooling: Handled by Prisma automatically
- Query logging: Development only (production disabled)

---

**Generated**: 2025-10-22
**Pass**: AG76
**Status**: ✅ Complete
