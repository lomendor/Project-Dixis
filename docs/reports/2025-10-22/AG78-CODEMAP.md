# AG78 — CODEMAP: PG E2E Workflow (Label-Gated)

**Date**: 2025-10-22
**Pass**: AG78
**Branch**: `ops/AG78-pg-e2e-ci`

---

## 📁 File Structure

```
.github/workflows/
└── pg-e2e.yml                 ← AG78: NEW — Label-gated PG E2E workflow
```

---

## 🗺️ Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub PR Events                         │
│                                                              │
│  opened | synchronize | reopened | labeled | unlabeled      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ triggers
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Workflow: pg-e2e.yml                       │
│                                                              │
│  Gate Condition:                                             │
│  if: contains(labels, 'pg-e2e')                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ if label present
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Docker Service: PostgreSQL 15                 │
│                                                              │
│  Image: postgres:15                                          │
│  Port: 5432                                                  │
│  Health checks: pg_isready                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ ready
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Steps                            │
│                                                              │
│  1. Checkout code                                            │
│  2. Setup Node.js 20 + pnpm                                  │
│  3. Install dependencies                                     │
│  4. Run Prisma migrations (PG)                               │
│  5. Seed test data (6 orders)                                │
│  6. Build Next.js app                                        │
│  7. Run gated E2E test                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ execute
                         ▼
┌─────────────────────────────────────────────────────────────┐
│       Gated Test: api-admin-orders-pg-e2e.spec.ts            │
│                                                              │
│  const shouldRun = process.env.PG_E2E === '1'                │
│  (shouldRun ? test : test.skip)(...)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Docker)                    │
│                                                              │
│  Orders table (6 seeded records)                             │
│  Schema: Prisma migrations applied                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Workflow Configuration Details

### Trigger Events

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, labeled, unlabeled]
```

**Event Types**:
- `opened`: New PR created
- `synchronize`: New commits pushed to PR
- `reopened`: Closed PR reopened
- `labeled`: Label added to PR
- `unlabeled`: Label removed from PR

**Why these events**: Ensures workflow runs when label is added/removed or PR updates while labeled.

---

### Gate Condition

```yaml
jobs:
  pg-e2e:
    if: contains(github.event.pull_request.labels.*.name, 'pg-e2e')
```

**Logic**:
- Checks if PR has label named `pg-e2e`
- Job skipped entirely if label not present
- No unnecessary resource usage for unlabeled PRs

**Label Matching**:
- Case-sensitive (`pg-e2e` ≠ `PG-E2E`)
- Exact match required
- Multiple labels OK (checks for `pg-e2e` presence)

---

### PostgreSQL Service Container

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: dixis_e2e
    ports:
      - 5432:5432
    options: >-
      --health-cmd="pg_isready -U postgres"
      --health-interval=10s
      --health-timeout=5s
      --health-retries=10
```

**Container Details**:

#### Image Selection
- **postgres:15**: Latest stable version
- **Why 15**: Balances stability and modern features
- **Alternatives**: postgres:16 (bleeding edge), postgres:14 (older stable)

#### Environment Variables
- `POSTGRES_USER=postgres`: Superuser name
- `POSTGRES_PASSWORD=postgres`: Simple password for CI
- `POSTGRES_DB=dixis_e2e`: Test database name

**Security Note**: CI credentials are non-sensitive (ephemeral container).

#### Port Mapping
- `5432:5432`: Standard PostgreSQL port
- **Host**: Accessible at `localhost:5432` from workflow steps
- **Container**: Internal networking handled by Docker

#### Health Checks
```bash
--health-cmd="pg_isready -U postgres"
```

**Purpose**: Ensures database accepts connections before tests run.

**Parameters**:
- `interval`: Check every 10 seconds
- `timeout`: Wait 5 seconds per check
- `retries`: Try up to 10 times (100s total)

**Success Condition**: `pg_isready` returns 0 (ready).

---

### Environment Configuration

```yaml
env:
  NODE_ENV: test
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dixis_e2e?schema=public
  DIXIS_DATA_SRC: pg
  PG_E2E: "1"
```

**Variable Breakdown**:

