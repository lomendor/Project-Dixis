# AG78 — RISKS-NEXT: PG E2E Workflow

**Date**: 2025-10-22
**Pass**: AG78
**Branch**: `ops/AG78-pg-e2e-ci`

---

## ⚠️ Risk Assessment

### Overall Risk: 🟢 LOW
Label-gated workflow with no impact on default CI.

---

### 1. Workflow Trigger Confusion
**Severity**: 🟢 Low
**Likelihood**: 🟡 Medium
**Impact**: Developers expect workflow but it doesn't run

**Details**:
- Workflow only runs with `pg-e2e` label
- PR without label won't trigger workflow
- May confuse developers expecting automatic PG testing

**Mitigation**:
- ✅ Clear documentation in Pass-AG78.md
- ✅ Workflow name includes "(label-gated)"
- 🔮 Future: Add PR comment bot explaining label requirement

**Recommendation**:
```markdown
<!-- Add to PR template -->
**🐘 PostgreSQL Testing**: Add `pg-e2e` label to run PG E2E tests
```

**Action**: ✅ Accepted (document in contributing guide)

---

### 2. PostgreSQL Service Failures
**Severity**: 🟡 Medium
**Likelihood**: 🟢 Low
**Impact**: Workflow fails, blocks PR if labeled

**Details**:
- Docker service may fail to start
- Health checks may time out (100s limit)
- Port conflicts unlikely but possible

**Mitigation**:
- ✅ Health checks with retries (10 attempts)
- ✅ Standard PostgreSQL 15 image (stable)
- ✅ Workflow failure doesn't block PR merge (not required check)

**Recovery Actions**:
1. Remove `pg-e2e` label to unblock PR
2. Re-run workflow (GitHub UI)
3. Investigate Docker logs if persistent

**Action**: ✅ Accepted (transient failures are rare)

---

### 3. Migration Incompatibilities
**Severity**: 🟡 Medium
**Likelihood**: 🟡 Medium
**Impact**: Workflow fails on migration step

**Details**:
- New migrations may have PG-specific syntax
- Schema changes might conflict with existing data
- Rollback migrations not tested in CI

**Mitigation**:
- ✅ `prisma migrate deploy` is production-safe (no data loss)
- ✅ Seed script runs on fresh database (no conflicts)
- 🔮 Future: Add migration validation step

**Recommended Enhancement**:
```yaml
- name: Validate Prisma Schema
  run: pnpm prisma validate
```

**Action**: 🔍 Monitor (add validation in future pass if issues arise)

---

### 4. Seed Data Conflicts
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: Seed script fails, workflow blocked

**Details**:
- Seed IDs (A-3001 to A-3006) are hard-coded
- Multiple runs in quick succession may conflict
- Dev seed uses `deleteMany()` before insert (safe)

**Mitigation**:
- ✅ Seed script calls `deleteMany()` (idempotent)
- ✅ Fresh database per workflow run
- ✅ No shared state between runs

**Example Safe Seed**:
```javascript
await prisma.order.deleteMany({});  // Clear first
await prisma.order.createMany({ data: rows });  // Then insert
```

**Action**: ✅ Accepted (seed script already handles this)

---

### 5. Gated Test Not Executing
**Severity**: 🟡 Medium
**Likelihood**: 🟡 Medium
**Impact**: Workflow passes but test doesn't run

**Details**:
- Test only runs when `PG_E2E=1`
- If environment variable not set, test skips silently
- Workflow succeeds even if test skipped

**Mitigation**:
- ✅ Workflow explicitly sets `PG_E2E="1"` in env
- 🔮 Future: Add assertion to verify test ran

**Recommended Check**:
```yaml
- name: Verify test ran
  run: |
    if ! grep -q "1 passed" test-output.txt; then
      echo "Error: PG E2E test did not run"
      exit 1
    fi
```

**Action**: 🔍 Monitor (add verification if tests are skipped unexpectedly)

---

### 6. Increased CI Cost
**Severity**: 🟢 Low
**Likelihood**: 🟡 Medium
**Impact**: Higher GitHub Actions minutes usage

**Details**:
- Docker service + longer workflow = more compute time
- ~3-5 minutes per labeled PR
- If many PRs use label, costs increase

**Mitigation**:
- ✅ Opt-in via label (no automatic runs)
- ✅ Default CI remains fast (unchanged)
- ✅ GitHub Actions free tier: 2000 min/month

**Cost Estimate**:
```
Workflow duration: 4 minutes
Cost per run: ~0.008 GitHub Actions minutes
10 labeled PRs/month: ~40 minutes
Total monthly cost: <2% of free tier
```

**Action**: ✅ Accepted (cost is negligible)

---

