# ADR-0002 — CheckoutApiClient Retry-with-Backoff

**Date**: 2025-10-04
**Status**: Accepted
**Context**: Pass 66 - E2E Stabilization Phase 2

## Context

5 unit tests were skipped with identical root cause: "retry not implemented at CheckoutApiClient level". These tests validated retry behavior for:
- Network errors (TypeError, ECONNRESET, ETIMEDOUT)
- Transient server errors (502, 503, 504)
- Server errors on safe operations (5xx on GET)

Without retry logic, the checkout API was fragile against temporary network issues and server hiccups.

## Decision

Implement smart retry-with-exponential-backoff in `CheckoutApiClient` with the following policy:

### Retry Policy
1. **Always Retry** (transient server errors):
   - 502 Bad Gateway
   - 503 Service Unavailable
   - 504 Gateway Timeout

2. **Retry on GET only** (safe, idempotent):
   - Other 5xx server errors (500, 501, 505, etc.)

3. **Never Retry**:
   - 4xx client errors (bad request, unauthorized, etc.)
   - Non-network exceptions

4. **Network Errors** (always retry):
   - TypeError (fetch failures)
   - ECONNRESET (connection reset)
   - ETIMEDOUT (request timeout)

### Configuration
- **Max Retries**: 2 (default), configurable via `CHECKOUT_API_RETRIES`
- **Base Delay**: 200ms (default), configurable via `CHECKOUT_API_RETRY_BASE_MS`
- **Backoff**: Exponential (2^attempt)
- **Jitter**: 50% randomization to prevent thundering herd

### Implementation
- Enhanced existing `retryWithBackoff()` function in `src/lib/api/checkout.ts`
- Added HTTP method parameter for smart retry decisions
- Added comprehensive unit tests (15 test cases)
- No new dependencies

## Consequences

### Positive
- ✅ Improved resilience against transient failures
- ✅ 4 tests unskipped: 116/117 passing (99.1% coverage)
- ✅ Configurable via environment variables
- ✅ Smart retry logic prevents unnecessary retries (POST 5xx, 4xx errors)
- ✅ Exponential backoff with jitter prevents server overload

### Negative
- ⚠️ Slight increase in latency for failed requests (max ~600ms with 2 retries)
- ⚠️ Potential for masking persistent server issues (mitigated by max 2 retries)

### Risks & Mitigation
- **Risk**: Retry storms during outages
  - **Mitigation**: Max 2 retries, exponential backoff with jitter
- **Risk**: Non-idempotent operations retried incorrectly
  - **Mitigation**: Retry 5xx only on GET (safe operations)

## Revisit Criteria

Review this decision if:
1. Nightly E2E Full runs show retry-related flakiness (7+ days monitoring)
2. Server logs indicate excessive retry traffic
3. User-reported latency increases significantly

## References

- Pass 66: CheckoutApiClient retry-with-backoff
- PR #322: Implementation and tests
- Related tests: `checkout.api.resilience.spec.ts`, `checkout.api.extended.spec.ts`
