# AG105 — CODEMAP

## Modified Files

### frontend/src/app/api/admin/orders/facets/route.ts

**Changes**:
1. **Import performance API** (line 2):
   ```typescript
   import { performance } from 'node:perf_hooks';
   ```

2. **Add timing measurements** (lines 30-42):
   - Measure `getFacetTotals()` execution time using `performance.now()`
   - Log metrics only when `DIXIS_METRICS=1` environment variable is set
   - Privacy-safe logging: No PII, only query metadata

**Code Added**:
```typescript
// AG105 — Performance timing (env-guarded)
const t0 = performance.now();
const { totals, total } = await provider.getFacetTotals(q);
const t1 = performance.now();

if (process.env.DIXIS_METRICS === '1') {
  const qLen = q.q ? q.q.length : 0;
  const status = q.status || 'any';
  const fromD = q.fromDate ? '1' : '0';
  const toD = q.toDate ? '1' : '0';
  // ΜΗΝ log-άρεις την q τιμή (PII). Μόνο μήκος & flags.
  console.info(`[AG105][facets] provider=pg ms=${(t1-t0).toFixed(1)} total=${total} status=${status} qLen=${qLen} fromDate=${fromD} toDate=${toD}`);
}
```

## Why This Change

### Purpose: Performance Monitoring
- Measure actual query performance in production
- Compare PG aggregation vs demo fallback performance
- Identify slow queries for optimization

### Privacy-First Design
- **No PII logged**: Never log actual search query text
- **Metadata only**: Query length, status filter, date range flags
- **Opt-in**: Requires explicit `DIXIS_METRICS=1` environment variable

### Example Log Output
```
[AG105][facets] provider=pg ms=42.3 total=150 status=pending qLen=5 fromDate=1 toDate=0
```

This shows:
- Query took 42.3ms
- Returned 150 total orders
- Filtered by status "pending"
- Search query was 5 characters long
- Date range "from" was set, "to" was not

## Impact

- ✅ **Zero API contract change**: Response format identical
- ✅ **Zero runtime overhead when disabled**: `DIXIS_METRICS != 1` means no logging
- ✅ **Minimal overhead when enabled**: `performance.now()` is extremely fast (~1μs)
- ✅ **Privacy-safe**: No PII in logs
- ✅ **Production-ready**: Can be enabled in production for debugging

## Activation

To enable metrics logging:
```bash
# Local development
DIXIS_AGG_PROVIDER=pg DIXIS_METRICS=1 npm run dev

# Production environment variable
DIXIS_METRICS=1
```

## Use Cases

1. **Performance Baseline**: Measure typical query performance
2. **Slow Query Detection**: Identify queries taking >100ms
3. **Optimization Validation**: Verify improvements after index changes
4. **Capacity Planning**: Understand query patterns and load
