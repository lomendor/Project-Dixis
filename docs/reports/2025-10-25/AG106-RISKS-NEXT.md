# AG106 — RISKS-NEXT

## Risks

- **Πολύ χαμηλό**: Opt-in via env, memory-only, δεν αλλάζει το σχήμα απόκρισης
- **Stale data**: Data can be up to 60s old
  - **Mitigation**: 60s is acceptable for facets (summary data)
  - **Alternative**: Implement invalidation hooks (AG108)
- **Memory usage**: Unbounded cache could grow large
  - **Mitigation**: TTL auto-cleanup on access
  - **Monitoring**: Track Map size if concerned
- **Cache key collisions**: Different queries produce same key
  - **Mitigation**: Key includes all query params + schema version
  - **Testing**: Verify distinct queries produce distinct keys

## Testing Strategy

### Unit Tests (Cache Module)
```typescript
// Test TTL expiration
const cache = { totals: {...}, total: 100 };
set('key1', cache, 1000); // 1s TTL
expect(get('key1')).toEqual(cache); // Immediate
await sleep(1100);
expect(get('key1')).toBeUndefined(); // Expired

// Test makeKey distinctness
expect(makeKey({ status: 'pending' }))
  .not.toEqual(makeKey({ status: 'shipped' }));
```

### Integration Tests
```typescript
// Test cache hit/miss headers
const res1 = await fetch('/api/admin/orders/facets');
expect(res1.headers.get('X-Dixis-Cache')).toBe('miss');

const res2 = await fetch('/api/admin/orders/facets');
expect(res2.headers.get('X-Dixis-Cache')).toBe('hit');
```

### Manual Testing
See CODEMAP for curl examples with cache enabled.

## Expected Results

- ✅ **All tests pass**: No functional changes when cache disabled
- ✅ **Cache works**: Second request within 60s returns cached data
- ✅ **Headers present**: `X-Dixis-Cache` shows hit/miss when enabled
- ✅ **Performance**: Cache hits should be <5ms vs ~40ms for miss

## Monitoring

Once `DIXIS_CACHE=1` is enabled in production:

### Key Metrics
1. **Cache hit rate**: % of requests served from cache
   - **Target**: >50% hit rate (indicates effective caching)
   - **Low (<30%)**: Consider longer TTL or query patterns too diverse
   - **High (>80%)**: Cache working well, consider extending TTL

2. **Response time distribution**:
   - **Cache hits**: <5ms (memory lookup)
   - **Cache misses**: ~40ms (database query)
   - **Compare**: Should see bimodal distribution

3. **Memory usage**:
   - **Typical**: <1MB for cache Map
   - **Alert**: >10MB (may indicate leak or excessive entries)

### Log Analysis (with AG105 metrics)
```bash
# Count cache hits vs misses
grep '[AG105][facets]' logs.txt | grep -c 'ms=[0-9]\.' # ~hits (fast)
grep '[AG105][facets]' logs.txt | grep -c 'ms=[0-9][0-9]\.' # ~misses (slow)

# Average response time for cache hits
grep '[AG105][facets]' logs.txt | awk '/ms=[0-9]\./ {sum+=$NF; count++} END {print sum/count}'
```

## Next Steps (Optional)

### AG107: Metrics Analysis Script
- `scripts/metrics/grep-facets.sh` for automated log analysis
- Compute cache hit rate, p50/p95/p99 response times
- Identify most common query patterns

### AG108: Cache Invalidation Hooks
- **Problem**: Data can be stale for up to 60s
- **Solution**: Clear cache when orders are created/updated
- **Implementation**: Call `facets.cache.clear()` from mutation endpoints

Example invalidation points:
- `POST /api/orders` - New order created
- `PATCH /api/orders/:id` - Order status changed
- `DELETE /api/orders/:id` - Order deleted

### AG109: Advanced Cache Strategies
1. **Selective invalidation**: Clear only affected cache keys
   ```typescript
   // When order status changes from pending → shipped
   invalidateKey(makeKey({ status: 'pending' }));
   invalidateKey(makeKey({ status: 'shipped' }));
   invalidateKey(makeKey({ status: 'any' })); // "all orders" query
   ```

2. **Background refresh**: Refresh cache before expiry
   ```typescript
   // If entry expires in <10s, refresh in background
   if (entry.expiresAt - Date.now() < 10000) {
     refreshInBackground(key);
   }
   ```

3. **Cache warming**: Pre-populate common queries on server start
   ```typescript
   // Warm cache for "all orders" facets
   await warmCache({ status: 'any' });
   ```

## Stale Data Considerations

### When 60s Staleness is Acceptable
- ✅ Dashboard summaries (facet counts)
- ✅ Filter options (status counts)
- ✅ Analytics/reporting views
- ✅ Read-heavy endpoints

### When Staleness is NOT Acceptable
- ❌ Real-time alerts/notifications
- ❌ Financial transactions
- ❌ Inventory availability
- ❌ Order status for customer view

For facets specifically:
- **60s delay is fine**: Admins viewing dashboard don't need real-time facet counts
- **Invalidation improves**: AG108 cache invalidation would make this even better
- **User expectation**: Dashboard data is typically not expected to be real-time

## Tuning TTL

Adjust based on production metrics:

**Increase TTL (e.g., 120s) if**:
- High cache hit rate (>80%)
- Query patterns are stable
- Update frequency is low (few orders/hour)

**Decrease TTL (e.g., 30s) if**:
- Users report stale data
- High update frequency (many orders/hour)
- Real-time accuracy is important

**Implement invalidation (AG108) if**:
- Need fresh data without waiting for TTL
- Update patterns are predictable
- Want both performance AND freshness
