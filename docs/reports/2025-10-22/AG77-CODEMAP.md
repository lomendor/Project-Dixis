# AG77 — CODEMAP: Seeds for Orders

**Date**: 2025-10-22
**Pass**: AG77
**Branch**: `feat/AG77-orders-seeds`

---

## 📁 File Structure

```
frontend/
├── prisma/
│   ├── seed.dev.cjs           ← AG77: NEW — Development seed (Greek test data)
│   └── seed.ci.cjs            ← AG77: NEW — CI seed (minimal test data)
│
├── package.json               ← AG77: MODIFIED — Added seed scripts
│
└── (existing files from AG73-AG76)
    ├── prisma/schema.prisma   ← AG73: Order model definition
    ├── src/lib/prisma.ts      ← AG76: Prisma client singleton
    └── src/lib/orders/
        └── providers/
            ├── pg.ts          ← AG76: PostgreSQL provider
            └── sqlite.ts      ← AG76: SQLite provider
```

---

## 🗺️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Package.json Scripts                        │
│                                                          │
│  npm run db:seed:dev  →  node prisma/seed.dev.cjs       │
│  npm run db:seed:ci   →  node prisma/seed.ci.cjs        │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ executes
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Seed Scripts (.cjs)                         │
│                                                          │
│  const { PrismaClient } = require('@prisma/client')     │
│  const prisma = new PrismaClient()                      │
│                                                          │
│  await prisma.order.deleteMany({})                      │
│  await prisma.order.createMany({ data: rows })          │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Prisma Client                               │
│              (src/lib/prisma.ts)                         │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ connects to
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Database (PG or SQLite)                     │
│              Order table                                 │
│                                                          │
│  Columns: id, buyerName, total, status, createdAt       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Component Map

### 1. Dev Seed Script (`prisma/seed.dev.cjs`)

**Purpose**: Populate development database with realistic test data

**File Type**: CommonJS module (`.cjs`)
**Why CJS**: Compatible with Node.js without ESM configuration

**Code Structure**:
```javascript
const { PrismaClient } = require('@prisma/client');  // Import Prisma
const prisma = new PrismaClient();                   // Create client instance

async function main() {
  const now = Date.now();                            // Current timestamp

  // Define test data (6 orders)
  const rows = [
    { id, buyerName, total, status, createdAt },
    // ... 5 more orders
  ];

  await prisma.order.deleteMany({});                 // Clear existing data
  await prisma.order.createMany({ data: rows });     // Insert new data
  console.log(`Seed(dev): inserted ${rows.length} orders`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })  // Exit 1 on error (strict)
  .finally(() => prisma.$disconnect());                 // Always disconnect
```

**Test Data Characteristics**:
- **IDs**: Sequential with prefix (`A-3001` to `A-3006`)
- **Names**: Greek UTF-8 characters (Μαρία, Γιάννης, Ελένη, etc.)
- **Totals**: Realistic euro amounts (€12.00 to €99.90)
- **Statuses**: All 5 status types covered (pending, paid, shipped, refunded, cancelled)
- **Dates**: Spread over last 5 days (relative to execution time)

**Status Distribution**:
```
pending   → 2 orders (A-3001, A-3006)
paid      → 1 order  (A-3002)
refunded  → 1 order  (A-3003)
cancelled → 1 order  (A-3004)
shipped   → 1 order  (A-3005)
```

**Date Distribution**:
```
now - 5 days → A-3001 (oldest)
now - 4 days → A-3002
now - 3 days → A-3003
now - 2 days → A-3004
now - 1 day  → A-3005
now          → A-3006 (newest)
```

**Error Handling**:
- Catches all errors and logs to console
- Exits with code 1 on failure (strict mode for dev)
- Always disconnects Prisma client (cleanup)

---

### 2. CI Seed Script (`prisma/seed.ci.cjs`)

**Purpose**: Minimal test data for CI/E2E environments

**Code Structure**:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = [
    { id:'T-1001', buyerName:'CI User', total: 10.00, status:'paid',    createdAt:new Date() },
    { id:'T-1002', buyerName:'CI User', total: 20.00, status:'pending', createdAt:new Date() },
    { id:'T-1003', buyerName:'CI User', total: 30.00, status:'shipped', createdAt:new Date() },
  ];

  await prisma.order.deleteMany({});
  await prisma.order.createMany({ data: rows });
  console.log(`Seed(CI): inserted ${rows.length} orders`);
}

main()
  .catch(e => { console.error(e); process.exit(0); })  // Exit 0 on error (non-blocking)
  .finally(() => prisma.$disconnect());
