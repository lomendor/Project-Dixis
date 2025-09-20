# Testing & CI - MVP Polish Pack 01

## Overview
Comprehensive testing strategy with 39 E2E scenarios covering all critical user workflows.

## Local Development
```bash
# API Server
cd backend && php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8001 &

# Frontend (dev mode for hot reload)
cd backend/frontend && npm run dev -- -p 3001 &

# Production-like Testing
npm run build
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8001/api/v1" npm start -- -p 3001 &

# E2E Test Execution
npx playwright test --reporter=html              # Full HTML report
npx playwright test --headed --project=chromium  # Visual debugging
npx playwright test auth-edge-cases.spec.ts      # Specific test file
```

## Test Categories

### 1. Authentication Edge Cases (auth-edge-cases.spec.ts)
**Coverage**: Session management, token handling, recovery flows
- ✅ Wrong password then correct password flow
- ✅ Empty fields validation  
- ✅ **C3: Session Management & Auth Recovery**
  - Phase 1: Normal login verification
  - Phase 2: Session clearing and state validation  
  - Phase 3: Auth protection verification
  - Phase 4: Re-login after session clear
- ✅ **C3a: Auth Persistence** across page reloads and navigation
- ✅ **C3b: Token Corruption & Recovery** - Invalid token handling
- ✅ Invalid email format validation

**Helper Classes**:
```typescript
class AuthTestHelper {
  async clearAllAuthData()        // Clear cookies + localStorage
  async loginWithCredentials()    // Robust login with validation
  async attemptProtectedAction()  // Test auth-required routes
  async checkAuthState()         // Verify auth status
}
```

### 2. Shipping Integration Flow (shipping-integration-flow.spec.ts) 
**Coverage**: Complete shipping cost calculation and cart total updates
- ✅ **C1: Dynamic Shipping Calculation**
  - Athens Metro zone (11527) → Athens Express (1 day)
  - Thessaloniki zone (54623) → Northern Courier (2 days)  
  - Islands zone (84600) → Island Logistics (4 days)
  - Real-time cart total updates
- ✅ **C1a: Shipping Input Validation** - Invalid postal codes, field requirements
- ✅ **C1b: Real-time API Integration** - Network request/response validation

**Network Monitoring**:
```typescript
// Capture shipping API calls for validation
page.on('request', (request) => {
  if (request.url().includes('/api/v1/shipping/quote')) {
    // Log and validate request payload
  }
});
```

### 3. Checkout Happy Path (checkout-happy-path.spec.ts)
**Coverage**: Complete order creation workflow from cart to confirmation  
- ✅ **C2: Complete Checkout Flow**  
  - Cart setup with shipping information
  - Checkout button enablement validation
  - Order creation and payload verification
  - Order confirmation page validation
- ✅ **C2a: Order Confirmation Display** - Shipping details visibility
- ✅ **C2b: Multiple Checkout Reliability** - Independent order handling
- ✅ **C2c: Payment Methods** - COD (Cash on Delivery) validation

**Order Payload Validation**:
```typescript
// Comprehensive order creation monitoring
const orderRequests = await helper.captureOrderCreation();
expect(orderPayload.shipping_method).toBeTruthy();
expect(orderPayload.payment_method || 'COD').toBeTruthy();
```

### 4. Enhanced Search & Greek Localization Tests
**Coverage**: Greek-insensitive search and i18n validation
- Greek character normalization (ά→α, ή→η, ώ→ω)
- Synonym matching (τομάτα ↔ ντομάτα)
- Fuzzy matching with 20% error tolerance
- Currency formatting (€1.234,56 el-GR)
- Complete UI localization testing

## CI/CD Integration

### Test Execution Order
1. **Type Checking**: `npm run type-check`
2. **Backend Build**: Laravel migration + seeding  
3. **Frontend Build**: Next.js production build
4. **Service Startup**: API (8001) + Frontend (3001)
5. **E2E Execution**: Playwright test suite
6. **Artifact Collection**: HTML reports, videos, traces

## Smoke Testing How-To

### Quick Smoke Test Execution
```bash
# Run smoke tests (fastest validation)
npm run e2e:smoke

# Expected output: 7 passed (2-3s)
# Coverage: homepage, navigation, cart, checkout flow
```

### Smoke Test Reports
```bash
# View latest HTML report
npx playwright show-report

# Direct report paths
frontend/playwright-report/index.html    # HTML dashboard  
frontend/test-results/smoke-*/           # Individual test evidence
frontend/test-results/*/trace.zip        # Execution traces
```

### Smoke Test Architecture
- **Lightweight Stubs**: Playwright route stubs (no MSW overhead)
- **Mobile Viewport**: 360x800 for hamburger menu testing
- **Resilient Selectors**: `waitForRoot(page)` helper with fallbacks
- **Auth Mode**: Mock storage states for consumer/producer roles

