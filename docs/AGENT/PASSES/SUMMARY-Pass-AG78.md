# Pass AG78 — Enable PG E2E in CI (label-gated)

**Date**: 2025-10-22
**Branch**: `ops/AG78-pg-e2e-ci`
**Status**: ✅ COMPLETED
**Risk**: LOW (opt-in workflow via label)

---

## 🎯 Objective

Add label-gated PostgreSQL E2E testing workflow to CI, enabling on-demand comprehensive database testing without impacting default CI speed.

## 📋 Acceptance Criteria

- [x] New workflow created: `.github/workflows/pg-e2e.yml`
- [x] Workflow triggers only when PR has `pg-e2e` label
- [x] PostgreSQL 15 service container configured
- [x] Prisma migrations run against PG
- [x] Dev seed data populated
- [x] Gated PG E2E test executes (`api-admin-orders-pg-e2e.spec.ts`)
- [x] Documentation generated

## 🔧 Implementation Details

### 1. Label-Gated Workflow (`.github/workflows/pg-e2e.yml`)

**Trigger**: Pull request events (opened, synchronize, reopened, labeled, unlabeled)

**Gate Condition**:
```yaml
if: contains(github.event.pull_request.labels.*.name, 'pg-e2e')
```

**Result**: Workflow only runs when PR has the `pg-e2e` label attached.

### 2. PostgreSQL Service Container

**Configuration**:
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

**Features**:
- PostgreSQL 15 (latest stable)
- Health checks ensure DB ready before tests
- Exposed on localhost:5432 for test access
- Ephemeral (destroyed after workflow)

### 3. Environment Configuration

**Key Variables**:
```yaml
env:
  NODE_ENV: test
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dixis_e2e?schema=public
  DIXIS_DATA_SRC: pg
  PG_E2E: "1"
```

**Purpose**:
- `DATABASE_URL`: Points to Docker PG container
- `DIXIS_DATA_SRC=pg`: Activates PG provider (from AG76)
- `PG_E2E=1`: Enables gated test execution (from AG76)

### 4. Workflow Steps

#### Step 1: Setup
```yaml
- Checkout code
- Setup Node.js 20
- Enable corepack & pnpm
- Install frontend dependencies
```

#### Step 2: Database Preparation
```yaml
- name: Prisma migrate (PG)
  run: pnpm prisma migrate deploy

- name: Seed
  run: pnpm run db:seed:dev
```

**Details**:
- `prisma migrate deploy`: Applies all pending migrations to PG
- `db:seed:dev`: Populates 6 Greek test orders (from AG77)

#### Step 3: Build & Test
```yaml
- name: Build
  run: pnpm build

- name: E2E (PG gated)
  run: pnpm exec playwright test tests/e2e/api-admin-orders-pg-e2e.spec.ts --reporter=line
```

**Gated Test** (`api-admin-orders-pg-e2e.spec.ts`):
- Created in AG76
- Only runs when `PG_E2E=1` is set
- Tests real PostgreSQL database operations
- Validates Orders API with PG provider

### 5. Integration Points

**With AG76 (Real Providers)**:
- Uses `pgRepo` provider (activated via `DIXIS_DATA_SRC=pg`)
- Tests real Prisma queries against PostgreSQL
- Validates provider implementation in CI

**With AG77 (Seeds)**:
- Uses `db:seed:dev` to populate test data
- 6 orders with Greek names and varied statuses
- Ensures realistic test scenario

**With AG73 (Prisma Schema)**:
- `prisma migrate deploy` applies schema to PG
- Tests full migration path in CI
- Validates schema compatibility

## 📊 Files Changed

### Created (1 file)
1. `.github/workflows/pg-e2e.yml` — Label-gated PG E2E workflow

### Documentation (3 files)
1. `docs/AGENT/PASSES/SUMMARY-Pass-AG78.md` — This file
2. `docs/reports/2025-10-22/AG78-CODEMAP.md` — Workflow architecture
3. `docs/reports/2025-10-22/AG78-RISKS-NEXT.md` — Risks & future work

**Total LOC**: ~65 lines (well under 300 limit)

## 🧪 Testing Strategy

### When Workflow Runs

**Automatic Triggers**:
- PR opened with `pg-e2e` label
- PR synchronized (new commits) with `pg-e2e` label
- `pg-e2e` label added to existing PR
- PR reopened with `pg-e2e` label

**Does NOT Run**:
- Default PR creation (no label)
- PRs without `pg-e2e` label
- Push to main/other branches

### Usage Examples

