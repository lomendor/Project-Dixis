# 🧪 E2E TESTING RUNBOOK

**Playwright End-to-End Testing Procedures**

## 🎯 QUICK START

### **Local E2E Testing**
```bash
# 1. Start services
cd backend && php artisan serve --host=127.0.0.1 --port=8001 &
cd frontend && PORT=3030 npm run dev &

# 2. Run E2E tests
cd frontend
npx playwright test

# 3. With debug mode
npx playwright test --debug

# 4. Run specific test file
npx playwright test tests/e2e/checkout.spec.ts
```

### **CI-Style Testing**
```bash
# Full CI simulation
NEXT_PUBLIC_E2E=true PORT=3030 npm run dev &
E2E_BASE_URL=http://127.0.0.1:3030 npx playwright test --retries=2
```

## 🏗️ TEST ENVIRONMENT SETUP

### **Prerequisites**
- ✅ Backend running on port 8001
- ✅ Frontend running on port 3030
- ✅ PostgreSQL database accessible
- ✅ Storage states generated (`.auth/`)

### **Storage State Generation** [[MAP]]
```bash
# Generate auth storage states
cd frontend
npx playwright test auth.setup.ts

# Verify storage states created
ls -la .auth/
# Expected: consumer.json, producer.json
```

### **Environment Variables** [[REGISTRY]]
```bash
# Required for E2E
export NEXT_PUBLIC_E2E=true
export E2E_BASE_URL=http://127.0.0.1:3030
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3030

# Backend flags
export APP_ENV=testing
export ALLOW_TEST_LOGIN=true
```

## 🎪 CRITICAL TEST SUITES

### **1. Checkout Flow** (`checkout.spec.ts`)
**Purpose**: Validates complete purchase journey
**Key Test Cases**:
- Guest checkout with address submission
- Logged-in user checkout
- Quote changes with shipping calculation
- Form validation and error handling
- Unauthorized access redirects

**Critical Selectors** [[TESTIDS]]:
```typescript
'checkout-cta'              // Main checkout button
'shipping-name-input'       // Shipping form fields
'shipping-address-input'
'continue-to-review-btn'    // Step progression
'proceed-to-payment-btn'
'process-payment-btn'
'confirmation-title'        // Success state
```

### **2. Cart Operations** (`cart-summary.spec.ts`)
**Purpose**: Validates cart functionality
**Key Flows**:
- Add products to cart
- Update quantities
- Remove items
- Cart persistence across sessions

### **3. Shipping Integration** (`shipping-integration.spec.ts`)
**Purpose**: Tests shipping provider integration
**Known Issues**: Can timeout on slow external API responses

## 🛠️ E2E UTILITIES & PATTERNS

### **Test Stabilization Utilities** (`tests/e2e/utils/checkout.ts`)
```typescript
// Cart seeding for reliable checkout tests
await seedCartWithProduct(page);

// Safe navigation with proper waits
await gotoCheckoutSafely(page);

// Async quote calculation handling
const total = await waitForQuoteUpdate(page, previousValue);
```

### **Authentication Patterns**
```typescript
// Mock authentication for tests
await page.addInitScript(() => {
  localStorage.setItem('auth_token', 'mock_consumer_token');
  localStorage.setItem('user_role', 'consumer');
  localStorage.setItem('user_email', 'consumer@dixis.test');
});
```

### **Wait Strategies** [[CI-RCA]]
```typescript
// ✅ Element-based waits (stable)
await page.getByTestId('checkout-cta').waitFor({ timeout: 15000 });

// ❌ API response waits (flaky)
await page.waitForResponse('/api/products'); // Don't use
```

## 🚨 COMMON FAILURE PATTERNS & FIXES

### **1. "checkout-cta resolved to 0 elements"**
**Root Cause**: Empty cart state, missing cart seeding
**Fix**: Always use `seedCartWithProduct()` before checkout navigation
```typescript
// Add before checkout tests
await seedCartWithProduct(page);
await gotoCheckoutSafely(page);
```