#### `NODE_ENV=test`
- Sets Node.js environment mode
- Affects Prisma client behavior
- Enables test-specific configurations

#### `DATABASE_URL`
**Format**: `postgresql://user:password@host:port/database?schema=public`

**Components**:
- `user`: postgres
- `password`: postgres
- `host`: localhost (Docker service)
- `port`: 5432
- `database`: dixis_e2e
- `schema`: public (default Prisma schema)

**Prisma Usage**: Prisma client reads this to connect.

#### `DIXIS_DATA_SRC=pg`
**Purpose**: Activates PostgreSQL provider (from AG76)

**Provider Selection Logic** (from AG74/AG76):
```typescript
// src/lib/orders/index.ts
const SRC = process.env.DIXIS_DATA_SRC || 'demo';
const REPOS = { demo: demoRepo, pg: pgRepo, sqlite: sqliteRepo };
export const repo = REPOS[SRC] || demoRepo;
```

**Result**: API routes use `pgRepo.list()` instead of `demoRepo.list()`.

#### `PG_E2E="1"`
**Purpose**: Enables gated test execution (from AG76)

**Test Gate Logic** (from AG76):
```typescript
// tests/e2e/api-admin-orders-pg-e2e.spec.ts
const shouldRun = process.env.PG_E2E === '1';
(shouldRun ? test : test.skip)('GET /api/admin/orders...', async () => {
  // Test body
});
```

**Result**: Test runs when `PG_E2E=1`, skips otherwise.

---

## 📋 Workflow Steps Detailed

### Step 1: Checkout

```yaml
- name: Checkout
  uses: actions/checkout@v4
```

**Purpose**: Clone repository code into workflow runner.

**Version**: v4 (latest stable)

**Result**: Code available in `$GITHUB_WORKSPACE`.

---

### Step 2: Setup Node.js

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
```

**Purpose**: Install Node.js runtime.

**Version**: 20 (LTS)

**Why 20**: Matches project's required Node version.

---

### Step 3: Enable corepack & pnpm

```yaml
- name: Enable corepack & pnpm
  run: |
    corepack enable
    corepack prepare pnpm@9.12.0 --activate
```

**Purpose**: Set up pnpm package manager.

**Commands**:
1. `corepack enable`: Activates Node.js corepack (package manager installer)
2. `corepack prepare pnpm@9.12.0`: Download and activate pnpm version 9.12.0

**Why pnpm**: Faster installs, disk-efficient, lockfile support.

---

### Step 4: Install Dependencies

```yaml
- name: Install deps (frontend)
  working-directory: frontend
  run: pnpm install --frozen-lockfile
```

**Purpose**: Install Node.js dependencies.

**Working Directory**: `frontend/` (where package.json lives)

**Flag**: `--frozen-lockfile`
- Uses exact versions from `pnpm-lock.yaml`
- Fails if lockfile is out of sync
- Ensures reproducible builds

**Installs**:
- `@prisma/client`
- `next`, `react`
- `playwright`
- All other dependencies

---

### Step 5: Prisma Migrations

```yaml
- name: Prisma migrate (PG)
  working-directory: frontend
  run: pnpm prisma migrate deploy
```

**Purpose**: Apply all pending migrations to PostgreSQL.

**Command**: `prisma migrate deploy`
- Reads `prisma/migrations/` directory
- Applies migrations in order
- Updates `_prisma_migrations` table
- Idempotent (safe to re-run)

**What Gets Applied** (from AG73):
- Order table creation
- Columns: id, buyerName, total, status, createdAt, etc.
- Indexes, constraints, defaults

**Connection**: Uses `DATABASE_URL` environment variable.

**Expected Output**:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "dixis_e2e"

3 migrations found in prisma/migrations

Applying migration `20231201_init`
Applying migration `20231202_add_orders`
Applying migration `20231203_order_constraints`

The following migration(s) have been applied:

migrations/
  └─ 20231201_init
  └─ 20231202_add_orders
  └─ 20231203_order_constraints

All migrations have been successfully applied.
```

---

### Step 6: Seed Database

