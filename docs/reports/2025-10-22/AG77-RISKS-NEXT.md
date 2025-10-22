# AG77 — RISKS-NEXT: Seeds for Orders

**Date**: 2025-10-22
**Pass**: AG77
**Branch**: `feat/AG77-orders-seeds`

---

## ⚠️ Risk Assessment

### Overall Risk: 🟢 LOW
Seeds are isolated scripts with no schema changes or production impact.

---

### 1. Seed Script Execution Failures
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: Dev/CI setup inconvenience

**Details**:
- Seed scripts might fail if database is unavailable
- Network issues could prevent connection to PostgreSQL
- File permissions might block SQLite file creation

**Mitigation**:
- ✅ CI seed exits with code 0 on error (non-blocking)
- ✅ Dev seed logs errors clearly for debugging
- ✅ Scripts are idempotent (safe to re-run)

**Action**: ✅ Accepted (existing error handling sufficient)

---

### 2. Unicode Character Support
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: Greek names might not display correctly

**Details**:
- Dev seed uses Greek UTF-8 characters (Μαρία, Γιάννης, etc.)
- Database collation might not support Greek alphabet
- Character encoding issues in terminal/logs

**Mitigation**:
- ✅ PostgreSQL UTF-8 encoding by default
- ✅ SQLite supports UTF-8 natively
- ✅ Prisma client handles encoding automatically

**Test Case**:
```bash
npm run db:seed:dev
npx prisma studio
# Verify Greek names display correctly
```

**Action**: ✅ Accepted (UTF-8 is standard)

---

### 3. Seed Data Conflicts with Existing Orders
**Severity**: 🟢 Low
**Likelihood**: 🟡 Medium
**Impact**: Existing development data lost

**Details**:
- Both seed scripts call `deleteMany()` before inserting
- Running seed will clear ALL existing orders
- Developers might lose manually created test data

**Mitigation**:
- ✅ Documented behavior (clear existing orders)
- ✅ IDs prefixed to avoid production ID conflicts (A-XXXX, T-XXXX)
- 🔮 Future: Add `--skip-delete` flag for appending data

**Recommendation**:
```javascript
// Future enhancement: optional skip delete
const skipDelete = process.env.SEED_SKIP_DELETE === '1';
if (!skipDelete) {
  await prisma.order.deleteMany({});
}
```

**Action**: ✅ Accepted (document in README)

---

### 4. CI Seed Non-Blocking Failures
**Severity**: 🟡 Medium
**Likelihood**: 🟡 Medium
**Impact**: E2E tests might fail due to missing seed data

**Details**:
- CI seed exits with code 0 on error (non-blocking)
- If seed fails silently, E2E tests will find empty database
- Tests expecting 3 orders will fail with "no orders found"

**Mitigation**:
- ✅ CI seed logs success message ("Seed(CI): inserted 3 orders")
- 🔮 Future: Add CI step to verify seed count
- 🔮 Future: E2E tests assert minimum order count

**Recommended CI Verification**:
```bash
# After seeding
npm run db:seed:ci

# Verify count
echo "SELECT COUNT(*) FROM Order;" | sqlite3 test.db | grep -q "3" || exit 1
```

**Action**: 🔍 Monitor (add verification in AG78 CI workflow)

---

### 5. Package.json Script Name Collisions
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: Script name conflicts with existing commands

**Details**:
- Existing `db:seed` script uses `tsx prisma/seed.ts`
- New `db:seed:dev` uses `node prisma/seed.dev.cjs`
- Potential confusion between seed scripts

**Mitigation**:
- ✅ Clear naming: `db:seed` (default), `db:seed:dev`, `db:seed:ci`
- ✅ Different file extensions: `.ts` vs `.cjs`
- 🔮 Future: Deprecate old `seed.ts` in favor of `seed.dev.cjs`

**Migration Path**:
```bash
# Old (if exists)
npm run db:seed  # → tsx prisma/seed.ts

# New (AG77)
npm run db:seed:dev  # → node prisma/seed.dev.cjs
npm run db:seed:ci   # → node prisma/seed.ci.cjs

# Recommended: Update db:seed to use seed.dev.cjs
```

**Action**: ✅ Accepted (coexistence is fine)

---

### 6. Prisma Client Version Mismatch
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: Seed scripts fail with Prisma errors

**Details**:
- Seed scripts require `@prisma/client` package
- If Prisma client not generated, seed fails with import error
- CI might not run `prisma generate` before seeding

**Mitigation**:
- ✅ Prisma client is a dependency in package.json
- 🔮 Future: Add pre-seed hook to run `prisma generate`

**Recommended CI Order**:
```bash
npm ci                    # Install dependencies
npm run db:push:ci        # Create tables
npx prisma generate       # Generate client
npm run db:seed:ci        # Run seed
```

