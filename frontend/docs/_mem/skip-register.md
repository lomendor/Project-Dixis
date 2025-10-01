# Skip Register — 2025-10-01

**Purpose**: Track all skipped tests with reasons, ownership, and un-skip plans.

**Status**: 20 tests skipped across 6 suites

---

## Summary by Category

| Category | Count | Reason | Priority |
|----------|-------|--------|----------|
| Unimplemented Features | 4 | Features not in production code | P3 - Future |
| Component Rendering | 5 | Components missing/incomplete | P2 - Medium |
| Hook Stateful Tests | 4 | Global mock can't simulate state | P2 - Medium |
| Retry Advanced | 3 | Retry not at hook level | P3 - Future |
| Error Categorization | 2 | Implementation mismatch | P3 - Low |
| Other Edge Cases | 2 | Various reasons | P3 - Low |

---

## Detailed Skip List

### 1. Unimplemented Features (P3 - Future Development)

| Suite | Test | Reason | Owner | Unskip Plan |
|-------|------|--------|-------|-------------|
| checkout.api.extended | handles AbortSignal during cart loading | AbortSignal not implemented | @backend | Implement AbortController support in API client |
| checkout-error-handling | handles 500 server errors during checkout | MSW unhandled request | @frontend | Add proper MSW handler for 500 errors |
| checkout-error-handling | partial service failures | Circuit breaker not implemented | @backend | Implement circuit breaker pattern |
| checkout-error-handling | intermittent failures | Circuit breaker not implemented | @backend | Add circuit breaker tracking |

**Unskip Criteria**:
- Add AbortController support to CheckoutApiClient
- Implement circuit breaker pattern with failure tracking
- Add proper MSW handlers for error scenarios
- Write integration tests for resilience patterns

---

### 2. Component Rendering Tests (P2 - Medium Priority)

| Suite | Test | Reason | Owner | Unskip Plan |
|-------|------|--------|-------|-------------|
| checkout-shipping-updates | validates Greek postal codes correctly | CheckoutShipping component incomplete | @frontend | Complete CheckoutShipping component |
| checkout-shipping-updates | displays loading state during shipping quote | Same | @frontend | Add loading state UI |
| checkout-shipping-updates | handles remote island shipping with higher costs | Same | @frontend | Add shipping method display |
| checkout-shipping-updates | allows shipping method selection and triggers callback | Same | @frontend | Add selection callbacks |
| checkout-shipping-updates | handles API errors gracefully | Same | @frontend | Add error display |

**Unskip Criteria**:
- Build CheckoutShipping component with required testids:
  - postal-code-input
  - get-shipping-quote
  - shipping-methods
  - shipping-method-{id}
  - shipping-error
- Implement loading states
- Add error handling UI

---

### 3. Hook Stateful Tests (P2 - Medium Priority)

| Suite | Test | Reason | Owner | Unskip Plan |
|-------|------|--------|-------|-------------|
| useCheckout | loads cart and handles errors | Global mock can't simulate state updates | @frontend | Remove global mock, use actual hook |
| useCheckout | gets shipping quotes with Greek postal validation | Same | @frontend | Test with real hook implementation |
| useCheckout | validates form and processes complete checkout with Greek VAT | Missing setTermsAccepted method | @frontend | Add method to hook |
| useCheckout | resets state correctly | form.customer undefined | @frontend | Fix form state initialization |

**Unskip Criteria**:
- Remove global vi.mock for useCheckout
- Create per-test mocks using vi.fn()
- Add missing methods: setTermsAccepted, updateShippingInfo
- Fix form state structure

---

### 4. Retry Advanced Scenarios (P3 - Future)

| Suite | Test | Reason | Owner | Unskip Plan |
|-------|------|--------|-------|-------------|
| checkout.api.extended | respects exponential backoff timing | Retry not at CheckoutApiClient level | @backend | Implement retry with backoff |
| checkout.api.extended | handles intermittent network failures correctly | Same | @backend | Add retry logic |
| checkout.api.extended | handles mixed error types in retry sequence | Same | @backend | Add error classification |

**Unskip Criteria**:
- Move retry logic from base API client to CheckoutApiClient
- Implement exponential backoff strategy
- Add attempt counting and timing tests
- Configure retryable vs non-retryable errors

---

### 5. Error Categorization (P3 - Low Priority)

| Suite | Test | Reason | Owner | Unskip Plan |
|-------|------|--------|-------|-------------|
| checkout.api.extended | categorizes network timeout vs server timeout differently | Implementation doesn't distinguish | @backend | Add timeout categorization |
| checkout.api.extended | handles key HTTP status code ranges | Error messages don't match | @frontend | Align error messages |

**Unskip Criteria**:
- Add timeout type detection (network vs server)
- Update error message mapping for HTTP status codes
- Align test expectations with actual error messages

---

### 6. Other Edge Cases (P3 - Low)

| Suite | Test | Reason | Owner | Unskip Plan |
|-------|------|--------|-------|-------------|
| checkout-shipping-updates | handles API errors gracefully | Component test issue | @frontend | See Component Rendering section |
| Various | Form validation edge cases | Skipped during Pass 8.1 | @frontend | Review and re-enable |

---

## Unskip Roadmap

### Phase 1: High-Value Quick Wins (Sprint 1-2)
**Target**: Reduce skipped from 20 → 12

1. ✅ **Fix useCheckout Hook Tests** (4 tests)
   - Remove global mock
   - Add missing methods
   - Fix form state
   - Effort: 2-3 hours
   - Owner: @frontend

2. ✅ **Complete CheckoutShipping Component** (5 tests)
   - Build component skeleton
   - Add required testids
   - Implement basic UI
   - Effort: 4-6 hours
   - Owner: @frontend

### Phase 2: Error Handling & Resilience (Sprint 3-4)
**Target**: Reduce skipped from 12 → 5

3. **Implement Circuit Breaker** (2 tests)
   - Add failure tracking
   - Implement circuit logic
   - Add recovery mechanism
   - Effort: 8-12 hours
   - Owner: @backend

4. **Add AbortSignal Support** (1 test)
   - Wire AbortController
   - Handle cancellation
   - Effort: 2-4 hours
   - Owner: @backend

5. **Fix MSW 500 Error Handling** (1 test)
   - Add proper handler
   - Update test expectations
   - Effort: 1-2 hours
   - Owner: @frontend

### Phase 3: Advanced Features (Future Backlog)
**Target**: Reduce skipped from 5 → 0

6. **Retry Logic Enhancement** (3 tests)
   - Move retry to CheckoutApiClient
   - Implement backoff
   - Add attempt tracking
   - Effort: 6-8 hours
   - Owner: @backend

7. **Error Categorization Refinement** (2 tests)
   - Add timeout type detection
   - Align error messages
   - Effort: 3-4 hours
   - Owner: @backend

---

## Maintenance

**Review Frequency**: Monthly
**Last Updated**: 2025-10-01
**Next Review**: 2025-11-01

**Metrics to Track**:
- Total skipped tests
- Tests unskipped per sprint
- Time to unskip average
- Re-skip rate (tests that fail again)

**Process**:
1. Before starting unskip work, verify test still fails
2. After implementing feature, unskip test
3. If test still fails, keep skipped and update reason
4. If test passes, remove from register
5. Update register monthly with current counts

---

**Generated**: 2025-10-01 21:18 UTC
**Branch**: docs/prd-upgrade
**Total Skipped**: 20 tests
**Target**: 0 tests (via phased roadmap)
