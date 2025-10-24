# AG105 — RISKS-NEXT

## Risks

- **Πολύ χαμηλό**: Logging-only change, activated only with explicit env flag
- **Performance overhead**: `performance.now()` calls add ~1-2μs (negligible)
- **Log volume**: Only logs when `DIXIS_METRICS=1`, one line per request
- **Privacy**: No PII logged, only metadata

## Testing Strategy

- **Existing tests pass**: No API contract changes
- **pg-e2e validates**: PG aggregation still works correctly
- **Local testing**: Enable `DIXIS_METRICS=1` to verify log format

## Expected Result

- ✅ **All tests pass**: Zero functional changes
- ✅ **No performance degradation**: Timing measurement is negligible
- ✅ **Clean logs**: When enabled, logs are structured and parseable

## Next Steps (Optional)

### AG106: In-Memory Cache
- 60-second cache for facet totals
- Cache key: query parameters hash
- Invalidation: Time-based (simple) or event-based (complex)
- Reduces database load for repeated queries

### AG107: Metrics Analysis Script
- `scripts/metrics/grep-facets.sh` for log analysis
- Parse AG105 logs to compute:
  - p50, p95, p99 response times
  - Most common query patterns
  - Slow query identification (>100ms)

### Long-term: Observability Stack
1. **Structured Logging**: JSON format for log aggregation
2. **Metrics Export**: Prometheus/OpenTelemetry integration
3. **Alerting**: Alert on p99 > threshold
4. **Dashboards**: Grafana dashboards for query performance

## Monitoring Recommendations

Once `DIXIS_METRICS=1` is enabled in production:

### Response Time Targets
- **p50**: <50ms (median query)
- **p95**: <100ms (95th percentile)
- **p99**: <200ms (99th percentile)

If exceeded, consider:
1. **Database indexes**: Add/optimize indexes on filter columns
2. **Query optimization**: Review `groupBy` efficiency
3. **Caching**: Implement AG106 (60s cache)
4. **Read replicas**: Route aggregations to replicas

### Query Pattern Analysis
Monitor distribution of:
- **Status filters**: Which statuses are queried most?
- **Search usage**: How many users use text search?
- **Date ranges**: Common time windows?

This informs:
- **Index strategy**: Index most-filtered columns
- **Cache strategy**: Cache most common queries
- **Feature usage**: Understand user behavior