```

**Test Data Characteristics**:
- **IDs**: Test prefix (`T-1001` to `T-1003`)
- **Names**: Generic "CI User" (no special characters)
- **Totals**: Round amounts (€10, €20, €30)
- **Statuses**: 3 essential statuses (paid, pending, shipped)
- **Dates**: Current timestamp (all same)

**Key Difference from Dev Seed**:
- **Error handling**: `process.exit(0)` instead of `process.exit(1)`
- **Reason**: CI should not fail if seed encounters issues (database might be missing)
- **Philosophy**: Seeds are helpers, not blockers

---

### 3. Package.json Scripts (`package.json`)

**Added Scripts**:
```json
{
  "scripts": {
    "db:seed:dev": "node prisma/seed.dev.cjs",
    "db:seed:ci": "node prisma/seed.ci.cjs",
    "db:push:ci": "prisma db push --schema=prisma/schema.ci.prisma",
    "db:migrate:deploy": "prisma migrate deploy"
  }
}
```

**Script Breakdown**:

#### `db:seed:dev`
- **Command**: `node prisma/seed.dev.cjs`
- **Purpose**: Run development seed script
- **Usage**: `npm run db:seed:dev`
- **Environment**: Local dev with PostgreSQL or SQLite
- **Data**: 6 Greek test orders

#### `db:seed:ci`
- **Command**: `node prisma/seed.ci.cjs`
- **Purpose**: Run CI seed script
- **Usage**: `npm run db:seed:ci`
- **Environment**: CI with SQLite test.db
- **Data**: 3 minimal test orders

#### `db:push:ci`
- **Command**: `prisma db push --schema=prisma/schema.ci.prisma`
- **Purpose**: Push CI schema to database (no migrations)
- **Usage**: `npm run db:push:ci`
- **Use case**: CI setup before E2E tests

#### `db:migrate:deploy`
- **Command**: `prisma migrate deploy`
- **Purpose**: Apply pending migrations (production-safe)
- **Usage**: `npm run db:migrate:deploy`
- **Use case**: Production deployment

**Prisma Seed Hook**:
```json
{
  "prisma": {
    "seed": "node prisma/seed.dev.cjs"
  }
}
```

**Automatic Triggers**:
- `prisma migrate reset` → runs seed.dev.cjs automatically
- `prisma db push --force-reset` → runs seed.dev.cjs automatically
- `prisma migrate dev` → offers to run seed.dev.cjs

---

## 🔗 Integration Points

### With AG73 (Prisma Schema)
**File**: `prisma/schema.prisma`
**Model**: `Order`

```prisma
model Order {
  id         String   @id
  buyerName  String
  total      Float
  status     String
  createdAt  DateTime @default(now())
  // ... other fields
}
```

**Integration**:
- Seed scripts use exact field names from schema
- Type safety: Prisma validates data types
- Constraints: id must be unique, fields non-nullable

### With AG76 (Real Providers)
**Files**: `src/lib/orders/providers/pg.ts`, `sqlite.ts`

**Integration Flow**:
```
1. Seed script runs → inserts Orders
2. Provider reads Orders via Prisma client
3. Mapping layer transforms to DTO
4. API returns formatted data to UI
```

**Provider Selection**:
- Seeds respect `DATABASE_URL` environment variable
- Same data works with both PG and SQLite providers
- No provider-specific logic needed in seeds

### With CI Workflow
**Typical CI Flow**:
```yaml
# .github/workflows/ci.yml (hypothetical)
- name: Setup database
  run: npm run db:push:ci
  working-directory: frontend

- name: Seed test data
  run: npm run db:seed:ci
  working-directory: frontend

- name: Run E2E tests
  run: npm run test:e2e:ci
  working-directory: frontend
```

**Expected Behavior**:
- CI database starts empty
- `db:push:ci` creates tables
- `db:seed:ci` populates 3 orders
- E2E tests can query Orders API
- Tests see consistent data every run

---

## 📊 Data Flow Examples

### Dev Seed Execution
```bash
# Command
npm run db:seed:dev

# Process
1. Node.js executes prisma/seed.dev.cjs
2. Prisma client connects to DATABASE_URL
3. deleteMany() clears existing orders
4. createMany() inserts 6 new orders
5. Console logs: "Seed(dev): inserted 6 orders"
6. Prisma disconnects

# Result
Database now contains:
- A-3001 (Μαρία, €42.00, pending)
- A-3002 (Γιάννης, €99.90, paid)
- A-3003 (Ελένη, €12.00, refunded)
- A-3004 (Νίκος, €59.00, cancelled)
- A-3005 (Άννα, €19.50, shipped)
- A-3006 (Κώστας, €31.70, pending)
```

### CI Seed Execution
```bash
# Command
npm run db:seed:ci

