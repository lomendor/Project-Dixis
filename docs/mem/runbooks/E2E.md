# 🧪 E2E TESTING RUNBOOK

**Playwright End-to-End Testing Procedures**

## 🎯 QUICK START

### **Local E2E Testing**
```bash
# 1. Start services
cd backend && php artisan serve --host=127.0.0.1 --port=8001 &
cd frontend && PORT=3030 npm run dev &

# 2. Run E2E tests
cd frontend && npx playwright test

# 3. Debug mode
npx playwright test --debug

# 4. Specific test
npx playwright test tests/e2e/checkout.spec.ts
```

### **CI-Style Testing**
```bash
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
cd frontend && npx playwright test auth.setup.ts
ls -la .auth/  # Expected: consumer.json, producer.json
```

### **Environment Variables** [[REGISTRY]]
```bash
export NEXT_PUBLIC_E2E=true
export E2E_BASE_URL=http://127.0.0.1:3030
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3030
export APP_ENV=testing
export ALLOW_TEST_LOGIN=true
```

## 🎪 CRITICAL TEST SUITES

### **1. Checkout Flow** (`checkout.spec.ts`)
**Purpose**: Validates complete purchase journey
**Key Cases**: Guest checkout, logged-in user, quote changes, form validation, auth redirects

**Critical Selectors** [[TESTIDS]]:
```typescript
'checkout-cta', 'shipping-name-input', 'shipping-address-input',
'continue-to-review-btn', 'proceed-to-payment-btn', 'process-payment-btn',
'confirmation-title'
```

### **2. Cart Operations** (`cart-summary.spec.ts`)
**Purpose**: Cart functionality - add, update, remove, persistence

### **3. Shipping Integration** (`shipping-integration.spec.ts`)
**Purpose**: Shipping provider integration testing

## 🛠️ E2E UTILITIES & PATTERNS

### **Test Stabilization Utilities**
```typescript
// Cart seeding for reliable checkout tests
await seedCartWithProduct(page);
await gotoCheckoutSafely(page);
const total = await waitForQuoteUpdate(page, previousValue);
```

### **Authentication Patterns**
```typescript
await page.addInitScript(() => {
  localStorage.setItem('auth_token', 'mock_consumer_token');
  localStorage.setItem('user_role', 'consumer');
});
```

### **Wait Strategies** [[CI-RCA]]
```typescript
// ✅ Stable: Element-based waits
await page.getByTestId('checkout-cta').waitFor({ timeout: 15000 });

// ❌ Flaky: API response waits
await page.waitForResponse('/api/products'); // Don't use
```

## 🚨 COMMON FAILURE PATTERNS & FIXES

### **1. "checkout-cta resolved to 0 elements"**
**Root Cause**: Empty cart state
**Fix**: Always use `seedCartWithProduct()` before checkout tests

### **2. Authentication Redirect Failures**
**Root Cause**: Auth token not set
**Fix**: Use proper test login setup with valid tokens

### **3. Quote Calculation Race Conditions**
**Root Cause**: Async shipping calculations not awaited
**Fix**: Use `waitForQuoteUpdate()` polling

### **4. Form Validation Timing Issues**
**Root Cause**: Browser vs React state timing mismatch
**Fix**: Add validation settling time (`waitForTimeout(1000)`)

### **5. CI Port Conflicts**
**Root Cause**: Wrong port expectations (3000 vs 3030)
**Fix**: Standardize on port 3030 (`PORT=3030 npm run dev`)

## 📊 TEST EXECUTION MODES

### **Local Development**
```bash
npx playwright test --grep="Guest checkout"  # Quick smoke test
npx playwright test --headed                 # Browser visible
npx playwright test --project=chromium       # Specific browser
```

### **CI Pipeline**
```yaml
- name: Run E2E tests
  run: npx playwright test
  env:
    NEXT_PUBLIC_E2E: true
    E2E_BASE_URL: http://127.0.0.1:3030
```

### **Debug Mode**
```bash
npx playwright test --debug       # Interactive debugging
npx playwright test --trace=on    # Generate trace files
npx playwright test --video=on    # Record video
```

## 🎯 SMOKE TEST SEQUENCE

### **Quick Health Check (3 tests, ~30 seconds)**
```bash
npx playwright test cart-summary.spec.ts
npx playwright test checkout.spec.ts --grep="Guest checkout"
npx playwright test auth.setup.ts
```

### **Full Suite (~5-10 minutes)**
```bash
npx playwright test --retries=2
```

## 📁 E2E FILE STRUCTURE

```
frontend/tests/e2e/
├── auth.setup.ts                     # Authentication storage states
├── cart-summary.spec.ts              # Cart functionality tests
├── checkout.spec.ts                  # Complete checkout flow
├── shipping-integration.spec.ts      # Shipping provider tests
└── utils/checkout.ts                 # Shared test utilities

frontend/.auth/
├── consumer.json                     # Pre-authenticated consumer
└── producer.json                    # Pre-authenticated producer
```

## 🔧 CONFIGURATION FILES

### **Main Config** (`playwright.config.ts`)
```typescript
baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3001',
use: { storageState: '.auth/consumer.json' },
retries: process.env.CI ? 2 : 0,
```

### **Local Overrides** (`playwright.config.local.ts`)
```typescript
forbidOnly: !!process.env.CI,
```

## ⚡ PERFORMANCE TARGETS

| Metric | Target | Actual |
|--------|--------|--------|
| **Total Suite Runtime** | <10 minutes | ~5-8 minutes |
| **Individual Test** | <2 minutes | ~30-60 seconds |
| **Pass Rate (CI)** | >80% | Variable (target) |

---

**Last Updated**: 2025-09-27 | **Test Count**: 10+ scenarios
**Related**: [[TESTIDS]], [[CI-RCA]], [[REGISTRY]], [[MAP]]
**Runbook Version**: v2.0 (Post-stabilization)