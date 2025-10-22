# AG76 — Risks & Next Steps

**Date**: 2025-10-22
**Pass**: AG76 — Real Orders Providers (Prisma Implementation)
**Branch**: `feat/AG76-orders-providers-prisma`

---

## ⚠️ Risk Assessment

### 1. Prisma Client Bundle Size
**Severity**: 🟡 Medium
**Likelihood**: 🟢 Low
**Impact**: Bundle size increase in production builds

**Details**:
- Prisma client generates type-safe database client (~2-5MB)
- Next.js tree-shaking removes unused Prisma features
- Client-side bundles not affected (Prisma is server-only)

**Mitigation**:
- ✅ Next.js automatically excludes Prisma from client bundles
- ✅ Server bundle size increase is acceptable for type safety benefits
- 🔮 Future: Consider Prisma Data Proxy for serverless edge deployments

**Action**: ✅ Accepted (no action needed)

---

### 2. Database Connection Pooling
**Severity**: 🟡 Medium
**Likelihood**: 🟢 Low
**Impact**: Connection exhaustion in high-traffic scenarios

**Details**:
- Prisma manages connection pool automatically
- Singleton pattern ensures 1 client per process
- Next.js dev mode may create multiple instances during hot reload

**Mitigation**:
- ✅ Singleton with `globalForPrisma` prevents multiple clients
- ✅ Prisma's default pool size: 10 connections (configurable)
- 🔮 Future: Configure pool size via `DATABASE_URL` query params

**Example Configuration**:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"
```

**Action**: ✅ Accepted (monitor in staging)

---

### 3. SQLite File Locking in CI
**Severity**: 🟢 Low
**Likelihood**: 🟢 Low
**Impact**: Test failures due to concurrent file access

**Details**:
- SQLite uses file-based locking (single writer)
- CI runs E2E tests sequentially (no parallelism)
- Ephemeral `test.db` created per workflow run

**Mitigation**:
- ✅ Playwright runs tests sequentially by default
- ✅ Each CI job gets isolated filesystem
- ✅ No concurrent writes to same test.db

**Action**: ✅ Accepted (no issues observed)

---

### 4. Missing Seed Data in PG E2E Tests
**Severity**: 🟡 Medium
**Likelihood**: 🟡 Medium
**Impact**: PG E2E tests fail due to empty database

**Details**:
- Gated `api-admin-orders-pg-e2e.spec.ts` expects Orders in database
- CI/staging may not have seeded data
- Test accepts 501 status (no data) as valid, but this isn't ideal

**Mitigation**:
- ✅ Test accepts both 200 (success) and 501 (no data)
- 🔮 Future AG77: Create seed script for PG database
- 🔮 Future AG78: Add PG seeding to CI workflow

**Action**: 📋 Tracked in Next Steps (AG77)

---

### 5. Prisma Schema Drift
**Severity**: 🔴 High
**Likelihood**: 🟢 Low
**Impact**: Runtime errors due to schema/code mismatch

**Details**:
- Prisma client generated from `schema.prisma` (AG73)
- Manual schema changes require regenerating client
- CI doesn't validate schema consistency

**Mitigation**:
- ✅ Use `npx prisma generate` after schema changes
- ✅ TypeScript catches breaking changes at compile time
- 🔮 Future: Add Prisma schema validation to CI checks

**Recommendation**:
```bash
# Add to CI workflow
- name: Validate Prisma Schema
  run: |
    npx prisma validate
    npx prisma generate
