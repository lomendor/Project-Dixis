# [Task] Cart Summary & Smoke Suite - Risks & Next Actions
**Ημερομηνία:** 2025-09-15
**Σκοπός:** Identify technical debt and plan next development slice
**Απόφαση/Αποτέλεσμα:** Clear path forward for Auth & Roles → ERD → Producer Onboarding

## RISKS & TECH-DEBT

### Immediate Risks:
1. **Mobile Menu Hydration Issue** - 1 skipped test due to client-side hydration problems
   - Impact: Mobile navigation reliability uncertain
   - Mitigation: Known issue, stable fallback patterns in place

2. **API Mocking Complexity** - Full integration tests prone to timeout failures
   - Impact: CI/CD pipeline instability if not managed
   - Mitigation: Component isolation strategy proven effective

3. **Test Suite Scale** - 231 total tests with some flaky edge cases
   - Impact: Full suite takes >2min, some auth edge case failures
   - Mitigation: PR gates use focused smoke+cart subset only

### Technical Debt:
1. **Cart Component Props** - showViewCartLink prop only partially implemented
   - Action: Complete conditional rendering logic
   - Priority: Low (tests pass, functionality works)

2. **Greek Localization** - Hardcoded Greek text in components
   - Action: Extract to i18n system
   - Priority: Medium (before internationalization)

3. **Test Data Management** - Mock data scattered across test files
   - Action: Centralize test fixtures
   - Priority: Low (current approach stable)

### Architecture Decisions to Review:
- Component isolation vs integration testing balance ✅ (decided: isolation preferred)
- Greek-first UI development ✅ (accepted pattern)
- Playwright vs other E2E frameworks ✅ (committed to Playwright)

## NEXT

### 1) Auth & Roles (MVP) - Immediate Next Slice
- NextAuth setup with Credentials + Google scaffold
- User.role enum: buyer|producer|admin
- Protected routes: /producer/**, /admin/**
- Basic sign in/up pages (unstyled MVP)
- getCurrentUser helper & useUserRole hook
- Smoke tests: signup buyer, 403 admin access, success for admin
- **Target**: 1 PR, ≤300 LOC

### 2) ERD/Migrations (Database Foundation)
- Define core models: User, ProducerProfile, Product, Order, OrderItem, Address, Shipment
- Prisma schema + migrations
- Minimal seed data (1 producer, 2 products)
- Typed repositories/services
- **Target**: 1 PR, focused on data layer

### 3) Producer Onboarding (Business Logic)
- /producer/onboarding form (displayName, taxId placeholder)
- /admin/producers list with Approve/Reject actions
- E2E flow: submit → admin approve → producer access products
- **Target**: 1 PR, complete onboarding cycle

### CI/CD Pipeline Next:
- PR workflow: cart + smoke suites only (fast feedback)
- Nightly workflow: full E2E with markdown summary to /docs/reports/nightly/
- Block merge on PR test failures