#### Scenario 1: Test New Database Feature
```bash
# Developer working on Orders pagination
gh pr create --label pg-e2e --title "feat: Add Orders pagination"

# Workflow automatically runs with PG testing
```

#### Scenario 2: Add Label to Existing PR
```bash
# PR already open, want to test with real PG
gh pr edit 123 --add-label pg-e2e

# Workflow triggers on label event
```

#### Scenario 3: Remove Label to Speed Up CI
```bash
# Feature tested, remove label for faster CI
gh pr edit 123 --remove-label pg-e2e

# Workflow won't run on subsequent commits
```

### Expected Results

**Success Criteria**:
- PostgreSQL container starts healthy
- Migrations apply successfully
- Seeds populate 6 orders
- Gated test passes (200 or 501 status acceptable)
- Workflow completes in ~3-5 minutes

**Failure Scenarios**:
- Migration incompatibility with PG 15
- Seed script errors (should exit 1 in dev mode)
- Test assertion failures
- Connection timeouts

## 🎯 Benefits

### 1. Opt-In Testing
- Default CI remains fast (no PG overhead)
- Developers choose when to run PG tests
- No mandatory PG testing for simple PRs

### 2. Real Database Validation
- Tests actual PostgreSQL behavior
- Validates migrations in CI
- Catches PG-specific issues early

### 3. Flexible Development Workflow
- Add/remove label as needed
- Test locally with SQLite, validate with PG in CI
- Iterative development without CI slowdown

### 4. Production Parity
- CI uses same DB as production (PostgreSQL)
- Validates schema compatibility
- Tests real provider implementation

## ⚠️ Risks & Mitigations

### Risk 1: Increased CI Duration
**Impact**: Medium (adds 3-5 minutes when label present)
**Mitigation**: ✅ Opt-in via label (default CI unchanged)

### Risk 2: Docker Service Failures
**Impact**: Low (workflow fails, but PR can still merge)
**Mitigation**: ✅ Health checks ensure PG ready before tests

### Risk 3: Migration Failures
**Impact**: Medium (blocks PR if labeled)
**Mitigation**: ✅ Remove label to unblock, fix migrations separately

### Risk 4: Flaky Network Connections
**Impact**: Low
**Mitigation**: ✅ Health checks with retries, localhost connection (fast)

## 📈 Success Metrics

- [x] Workflow created and committed
- [x] Label gate condition configured
- [x] PostgreSQL 15 service container defined
- [x] Prisma migrations integrated
- [x] Seed scripts wired up
- [x] Gated test execution configured
- [x] Documentation complete

## 🚀 Usage Guide

### For Developers

**When to use `pg-e2e` label**:
- ✅ Working on database schema changes
- ✅ Implementing new Prisma queries
- ✅ Testing provider implementations
- ✅ Validating migrations before production
- ✅ Debugging PostgreSQL-specific issues

**When NOT to use**:
- ❌ Simple UI-only changes
- ❌ Documentation updates
- ❌ Config file changes
- ❌ Minor refactors with no DB impact

### For Reviewers

**If PR has `pg-e2e` label**:
- ✅ Check PG E2E workflow status
- ✅ Verify migrations applied successfully
- ✅ Review gated test results
- ✅ Confirm seeds populated correctly

**If workflow fails**:
1. Check workflow logs in Actions tab
2. Identify failure point (migrate, seed, test)
3. Request fixes or suggest removing label
4. PR can merge without PG tests if acceptable

## 🔗 Related Passes

- **AG73**: Prisma schema setup (provides migrations)
- **AG74**: Orders provider pattern (defines interface)
- **AG76**: Real PG provider implementation (tested here)
- **AG77**: Seed scripts (populates test data)

## 🎯 Next Steps

### AG79: Pagination & Sorting
**Priority**: HIGH
**Goal**: Add pagination to OrdersRepo with UI controls

**Why important**: Production scale (1000+ orders)

**Will benefit from AG78**:
- Test pagination queries with real PG
- Validate limit/offset behavior
- Ensure sorting works correctly

### Future Enhancements

#### AG80: Expand PG E2E Coverage
- Add more gated tests for other entities
- Test complex queries (joins, aggregations)
- Validate transaction handling

#### AG81: Performance Benchmarks
- Measure query execution times
- Compare PG vs SQLite performance
- Identify optimization opportunities

#### AG82: Schema Validation Tests
- Automated schema drift detection
- Validate Prisma client generation
- Test migration rollbacks

---

**Generated**: 2025-10-22
**Author**: Claude Code (AG78 UltraThink)
**Status**: ✅ Ready for merge