**Action**: 🔍 Document in CI setup guide (AG78)

---

### 7. Date Generation in Seed Scripts
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: Test data becomes outdated over time

**Details**:
- Dev seed uses relative dates (`now - 5 days`)
- Over time, all orders will be in the past
- Might affect tests expecting recent orders

**Mitigation**:
- ✅ Relative dates ensure fresh data on each run
- ✅ Idempotent script allows easy re-seeding

**Best Practice**:
```bash
# Before testing, refresh seed data
npm run db:seed:dev
```

**Action**: ✅ Accepted (relative dates are intentional)

---

## 🚀 Next Steps (Prioritized)

### 🔥 Immediate: AG77.1 — Smoke Test Stabilization
**Priority**: HIGH
**Effort**: 1-2 hours
**LOC**: ~50 lines

**Problem**: Current smoke tests fail with `relation "OrderItem" does not exist`

**Root Cause**:
- Smoke tests use PostgreSQL with full migrations
- OrderItem migration is missing or incomplete
- AG77 only seeds Orders, not OrderItem

**Solution Options**:

#### Option 1: Smoke Tests → SQLite (Recommended)
**Approach**: Configure smoke tests to use SQLite instead of PostgreSQL

**Changes**:
```yaml
# .github/workflows/ci.yml
- name: Run Smoke Tests
  env:
    DATABASE_URL: file:./test.db
    DIXIS_DATA_SRC: sqlite
  run: |
    npm run db:push:ci
    npm run db:seed:ci
    npm run e2e:smoke
```

**Pros**:
- ✅ No migration dependencies
- ✅ Faster execution (local file)
- ✅ Isolates smoke tests from PG schema issues

**Cons**:
- ⚠️ Doesn't test PG-specific functionality
- ⚠️ Might miss PG migration issues

#### Option 2: Add OrderItem Migration
**Approach**: Create minimal OrderItem migration for smoke tests

**Changes**:
```prisma
// prisma/schema.prisma
model OrderItem {
  id       String @id
  orderId  String
  quantity Int
  // ... minimal fields
}
```

**Pros**:
- ✅ Tests full schema
- ✅ Closer to production setup

**Cons**:
- ⚠️ Requires schema change (out of scope for AG77)
- ⚠️ More complex migration management

#### Option 3: Skip Smoke Tests Temporarily
**Approach**: Disable smoke tests until OrderItem is implemented

**Changes**:
```yaml
# .github/workflows/ci.yml
- name: Run Smoke Tests
  if: false  # Temporarily disabled
```

**Pros**:
- ✅ Unblocks other work

**Cons**:
- ❌ Loses smoke test coverage
- ❌ Kicks can down the road

**Recommendation**: **Option 1** (Smoke tests → SQLite)

**Action**: Create AG77.1 PR with smoke test SQLite configuration

---

### 📊 AG78: Enable PG E2E Tests in CI
**Priority**: MEDIUM
**Effort**: 2-3 hours
**LOC**: ~80 lines (workflow changes)

**Goal**: Run gated `api-admin-orders-pg-e2e.spec.ts` test in CI with Docker PostgreSQL

**Tasks**:
- [ ] Add PostgreSQL service container to CI workflow
- [ ] Set `PG_E2E=1` environment variable
- [ ] Run `db:migrate:deploy` before tests
- [ ] Run `db:seed:dev` to populate test data
- [ ] Execute gated PG E2E test separately
- [ ] Report results in PR checks

**Example Workflow**:
```yaml
jobs:
  e2e-pg:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run db:migrate:deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@postgres:5432/test
      - run: npm run db:seed:dev
      - run: PG_E2E=1 npx playwright test api-admin-orders-pg-e2e
```

**Success Criteria**:
- CI job runs on every PR
- Test passes with seeded data (6 orders)
- PG-specific features tested (transactions, indexes)

**Why Important**: Validates real database integration in automated testing

---

### 🔄 AG79: Pagination & Filtering Enhancement
**Priority**: HIGH
**Effort**: 3-4 hours
**LOC**: ~200 lines

**Goal**: Extend OrdersRepo with pagination, sorting, and filtering

**Tasks**:
- [ ] Update `OrdersRepo.list()` signature:
  ```typescript
  list(params?: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
    sort?: 'createdAt:asc' | 'createdAt:desc' | 'total:asc' | 'total:desc';
  }): Promise<{ items: Order[]; count: number; page: number; totalPages: number }>
  ```
- [ ] Implement in all providers (demo, pg, sqlite)
- [ ] Update route handler to parse query params
- [ ] Add Admin UI pagination controls
- [ ] Update seed scripts with more data (20+ orders)
- [ ] Write E2E tests for pagination

