# AG104 — RISKS-NEXT

## Risks
- **Πολύ χαμηλό**: Η αλλαγή ενεργοποιείται μόνο όταν `DIXIS_AGG_PROVIDER=pg` & όχι σε demo
- **Connection Pool**: Singleton pattern is standard Next.js best practice
- **Hot Reload**: globalThis pattern tested and recommended by Prisma docs
- **Fallback**: Demo path remains unchanged, provides automatic fallback

## Testing Strategy
- **pg-e2e workflow**: Validates PG aggregation with shared client
- **Smoke tests**: Verify demo mode still works (no regression)
- **CI validation**: Full test suite runs on PR

## Expected Result
- ✅ **pg-e2e test passes**: Same behavior with singleton client
- ✅ **Smoke tests pass**: Demo mode unaffected
- ✅ **Performance**: Slightly faster response times in PG mode
- ✅ **Connection stability**: No connection exhaustion errors

## Next Steps

### AG105 (Optional): Performance Metrics
- Add timing metrics to facets API
- Compare demo vs pg response times
- Log connection pool stats

### AG106 (Optional): In-Memory Cache
- 60-second cache for facet totals by query key
- Cache invalidation on order creation/update
- Further reduces database load

### Long-term Improvements
1. **Connection Pool Tuning**: Optimize pool size based on load testing
2. **Read Replicas**: Route aggregations to read replicas if available
3. **Materialized Views**: Pre-compute facet totals for common queries
4. **Query Optimization**: Add indexes for frequently filtered columns

## Monitoring
Once deployed, monitor:
- Database connection count (should remain stable)
- API response times (should improve slightly)
- Error rates (should remain same or improve)
- Memory usage (singleton should reduce overhead)