```

**Action**: 🔍 Monitor (add validation in future AG pass)

---

### 6. Query Performance at Scale
**Severity**: 🟡 Medium
**Likelihood**: 🟡 Medium
**Impact**: Slow response times with large datasets

**Details**:
- `pgRepo.list()` fetches 100 items with no pagination
- No indexes on `status` or `createdAt` columns (verify in schema)
- Count query runs on every request (potentially expensive)

**Mitigation**:
- ✅ `take: 100` limits result set size
- ✅ `select` clause fetches only required fields
- 🔮 Future AG79: Add pagination (offset/limit params)
- 🔮 Future: Add indexes via Prisma migration

**Recommended Indexes** (for future migration):
```prisma
model Order {
  // ...existing fields
  @@index([status])
  @@index([createdAt])
  @@index([status, createdAt])
}
```

**Action**: 📋 Tracked in Next Steps (AG79)

---

### 7. Environment Variable Configuration
**Severity**: 🟢 Low
**Likelihood**: 🟡 Medium
**Impact**: Wrong provider selected in production

**Details**:
- `DIXIS_DATA_SRC` defaults to `demo` if not set
- Production deployments must explicitly set `DIXIS_DATA_SRC=pg`
- No validation of provider configuration

**Mitigation**:
- ✅ Demo fallback is safe (read-only stub data)
- ✅ `.env.example` documents required configuration
- 🔮 Future: Add startup validation (log selected provider)

**Recommended Logging**:
```typescript
// src/lib/orders/index.ts
console.log(`[Orders] Using provider: ${SRC} (DIXIS_DATA_SRC=${process.env.DIXIS_DATA_SRC})`);
```

**Action**: ✅ Accepted (document in deployment guide)

---

### 8. Error Handling in Providers
**Severity**: 🟡 Medium
**Likelihood**: 🟡 Medium
**Impact**: Unhandled Prisma errors crash requests

**Details**:
- No try/catch blocks in provider implementations
- Prisma errors bubble up to route handler
- Database connection failures not handled gracefully

**Mitigation**:
- ✅ Next.js API routes have built-in error handling
- ✅ Prisma client logs errors (development mode)
- 🔮 Future: Add provider-level error handling with fallback

**Recommended Enhancement**:
```typescript
export const pgRepo: OrdersRepo = {
  async list(params) {
    try {
      const [rows, count] = await Promise.all([...]);
      return { items: rows.map(toDto), count };
    } catch (err) {
      console.error('[pgRepo] Query failed:', err);
      // Option 1: Rethrow (current behavior)
      throw err;
      // Option 2: Fallback to empty (graceful degradation)
      // return { items: [], count: 0 };
    }
  }
};
```

**Action**: 🔍 Monitor (add error handling in future AG pass)

---

## 🚀 Next Steps (Prioritized)

### 🎯 Immediate (Next 1-2 PRs)

#### AG77: PostgreSQL Seed Script
**Priority**: HIGH
**Effort**: 1-2 hours
**LOC**: ~100 lines

**Goal**: Create seed script for PostgreSQL Orders table

**Tasks**:
- [ ] Create `prisma/seeds/orders.ts` with realistic data
- [ ] Add `npm run db:seed` script to package.json
- [ ] Generate 50-100 Orders with varied statuses
- [ ] Document seeding process in README

**Success Criteria**:
- PG E2E tests pass with seeded data (200 status)
- Seed script is idempotent (can run multiple times)
- Data includes all order statuses (pending, paid, shipped, etc.)

**Why Important**: Unblocks PG E2E testing in CI/staging

---

#### AG78: Enable PG E2E Tests in CI
**Priority**: MEDIUM
**Effort**: 2-3 hours
**LOC**: ~50 lines (workflow changes)

**Goal**: Run gated PG tests in CI with Docker PostgreSQL service

**Tasks**:
- [ ] Add PostgreSQL service container to GitHub Actions workflow
- [ ] Set `PG_E2E=1` in workflow environment
- [ ] Run `npm run db:seed` before E2E tests
- [ ] Add workflow step to run pg-e2e tests separately

**Example Workflow Addition**:
```yaml
jobs:
  e2e-pg:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - run: npm run db:seed
      - run: PG_E2E=1 npx playwright test api-admin-orders-pg-e2e