**Seed Script Enhancement**:
```javascript
// prisma/seed.dev.cjs (enhanced for pagination)
const rows = Array.from({ length: 25 }, (_, i) => ({
  id: `A-${4000 + i}`,
  buyerName: greekNames[i % greekNames.length],
  total: Math.random() * 100,
  status: statuses[i % statuses.length],
  createdAt: new Date(now - i * 864e5),
}));
```

**Why Important**: Essential for production scale (1000+ orders)

---

### 📝 AG80: Seed Documentation & Best Practices
**Priority**: LOW
**Effort**: 1 hour
**LOC**: ~0 (docs only)

**Goal**: Document seed script usage and best practices

**Tasks**:
- [ ] Create `frontend/prisma/README.md` with seed guide
- [ ] Document when to use dev vs CI seeds
- [ ] Add troubleshooting section
- [ ] Include examples for common scenarios

**Content Outline**:
```markdown
# Prisma Seeds

## Quick Start
npm run db:seed:dev    # Development
npm run db:seed:ci     # CI/Testing

## What Gets Seeded
- Orders table (6 dev, 3 CI)
- Greek test names (dev only)
- Varied statuses and dates

## Troubleshooting
- "Prisma Client not generated" → run `npx prisma generate`
- Unicode display issues → check terminal encoding
- Seed fails → verify DATABASE_URL is set

## Customization
Edit `prisma/seed.dev.cjs` to add more orders...
```

**Why Important**: Onboarding new developers, self-service debugging

---

### 🧪 AG81: Seed Verification Tests
**Priority**: LOW
**Effort**: 2 hours
**LOC**: ~100 lines

**Goal**: Automated tests to verify seed data integrity

**Tasks**:
- [ ] Create `tests/seeds/verify-dev-seed.spec.ts`
- [ ] Assert order count (6 for dev)
- [ ] Verify status distribution
- [ ] Check date ranges
- [ ] Validate Greek character encoding

**Example Test**:
```typescript
test('dev seed creates 6 orders', async () => {
  await execSync('npm run db:seed:dev', { stdio: 'inherit' });

  const orders = await prisma.order.findMany();
  expect(orders).toHaveLength(6);

  const statuses = orders.map(o => o.status);
  expect(statuses).toContain('pending');
  expect(statuses).toContain('paid');
  expect(statuses).toContain('shipped');
});
```

**Why Important**: Catches seed script regressions early

---

### 🔮 AG82: Multi-Environment Seed Management
**Priority**: LOW
**Effort**: 3-4 hours
**LOC**: ~150 lines

**Goal**: Flexible seed system for dev/staging/test environments

**Approach**:
```javascript
// prisma/seed.js (unified entry point)
const env = process.env.SEED_ENV || 'dev';
const seedModule = require(`./seeds/${env}.cjs`);
seedModule.run();
```

**Directory Structure**:
```
prisma/
├── seed.js               ← Entry point
└── seeds/
    ├── dev.cjs          ← Development data
    ├── ci.cjs           ← CI minimal data
    ├── staging.cjs      ← Staging realistic data
    └── demo.cjs         ← Demo/preview data
```

**Usage**:
```bash
SEED_ENV=dev npm run db:seed        # Development
SEED_ENV=ci npm run db:seed         # CI
SEED_ENV=staging npm run db:seed    # Staging
```

**Why Important**: Better separation of concerns, easier maintenance

---

## 📋 Technical Debt

### 1. Deprecate Old seed.ts
**Priority**: LOW
**Effort**: 30 minutes

**Task**: Remove or rename existing `prisma/seed.ts` if present

**Reason**: Avoid confusion with new seed.dev.cjs

---

### 2. Add Seed Script Tests
**Priority**: MEDIUM
**Effort**: 1-2 hours

**Task**: Unit tests for seed logic (data generation, formatting)

**Example**:
```typescript
describe('seed data generation', () => {
  test('generates valid order IDs', () => {
    const ids = generateOrderIds(6);
    expect(ids).toHaveLength(6);
    expect(ids[0]).toMatch(/^A-\d+$/);
  });
});
```

---

### 3. Document CI Integration
**Priority**: HIGH
**Effort**: 30 minutes

**Task**: Add seed steps to CI documentation

**Location**: `docs/CI-SETUP.md` or similar

---

## 🏆 Success Metrics

### Current State (Post-AG77)
- ✅ Dev seed script created (6 orders)
- ✅ CI seed script created (3 orders)
- ✅ Package.json scripts added (4 new)
- ✅ Documentation complete (3 files)

### Target State (Post-AG82)
- 🎯 Smoke tests stable (SQLite-based)
- 🎯 PG E2E tests running in CI (Docker)
- 🎯 Pagination with 20+ seeded orders
- 🎯 Seed verification tests (100% pass)
- 🎯 Multi-environment seed system
- 🎯 Comprehensive seed documentation

---

**Generated**: 2025-10-22
**Pass**: AG77
**Status**: ✅ Ready for review