# Process
1. Node.js executes prisma/seed.ci.cjs
2. Prisma client connects to test.db (SQLite)
3. deleteMany() clears existing orders
4. createMany() inserts 3 new orders
5. Console logs: "Seed(CI): inserted 3 orders"
6. Prisma disconnects

# Result
test.db now contains:
- T-1001 (CI User, €10.00, paid)
- T-1002 (CI User, €20.00, pending)
- T-1003 (CI User, €30.00, shipped)
```

### Admin UI Query After Seeding
```bash
# User visits /admin/orders
# UI fetches GET /api/admin/orders

# Flow
1. Route handler: await repo.list()
2. Provider (pg/sqlite): prisma.order.findMany()
3. Database returns seeded orders
4. Mapping layer: toDto() formats data
5. UI receives: [{ id, customer, total, status }, ...]
6. Table renders with seeded data

# Result
Admin sees 6 orders (dev) or 3 orders (CI)
No empty state
Status filters work correctly
```

---

## 🧪 Testing Scenarios

### Scenario 1: Fresh Database
```bash
# Start with empty database
DATABASE_URL="postgresql://..." npm run db:seed:dev

# Expected
✓ deleteMany() succeeds (no rows to delete)
✓ createMany() inserts 6 orders
✓ Console: "Seed(dev): inserted 6 orders"
✓ Database: 6 orders present
```

### Scenario 2: Re-seeding
```bash
# Run seed twice
npm run db:seed:dev
npm run db:seed:dev

# Expected
✓ First run: inserts 6 orders
✓ Second run: deletes 6, inserts 6 (idempotent)
✓ Database: still 6 orders (same IDs)
```

### Scenario 3: CI with Missing Database
```bash
# CI environment without database
DATABASE_URL="file:./missing.db" npm run db:seed:ci

# Expected
✗ Prisma client connection fails
✓ Error logged to console
✓ Script exits with code 0 (non-blocking)
✓ CI continues to next step
```

### Scenario 4: E2E Test with Seeded Data
```typescript
// tests/e2e/admin-orders.spec.ts
test('Admin can view orders', async ({ page }) => {
  // Assumes db:seed:ci ran before tests
  await page.goto('/admin/orders');

  const rows = page.locator('[data-testid="order-row"]');
  await expect(rows).toHaveCount(3); // CI seed has 3 orders

  await expect(rows.first()).toContainText('T-1001');
  await expect(rows.first()).toContainText('CI User');
});
```

---

## 📈 Performance Characteristics

### Dev Seed Performance
- **Orders inserted**: 6
- **Queries executed**: 2 (deleteMany + createMany)
- **Expected duration**: <100ms (local PostgreSQL)
- **Network roundtrips**: 2

### CI Seed Performance
- **Orders inserted**: 3
- **Queries executed**: 2 (deleteMany + createMany)
- **Expected duration**: <50ms (SQLite file)
- **Network roundtrips**: 0 (local file)

### Bulk Insert Optimization
```javascript
// Efficient (used in seeds)
await prisma.order.createMany({ data: rows });  // 1 query

// Inefficient (not used)
for (const row of rows) {
  await prisma.order.create({ data: row });      // N queries
}
```

---

## 🔧 Maintenance Notes

### Adding More Seed Data
```javascript
// Edit prisma/seed.dev.cjs
const rows = [
  // ... existing 6 orders
  { id:'A-3007', buyerName:'Δημήτρης', total: 55.00, status:'paid', createdAt:new Date() },
  // Add more as needed
];
```

### Changing Status Distribution
```javascript
// Current: 2 pending, 1 paid, 1 shipped, 1 refunded, 1 cancelled
// Want: More paid orders for testing

const rows = [
  { id:'A-3001', buyerName:'Μαρία',   total: 42.00, status:'paid',    createdAt:new Date(now-5*864e5) },
  { id:'A-3002', buyerName:'Γιάννης', total: 99.90, status:'paid',    createdAt:new Date(now-4*864e5) },
  { id:'A-3003', buyerName:'Ελένη',   total: 12.00, status:'paid',    createdAt:new Date(now-3*864e5) },
  // ... adjust as needed
];
```

### Updating for New Schema Fields
```javascript
// If Order schema adds new field (e.g., email)
const rows = [
  {
    id:'A-3001',
    buyerName:'Μαρία',
    email:'maria@example.gr',  // New field
    total: 42.00,
    status:'pending',
    createdAt:new Date(now-5*864e5)
  },
  // ... update all rows
];
```

---

**Generated**: 2025-10-22
**Pass**: AG77
**Status**: ✅ Complete