### 7. Label Management Overhead
**Severity**: 🟢 Low
**Likelihood**: 🟡 Medium
**Impact**: Developers forget to add/remove labels

**Details**:
- Manual label management required
- Forgotten labels slow down CI on every commit
- Unnecessary labels waste resources

**Mitigation**:
- ✅ Clear usage guide in Pass-AG78.md
- 🔮 Future: Auto-remove label after merge
- 🔮 Future: Bot comment reminding to remove label

**Recommended Automation**:
```yaml
# .github/workflows/cleanup-labels.yml
on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Remove pg-e2e label
        if: contains(github.event.pull_request.labels.*.name, 'pg-e2e')
        run: gh pr edit ${{ github.event.number }} --remove-label pg-e2e
```

**Action**: 🔮 Future enhancement (not blocking)

---

### 8. PostgreSQL Version Drift
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: CI tests different PG version than production

**Details**:
- Workflow uses `postgres:15`
- Production might use different version (14, 16)
- SQL compatibility issues possible

**Mitigation**:
- ✅ PostgreSQL 15 is stable and widely used
- 🔮 Future: Match production PG version exactly
- 🔮 Future: Test against multiple PG versions

**Recommended Matrix Testing** (future):
```yaml
strategy:
  matrix:
    postgres-version: [14, 15, 16]

services:
  postgres:
    image: postgres:${{ matrix.postgres-version }}
```

**Action**: ✅ Accepted (version 15 is reasonable default)

---

## 🚀 Next Steps (Prioritized)

### 🎯 Immediate: AG79 — Pagination & Sorting
**Priority**: HIGH
**Effort**: 3-4 hours
**LOC**: ~200 lines

**Goal**: Add pagination, sorting, and filtering to OrdersRepo

**Tasks**:
- [ ] Extend `OrdersRepo.list()` signature:
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
- [ ] **Use AG78 workflow**: Add `pg-e2e` label to test PG pagination

**Why Important**:
- Essential for production scale (1000+ orders)
- AG78 workflow enables comprehensive PG pagination testing
- Validates limit/offset behavior with real database

**Integration with AG78**:
```bash
# Test pagination with PG in CI
gh pr create --label pg-e2e --title "feat: Add Orders pagination"

# Workflow will:
# 1. Seed 20+ orders
# 2. Test page=1&limit=10
# 3. Test page=2&limit=10
# 4. Verify total pages calculation
```

---

### 🔧 Short-Term: AG80 — Expand PG E2E Coverage
**Priority**: MEDIUM
**Effort**: 2-3 hours
**LOC**: ~150 lines

**Goal**: Add more gated tests for comprehensive PG validation

**Tasks**:
- [ ] Create `api-admin-orders-filters-pg-e2e.spec.ts`
- [ ] Test status filtering with PG
- [ ] Test sorting by different columns
- [ ] Test edge cases (empty results, large datasets)
- [ ] Add performance benchmarks (query duration)

**Example Test**:
```typescript
const shouldRun = process.env.PG_E2E === '1';

(shouldRun ? test : test.skip)('Filtering by status works', async ({ request }) => {
  const res = await request.get('/api/admin/orders?status=paid');
  expect(res.status()).toBe(200);

  const data = await res.json();
  expect(data.items.every(o => o.status === 'paid')).toBe(true);
});
```

**Why Important**: Increases confidence in PG-specific behavior.

---

### 📊 Medium-Term: AG81 — OrderItem Migration
**Priority**: MEDIUM (if needed)
**Effort**: 2-3 hours
**LOC**: ~100 lines (schema + migration)

**Goal**: Fix smoke test failures for non-ui-only PRs

**Context**:
- AG76 & AG77 had smoke test failures (relation "OrderItem" does not exist)
- AG58-fix1 resolved for ui-only PRs (SQLite)
- Full-feature PRs still use PG and may fail smoke tests

**Tasks**:
- [ ] Add OrderItem model to `prisma/schema.prisma`
- [ ] Generate migration: `npx prisma migrate dev --name add-order-item`
- [ ] Update seed scripts to include OrderItem data
- [ ] Test with AG78 workflow (PG E2E)
- [ ] Verify smoke tests pass on non-ui-only PRs

**Schema Example**:
```prisma
model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  productId  String
  quantity   Int
  titleSnap  String   // Product title snapshot
  priceSnap  Float    // Price at order time
  createdAt  DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id])

  @@index([orderId])
}

model Order {
  // ... existing fields
  items OrderItem[]  // Add relation
}
```

**Why Important**: Enables comprehensive smoke tests for all PRs (not just ui-only).

---

### 🔄 Medium-Term: AG82 — Matrix Testing (PG Versions)
**Priority**: LOW
**Effort**: 1-2 hours
**LOC**: ~30 lines (workflow changes)

