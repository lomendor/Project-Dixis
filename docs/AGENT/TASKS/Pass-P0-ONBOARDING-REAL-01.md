# Pass P0-ONBOARDING-REAL-01: Producer Order Status API Security Smoke Tests

**Created**: 2026-02-02
**Status**: IN_PROGRESS
**Priority**: P0 (Security regression guard)

## Problem Statement

P0-SEC-01 fixed a critical vulnerability where `/api/producer/orders/[id]/status` was unauthenticated. We need comprehensive E2E smoke tests that:

1. Verify unauthenticated requests are rejected (401)
2. Verify authenticated producers cannot access orders they don't own (403)
3. Verify authenticated producers CAN update status for orders they own (200 or defined success)

The existing test (`api-producer-order-status-auth.spec.ts`) only covers unauthenticated requests. This pass extends coverage to ownership verification.

## Definition of Done (DoD)

- [ ] Playwright @smoke test verifies:
  - Unauthenticated call → 401 JSON
  - Authenticated producer, non-owned order → 403 JSON
  - Authenticated producer, owned order → 200 JSON (or defined success)
- [ ] Tests are stable in CI (no flake)
- [ ] No production behavior changes
- [ ] Pass docs committed (TASKS, SUMMARY)
- [ ] PR merged with ai-pass label

## Scope

### In Scope
- Extend `api-producer-order-status-auth.spec.ts` with ownership tests
- Use existing auth helpers (`loginAsProducer`, `TestAuthHelper`)
- API-level tests using Playwright request context (no brittle UI selectors)

### Out of Scope
- Modifying business logic
- Creating new CI-only seed endpoints (use existing test auth)
- UI-based onboarding flow tests (API-level only for now)

## Technical Approach

1. **Unauthenticated test** (already exists): POST without cookies → 401
2. **Non-owned order test**:
   - Login as producer via test auth
   - POST to a fake/non-existent order ID → 404 (order not found) OR 403 (no ownership)
   - Either is acceptable as it blocks the request
3. **Owned order test** (if deterministic fixture available):
   - Login as producer
   - POST to known order with valid status
   - Expect 200 or defined success response
   - Note: May skip if no deterministic producer-order fixture exists

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| No deterministic producer-order fixture | Test ownership rejection (403/404) is sufficient proof |
| Auth helpers require backend test endpoint | Use existing `NEXT_PUBLIC_E2E=true` test mode |
| Flaky due to network | Use retry config in test.describe.configure |

## Verification Commands

```bash
# Run security tests locally
cd frontend && npx playwright test api-producer-order-status-auth.spec.ts --reporter=line

# Run with debug output
cd frontend && npx playwright test api-producer-order-status-auth.spec.ts --debug
```

## Related

- PR #2579: P0-SEC-01 security fix (merged)
- PR #2580: OPS-DEPLOY-GUARD-01 guardrails (merged)
- File: `frontend/src/app/api/producer/orders/[id]/status/route.ts`
