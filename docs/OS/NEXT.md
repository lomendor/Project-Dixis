# OS / NEXT (Top-5)

## Immediate Actions
1) **Review & merge PR #301** (Phase 1 stabilization - All gates GREEN)
2) **Kickoff Phase 2**: Unskip remaining 10 tests + type-safety refactor (ADR-0002 follow-up)
3) **Add deploy-to-staging workflow** (αν λείπει) & smoke-on-staging
4) **Enforce/επιβεβαίωση branch protection** (quality-gates, frontend-tests, e2e, type-check)
5) **Weekly audit**: PR hygiene (superseded/stale) + auto-update OS/STATE snapshot

## Phase 2 Priorities (Post-Merge)
- Issue #297: Retry/backoff mechanism (5 tests)
- Issue #298: Server error handling 500/503 (3 tests)
- Issue #299: Timeout categorization (1 test)
- Issue #300: AbortSignal support (1 test)
- Issue #302: Type safety refactor (restore strict ESLint, remove `any`)

## Infrastructure Improvements
- State-capsule workflow for auto-STATE updates
- Staging deployment automation
- PR hygiene automation (labels, stale detection)

## Notes
- SKIP_LIMIT=10 maintained
- No failing baseline
- Code-as-Canon enforced (no business logic changes in stabilization)