### **2. Authentication Redirect Failures**
**Root Cause**: Auth token not properly set or expired
**Fix**: Use proper test login setup
```typescript
// Ensure auth setup
await page.addInitScript(() => {
  localStorage.setItem('auth_token', 'valid_test_token');
});
```

### **3. Quote Calculation Race Conditions**
**Root Cause**: Async shipping calculations not awaited
**Fix**: Use polling for quote updates
```typescript
// Wait for quote stabilization
const finalTotal = await waitForQuoteUpdate(page, initialTotal);
```

### **4. Form Validation Timing Issues**
**Root Cause**: Browser validation vs React state timing mismatch
**Fix**: Add validation settling time
```typescript
await nameInput.waitFor({ timeout: 10000 });
await page.getByTestId('continue-to-review-btn').click();
await page.waitForTimeout(1000); // Validation settling
```

### **5. CI Port Conflicts**
**Root Cause**: Wrong port expectations (3000 vs 3030)
**Fix**: Standardize on port 3030
```bash
# Always use port 3030 for E2E
PORT=3030 npm run dev
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3030
```

## 📊 TEST EXECUTION MODES

### **Local Development**
```bash
# Quick smoke test
npx playwright test --grep="Guest checkout"

# Run with browser visible
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium
```

### **CI Pipeline** (GitHub Actions)
```yaml
# Automatic execution
- name: Run E2E tests
  run: npx playwright test
  env:
    NEXT_PUBLIC_E2E: true
    E2E_BASE_URL: http://127.0.0.1:3030
```

### **Debug Mode**
```bash
# Interactive debugging
npx playwright test --debug

# Generate trace files
npx playwright test --trace=on

# Record video
npx playwright test --video=on
```

## 🎯 SMOKE TEST SEQUENCE

### **Quick Health Check (3 tests, ~30 seconds)**
```bash
# Essential functionality validation
npx playwright test cart-summary.spec.ts
npx playwright test checkout.spec.ts --grep="Guest checkout"
npx playwright test auth.setup.ts
```

### **Full Suite (All tests, ~5-10 minutes)**
```bash
# Complete test coverage
npx playwright test --retries=2
```

## 📁 E2E FILE STRUCTURE

```
frontend/tests/e2e/
├── auth.setup.ts           # Authentication storage states
├── cart-summary.spec.ts    # Cart functionality tests
├── checkout.spec.ts        # Complete checkout flow
├── shipping-integration.spec.ts  # Shipping provider tests
└── utils/
    └── checkout.ts         # Shared test utilities
```

### **Storage States** (`.auth/`)
```
frontend/.auth/
├── consumer.json           # Pre-authenticated consumer
└── producer.json           # Pre-authenticated producer
```

## 🔧 CONFIGURATION FILES

### **Main Config** (`playwright.config.ts`)
```typescript
baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3001',
use: {
  storageState: '.auth/consumer.json', // Default auth
},
retries: process.env.CI ? 2 : 0,
```

### **Local Overrides** (`playwright.config.local.ts`)
```typescript
forbidOnly: !!process.env.CI,
// Local-specific configurations
```

## ⚡ PERFORMANCE TARGETS

| Metric | Target | Actual |
|--------|--------|--------|
| **Total Suite Runtime** | <10 minutes | ~5-8 minutes |
| **Individual Test** | <2 minutes | ~30-60 seconds |
| **Page Load Time** | <5 seconds | ~2-3 seconds |
| **Pass Rate (CI)** | >80% | Variable (target) |

## 🚀 NEXT IMPROVEMENTS

- **Parallel Execution**: Run tests across multiple workers
- **Visual Regression**: Screenshot comparison tests
- **Performance Monitoring**: Core Web Vitals tracking
- **API Mocking**: Reduce external service dependencies

---

**Last Updated**: 2025-09-27 | **Test Count**: 10+ scenarios
**Related**: [[TESTIDS]], [[CI-RCA]], [[REGISTRY]], [[MAP]]
**Runbook Version**: v2.0 (Post-stabilization)