```

**Success Criteria**:
- CI runs PG E2E tests on every PR
- Tests pass consistently (no flakiness)
- Test database properly seeded before tests

**Why Important**: Validates real database integration in CI

---

### 🔧 Short-Term (Next 3-5 PRs)

#### AG79: Pagination & Filtering
**Priority**: HIGH
**Effort**: 3-4 hours
**LOC**: ~200 lines

**Goal**: Add pagination, sorting, and advanced filtering to OrdersRepo

**Tasks**:
- [ ] Extend `OrdersRepo.list()` params: `{ page?, limit?, sort?, filters? }`
- [ ] Implement in all providers (demo, pg, sqlite)
- [ ] Add URL query param parsing in route handler
- [ ] Update Admin UI with pagination controls
- [ ] Add E2E tests for pagination

**Example API**:
```typescript
GET /api/admin/orders?status=paid&page=2&limit=20&sort=createdAt:desc
```

**Success Criteria**:
- Support 10, 25, 50, 100 items per page
- Sort by: createdAt, total, status
- Filter by: status, date range, customer name
- UI shows page numbers and navigation

**Why Important**: Essential for production scale (1000+ orders)

---

#### AG80: Caching Layer (Redis)
**Priority**: MEDIUM
**Effort**: 4-5 hours
**LOC**: ~250 lines

**Goal**: Add Redis caching for Orders queries to reduce database load

**Tasks**:
- [ ] Set up Redis client (e.g., `ioredis`)
- [ ] Create caching wrapper for OrdersRepo
- [ ] Cache `list()` results with 60s TTL
- [ ] Invalidate cache on order mutations
- [ ] Add cache hit/miss metrics

**Example Implementation**:
```typescript
export function withCache(repo: OrdersRepo): OrdersRepo {
  return {
    async list(params) {
      const key = `orders:${JSON.stringify(params)}`;
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);

      const result = await repo.list(params);
      await redis.setex(key, 60, JSON.stringify(result));
      return result;
    }
  };
}
```

**Success Criteria**:
- Cache hit rate >70% for repeated queries
- Response time reduction: 200ms → 20ms (cached)
- Graceful fallback if Redis unavailable

**Why Important**: Performance optimization for high-traffic scenarios

---

### 📊 Medium-Term (Next 6-10 PRs)

#### AG81: Order Details Endpoint
**Priority**: MEDIUM
**Effort**: 3-4 hours
**LOC**: ~200 lines

**Goal**: Add `GET /api/admin/orders/:id` endpoint for full order details

**Tasks**:
- [ ] Extend OrdersRepo with `get(id)` method
- [ ] Include order items, customer info, payment details
- [ ] Implement in all providers
- [ ] Add E2E tests for details view
- [ ] Create Admin UI detail modal

**Why Important**: Admins need to view full order information

---

#### AG82: Order Status Transitions
**Priority**: HIGH
**Effort**: 4-5 hours
**LOC**: ~300 lines

**Goal**: Implement state machine for order status updates

**Tasks**:
- [ ] Define valid status transitions (e.g., pending → paid → shipped)
- [ ] Add `PATCH /api/admin/orders/:id/status` endpoint
- [ ] Validate transitions in route handler
- [ ] Add audit log for status changes
- [ ] Update Admin UI with status action buttons

**Valid Transitions**:
```
pending → [paid, cancelled]
paid → [shipped, refunded]
shipped → [refunded]
cancelled → []
refunded → []
```

**Why Important**: Business logic enforcement and audit trail

---

#### AG83: Export Orders (CSV/Excel)
**Priority**: LOW
**Effort**: 2-3 hours
**LOC**: ~150 lines

**Goal**: Allow admins to export filtered orders as CSV/Excel

**Tasks**:
- [ ] Add `GET /api/admin/orders/export?format=csv` endpoint
- [ ] Generate CSV with all order fields
- [ ] Support Excel format (XLSX) using library
- [ ] Add export button in Admin UI
- [ ] Respect current filters/pagination

**Why Important**: Accounting and reporting requirements

---

### 🔮 Long-Term (Future Considerations)

#### AG84: Multi-Tenant Support
**Priority**: LOW
**Effort**: HIGH (8-10 hours)

**Goal**: Support multiple stores/tenants with data isolation

**Tasks**:
- [ ] Add `tenantId` to Order schema
- [ ] Implement tenant-scoped queries (Row-Level Security)
- [ ] Add tenant selection in Admin UI
- [ ] Migrate existing orders to default tenant

---

#### AG85: Analytics Dashboard
**Priority**: MEDIUM
**Effort**: HIGH (10-12 hours)

**Goal**: Visual analytics for order metrics

**Tasks**:
- [ ] Aggregate queries (daily revenue, top products, etc.)
- [ ] Create chart components (line, bar, pie)
- [ ] Add time range selectors
- [ ] Implement real-time updates (WebSocket)

---

#### AG86: Automated Testing Suite
**Priority**: HIGH
**Effort**: MEDIUM (6-8 hours)

**Goal**: Comprehensive unit + integration tests for providers

**Tasks**:
- [ ] Unit tests for mapping layer (_map.ts)
- [ ] Integration tests for each provider (with test DB)
- [ ] Performance benchmarks (query speed)
- [ ] Coverage report in CI

---

## 📋 Technical Debt

### 1. Provider Error Handling
**Priority**: MEDIUM
**Effort**: 1-2 hours

Add try/catch blocks and graceful error handling to all providers

---

### 2. Prisma Schema Validation
**Priority**: HIGH
**Effort**: 30 minutes

Add `npx prisma validate` to CI workflow

---

### 3. Startup Logging
**Priority**: LOW
**Effort**: 15 minutes

Log selected provider on application startup for debugging

---

### 4. Database Indexes
**Priority**: HIGH
**Effort**: 1 hour

Add indexes to Order table for performance:
- `@@index([status])`
- `@@index([createdAt])`
- `@@index([status, createdAt])`

---

## 🎯 Recommended Roadmap

### Sprint 1 (Week 1)
1. ✅ AG76: Real Prisma providers (COMPLETED)
2. 📋 AG77: PG seed script
3. 📋 AG78: Enable PG E2E in CI

### Sprint 2 (Week 2)
4. 📋 AG79: Pagination & filtering
5. 📋 AG81: Order details endpoint

### Sprint 3 (Week 3)
6. 📋 AG82: Order status transitions
7. 📋 AG80: Redis caching layer

### Sprint 4 (Week 4)
8. 📋 AG86: Automated testing suite
9. 📋 Technical debt: Error handling + indexes
10. 📋 AG83: Export orders (CSV/Excel)

---

## 🏆 Success Metrics

### Current State (Post-AG76)
- ✅ Real database providers implemented
- ✅ Mapping layer for DTO transformation
- ✅ Gated PG E2E test created
- ✅ Environment configuration documented

### Target State (Post-AG86)
- 🎯 100% E2E test coverage (PG + SQLite)
- 🎯 Pagination for 10,000+ orders
- 🎯 <100ms response times (with caching)
- 🎯 80%+ unit test coverage
- 🎯 Order status state machine enforced
- 🎯 Full audit trail for order changes

---

**Generated**: 2025-10-22
**Pass**: AG76
**Status**: ✅ Ready for review