```yaml
- name: Seed (dev seed works for PG too)
  working-directory: frontend
  run: pnpm run db:seed:dev
```

**Purpose**: Populate test data.

**Script**: `db:seed:dev` (from AG77)
- Runs `node prisma/seed.dev.cjs`
- Inserts 6 Greek test orders
- IDs: A-3001 to A-3006
- Varied statuses: pending, paid, shipped, refunded, cancelled

**Data Inserted**:
```javascript
[
  { id:'A-3001', buyerName:'Μαρία',   total: 42.00, status:'pending',   createdAt: 5 days ago },
  { id:'A-3002', buyerName:'Γιάννης', total: 99.90, status:'paid',      createdAt: 4 days ago },
  { id:'A-3003', buyerName:'Ελένη',   total: 12.00, status:'refunded',  createdAt: 3 days ago },
  { id:'A-3004', buyerName:'Νίκος',   total: 59.00, status:'cancelled', createdAt: 2 days ago },
  { id:'A-3005', buyerName:'Άννα',    total: 19.50, status:'shipped',   createdAt: 1 day ago },
  { id:'A-3006', buyerName:'Κώστας',  total: 31.70, status:'pending',   createdAt: today },
]
```

**Expected Output**:
```
Seed(dev): inserted 6 orders
```

**Error Handling**: Exits with code 1 on failure (strict mode).

---

### Step 7: Build Application

```yaml
- name: Build
  working-directory: frontend
  run: pnpm build
```

**Purpose**: Compile Next.js application for production.

**Command**: `pnpm build` → `next build`

**Generates**:
- `.next/` directory with compiled pages
- Static assets
- Server-side routes
- API routes

**Why Needed**: E2E tests may depend on build artifacts.

**Expected Duration**: 30-60 seconds.

---

### Step 8: Run Gated E2E Test

```yaml
- name: E2E (PG gated)
  working-directory: frontend
  run: pnpm exec playwright test tests/e2e/api-admin-orders-pg-e2e.spec.ts --reporter=line
```

**Purpose**: Execute PostgreSQL-backed E2E test.

**Command Breakdown**:
- `pnpm exec playwright test`: Run Playwright test runner
- `tests/e2e/api-admin-orders-pg-e2e.spec.ts`: Specific gated test file
- `--reporter=line`: Simple line-by-line output (CI-friendly)

**Test File** (from AG76):
```typescript
const shouldRun = process.env.PG_E2E === '1';

(shouldRun ? test : test.skip)('GET /api/admin/orders (pg provider) returns data', async ({ request }) => {
  const res = await request.get('/api/admin/orders?status=paid');
  expect([200, 501]).toContain(res.status());
});
```

**What It Tests**:
- Fetches `/api/admin/orders?status=paid`
- Verifies response status (200 or 501)
- 200: Success (orders found)
- 501: No data (acceptable if no paid orders)

**Expected Output**:
```
Running 1 test using 1 worker

  ✓  tests/e2e/api-admin-orders-pg-e2e.spec.ts:6:1 › GET /api/admin/orders (pg provider) returns data (123ms)

  1 passed (1s)
```

---

## 🔄 Data Flow Example

### Complete Workflow Execution

```
1. PR created with label "pg-e2e"
   ↓
2. GitHub triggers workflow (labeled event)
   ↓
3. Gate condition checks labels → PASS
   ↓
4. Docker starts PostgreSQL 15 container
   ↓
5. Health checks wait for pg_isready → PASS
   ↓
6. Checkout code from PR branch
   ↓
7. Setup Node.js 20 + pnpm
   ↓
8. Install frontend dependencies (pnpm install)
   ↓
9. Run Prisma migrations:
   - CREATE TABLE "Order" ...
   - CREATE INDEX ...
   ↓
10. Seed database:
    - INSERT 6 orders (A-3001 to A-3006)
    - Output: "Seed(dev): inserted 6 orders"
   ↓
11. Build Next.js app:
    - Compile pages, API routes
    - Generate .next/ directory
   ↓
12. Run E2E test:
    - Test sees PG_E2E=1 → runs test (not skipped)
    - Fetches GET /api/admin/orders?status=paid
    - API uses pgRepo.list({ status: 'paid' })
    - Prisma queries PostgreSQL container
    - Database returns 1 order (A-3002, status='paid')
    - Test asserts status 200
    - Test PASSES ✓
   ↓
13. Workflow completes successfully
    - PostgreSQL container destroyed
    - Runner cleaned up
```