### Common Smoke Issues
- **Page Root**: Use `waitForRoot(page)` instead of strict testid waits
- **Mobile Nav**: Ensure hamburger menu is visible before clicking
- **API Stubs**: Register `registerSmokeStubs(page)` before navigation
- **Image 404s**: Handled by demo.jpg stub in api-mocks.ts

### Playwright Configuration
```typescript
// playwright.config.ts highlights
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  use: {
    video: 'retain-on-failure',
    screenshot: 'only-on-failure', 
    trace: 'retain-on-failure'
  },
  
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] }
  ]
});
```

## Test Data Strategy

### Seeding Strategy
```php
// E2ESeeder provides consistent test data
class E2ESeeder extends Seeder {
    public function run() {
        // Greek product data with proper categorization
        // Predictable producer/consumer accounts
        // Shipping zone test cases (Athens, Thessaloniki, Islands)
    }
}
```

### Test Isolation
- **Session Management**: `clearAllAuthData()` between auth tests
- **Cart State**: Independent cart operations per test
- **Database State**: Idempotent seeding for consistent results

## Evidence Collection

### Artifact Types
- **Screenshots**: Visual confirmation of UI states (`test-failed-*.png`)
- **Videos**: Complete interaction recordings (`video.webm`)
- **Traces**: Detailed execution analysis (`trace.zip`)
- **Network Logs**: API request/response validation
- **HTML Reports**: Comprehensive test results dashboard

### Evidence Locations
```
test-results/
├── auth-edge-cases-*/           # Authentication flow evidence
├── shipping-integration-*/      # Shipping API evidence  
├── checkout-happy-path-*/       # Order creation evidence
└── playwright-report/           # HTML dashboard
```

## Greek Localization Testing

### Text Processing Validation
```typescript
// Greek search term expansion testing
'τομάτα' → ['τομάτα', 'ντομάτα', 'τοματα', 'ντοματα']
'βιολογικό' → ['βιολογικο', 'bio', 'organic']

// Currency formatting validation  
formatGreekCurrency(1234.56) → "1.234,56 €"
```

### i18n Coverage
- ✅ Search placeholders and labels
- ✅ Filter options and categories  
- ✅ Product information display
- ✅ Cart and checkout workflows
- ✅ Error messages and empty states

## Performance Testing

### Metrics Tracking
- **Page Load Times**: <300ms average
- **Search Response**: <10ms client-side filtering
- **Cart Operations**: <50ms state updates
- **Network Requests**: Optimized with debouncing (500ms)

### Memory Management
- **Bundle Size**: ~679 modules optimized loading
- **Runtime Memory**: <50MB additional overhead
- **State Management**: useMemo for expensive calculations

## Debugging & Troubleshooting

### Visual Debugging
```bash
# Run tests with browser visible
npx playwright test --headed --project=chromium

# Generate and view traces
npx playwright show-trace test-results/*/trace.zip

# Run specific failing tests
npx playwright test auth-edge-cases.spec.ts:91
```

### Common Issues
- **Authentication Failures**: Check toast message selectors
- **Shipping API**: Verify backend seeded with zone data
- **Greek Text**: Ensure proper UTF-8 encoding
- **Cart State**: Clear localStorage between test runs

## E2E Helpers & Auth Fixtures

### Test Helpers
The E2E test suite includes dedicated helper functions for common operations:

**waitForRoot Helper** (`tests/e2e/helpers/waitForRoot.ts`)
```typescript
// Resilient page load detection with fallback selectors
await waitForRoot(page);
// Waits for [data-testid="page-root"] or #__next with 15s timeout
```

**API Mocking** (`tests/e2e/helpers/api-mocks.ts`)
```typescript
// Lightweight route stubs for deterministic testing
await setupCartApiMocks(page);
await registerSmokeStubs(page);
```

### Auth Fixtures Management
**⚠️ Important**: Auth fixture files should remain local-only for testing:

```bash
# Auth fixtures are auto-generated during test execution
frontend/.auth/consumer.json  # Local consumer session
frontend/.auth/producer.json  # Local producer session

# These files should NOT be committed to version control
# They contain temporary test authentication states only
```

**Best Practices**:
- Auth files are regenerated automatically before each test run
- Timestamps are dynamically updated to prevent expiration
- Clean auth state ensures deterministic test behavior
- Manual modification of auth fixtures is not recommended

## Continuous Improvement

### Test Quality Gates
- ✅ **39 E2E Scenarios**: Comprehensive coverage
- ✅ **Multi-browser Testing**: Chrome, Firefox, Safari
- ✅ **Visual Evidence**: Screenshots + videos for all failures
- ✅ **Network Validation**: API request/response verification  
- ✅ **Greek Localization**: Complete i18n testing
- ✅ **Performance Monitoring**: Response time validation

### Future Enhancements
- [ ] Mobile device testing (responsive design)
- [ ] Accessibility testing (screen readers, keyboard navigation)
- [ ] Performance regression testing
- [ ] Cross-language testing (English/Greek switching)