**Goal**: Test against multiple PostgreSQL versions

**Tasks**:
- [ ] Add strategy matrix to pg-e2e.yml
- [ ] Test with PG 14, 15, 16
- [ ] Identify version-specific issues
- [ ] Document compatibility matrix

**Workflow Enhancement**:
```yaml
jobs:
  pg-e2e:
    if: contains(github.event.pull_request.labels.*.name, 'pg-e2e')
    strategy:
      matrix:
        postgres-version: [14, 15, 16]

    services:
      postgres:
        image: postgres:${{ matrix.postgres-version }}
```

**Why Important**: Ensures compatibility across PG versions used in different environments.

---

### 🤖 Long-Term: AG83 — Auto-Label Management
**Priority**: LOW
**Effort**: 1-2 hours
**LOC**: ~50 lines

**Goal**: Automate label addition/removal based on PR content

**Tasks**:
- [ ] Create workflow to auto-add `pg-e2e` label
- [ ] Detect Prisma schema changes in PR
- [ ] Detect migration files in PR
- [ ] Auto-remove label after merge
- [ ] Add bot comment explaining label

**Workflow Example**:
```yaml
name: Auto-label PG E2E

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-label:
    runs-on: ubuntu-latest
    steps:
      - name: Check for schema changes
        id: check
        run: |
          if git diff --name-only origin/main... | grep -q "schema.prisma"; then
            echo "has_schema_changes=true" >> $GITHUB_OUTPUT
          fi

      - name: Add pg-e2e label
        if: steps.check.outputs.has_schema_changes == 'true'
        run: gh pr edit ${{ github.event.number }} --add-label pg-e2e
```

**Why Important**: Reduces manual overhead, ensures PG tests run when needed.

---

### 📈 Long-Term: AG84 — Performance Benchmarks
**Priority**: LOW
**Effort**: 3-4 hours
**LOC**: ~200 lines

**Goal**: Measure and track query performance over time

**Tasks**:
- [ ] Add performance assertions to gated tests
- [ ] Measure query execution times
- [ ] Compare PG vs SQLite performance
- [ ] Track performance trends over PRs
- [ ] Alert on performance regressions

**Example Test**:
```typescript
test('Query performance is acceptable', async ({ request }) => {
  const start = Date.now();
  await request.get('/api/admin/orders?limit=100');
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(500);  // <500ms for 100 orders
});
```

**Why Important**: Prevents performance degradation as codebase grows.

---

## 📋 Technical Debt

### 1. Add Schema Validation Step
**Priority**: MEDIUM
**Effort**: 15 minutes

**Task**: Add `prisma validate` before migrations

**Workflow Addition**:
```yaml
- name: Validate Prisma Schema
  working-directory: frontend
  run: pnpm prisma validate
```

**Why**: Catches schema syntax errors early.

---

### 2. Add Test Execution Verification
**Priority**: LOW
**Effort**: 30 minutes

**Task**: Verify gated test actually ran (not skipped)

**Workflow Addition**:
```yaml
- name: E2E (PG gated)
  run: |
    pnpm exec playwright test tests/e2e/api-admin-orders-pg-e2e.spec.ts --reporter=line | tee output.txt
    if ! grep -q "1 passed" output.txt; then
      echo "Error: Test did not run"
      exit 1
    fi
```

**Why**: Prevents silent test skipping.

---

### 3. Document Label Usage in Contributing Guide
**Priority**: HIGH
**Effort**: 15 minutes

**Task**: Add section to `CONTRIBUTING.md`

**Content**:
```markdown
## PostgreSQL E2E Testing

To run comprehensive PostgreSQL E2E tests in CI, add the `pg-e2e` label to your PR.

**When to use**:
- Database schema changes
- New Prisma queries
- Migration updates
- Provider implementations

**When NOT to use**:
- UI-only changes
- Documentation updates
- Config changes

The workflow adds ~3-5 minutes to CI but provides comprehensive DB validation.
```

**Why**: Helps developers understand when to use the label.

---

## 🏆 Success Metrics

### Current State (Post-AG78)
- ✅ Label-gated PG E2E workflow created
- ✅ PostgreSQL 15 service container configured
- ✅ Migrations + seeds integrated
- ✅ Gated test execution wired up
- ✅ Documentation complete

### Target State (Post-AG84)
- 🎯 Pagination tested with PG in CI
- 🎯 Multiple gated tests covering all endpoints
- 🎯 Performance benchmarks tracked
- 🎯 Auto-labeling based on PR content
- 🎯 Multi-version PG testing (14, 15, 16)
- 🎯 OrderItem migration complete (no smoke failures)

---

**Generated**: 2025-10-22
**Pass**: AG78
**Status**: ✅ Ready for review