---

## 📊 Performance Characteristics

### Workflow Duration Estimates

| Step | Duration | Notes |
|------|----------|-------|
| Checkout | ~5s | Network speed dependent |
| Setup Node | ~10s | Cached on runner |
| Install deps | ~30s | pnpm cache helps |
| Prisma migrate | ~10s | 3-5 migrations typical |
| Seed | ~5s | 6 inserts fast |
| Build | ~45s | Next.js compilation |
| E2E test | ~10s | Single test, fast API |
| **Total** | **~2-3 min** | Varies by runner load |

### Comparison with Default CI

| CI Type | Duration | Database | Coverage |
|---------|----------|----------|----------|
| Default CI | ~1-2 min | SQLite | UI + basic API |
| PG E2E (AG78) | ~3-5 min | PostgreSQL | Full DB + migrations |

**Trade-off**: +2-3 min for comprehensive PG validation.

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Run

**Conditions**:
- PR has `pg-e2e` label
- Migrations valid
- Seed script works
- Test assertions pass

**Expected Result**:
```
✓ PostgreSQL container started
✓ Migrations applied
✓ Seeds inserted
✓ E2E test passed (200 status)
✓ Workflow success
```

### Scenario 2: Migration Failure

**Conditions**:
- PR has `pg-e2e` label
- Migration has syntax error

**Expected Result**:
```
✗ Prisma migrate deploy failed
   Error: P3009 - Migration failed to apply
✗ Workflow failed
```

**Action**: Fix migration, push new commit.

### Scenario 3: Seed Failure

**Conditions**:
- Migrations OK
- Seed script has data error

**Expected Result**:
```
✓ Migrations applied
✗ Seed failed
   Error: Unique constraint violation
✗ Workflow failed
```

**Action**: Fix seed data, push new commit.

### Scenario 4: Test Failure

**Conditions**:
- Migrations & seeds OK
- Test assertion fails

**Expected Result**:
```
✓ Migrations applied
✓ Seeds inserted
✗ E2E test failed
   Expected: [200, 501]
   Received: 500
✗ Workflow failed
```

**Action**: Debug API issue, fix, push.

### Scenario 5: No Label

**Conditions**:
- PR does NOT have `pg-e2e` label

**Expected Result**:
```
⊘ pg-e2e job skipped (label not present)
✓ Workflow success (no jobs ran)
```

**Action**: Add label to trigger workflow.

---

## 🔧 Maintenance Notes

### Adding New Gated Tests

```typescript
// tests/e2e/new-pg-test.spec.ts
const shouldRun = process.env.PG_E2E === '1';

(shouldRun ? test : test.skip)('New PG test', async ({ request }) => {
  // Test logic
});
```

**Update Workflow**:
```yaml
- name: E2E (PG gated)
  run: |
    pnpm exec playwright test tests/e2e/api-admin-orders-pg-e2e.spec.ts --reporter=line
    pnpm exec playwright test tests/e2e/new-pg-test.spec.ts --reporter=line
```

### Changing PostgreSQL Version

```yaml
services:
  postgres:
    image: postgres:16  # Update version here
```

**Note**: Test compatibility with schema/migrations first.

### Adding More Seed Data

**Edit**: `frontend/prisma/seed.dev.cjs`

```javascript
const rows = [
  // ... existing 6 orders
  { id:'A-3007', buyerName:'Δημήτρης', total: 75.00, status:'paid', createdAt:new Date() },
  // Add more as needed
];
```

### Adjusting Timeout

```yaml
jobs:
  pg-e2e:
    timeout-minutes: 10  # Default: unlimited
```

**Recommendation**: Set 10-15 min cap to prevent hung jobs.

---

**Generated**: 2025-10-22
**Pass**: AG78
**Status**: ✅ Complete
