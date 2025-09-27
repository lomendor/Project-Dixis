# 🚩 ENVIRONMENT FLAGS REGISTRY

**Centralized Flag Configuration for Project-Dixis**

## 🎯 FRONTEND FLAGS (Next.js)

### **NEXT_PUBLIC_API_BASE_URL**
- **Purpose**: Backend API endpoint for frontend requests
- **Default**: `http://127.0.0.1:8001/api/v1`
- **Consumers**:
  - `frontend/src/lib/api.ts:130` - RAW_BASE constant
  - `frontend/src/lib/api.ts:147` - API client configuration
- **Environments**:
  - Local: `http://127.0.0.1:8001/api/v1`
  - Production: `https://api.projectdixis.com/api/v1` (when deployed)

### **NEXT_PUBLIC_SITE_URL**
- **Purpose**: Site URL for SEO and metadata
- **Default**: `https://projectdixis.com`
- **Consumers**:
  - `frontend/src/app/page.tsx:5` - Site metadata
- **Usage**: Used for canonical URLs, Open Graph tags

### **NEXT_PUBLIC_E2E**
- **Purpose**: Enable E2E testing mode features
- **Default**: `undefined` (disabled)
- **Consumers**:
  - Test utilities and development modes
  - E2E test setup and teardown
- **Usage**: `NEXT_PUBLIC_E2E=true npm run dev`

### **E2E_BASE_URL**
- **Purpose**: Base URL for Playwright E2E tests
- **Default**: `http://127.0.0.1:3001`
- **Consumers**:
  - `frontend/playwright.config.ts:27` - Test target URL
- **Usage**: E2E test execution target

### **PORT** (Implicit)
- **Purpose**: Next.js dev server port
- **Default**: `3000` (Next.js default), `3030` (project standard)
- **Consumers**: Next.js dev server
- **Usage**: `PORT=3030 npm run dev`

## 🔧 BACKEND FLAGS (Laravel)

### **APP_ENV**
- **Purpose**: Laravel application environment
- **Default**: `production`
- **Consumers**:
  - `backend/config/app.php:29` - Environment configuration
  - `backend/phpunit.xml:21` - Test environment
  - `backend/.env.testing:1` - Testing configuration
- **Values**: `local`, `testing`, `production`

### **ALLOW_TEST_LOGIN**
- **Purpose**: Enable test login endpoints for E2E testing
- **Default**: `false`
- **Consumers**:
  - `backend/routes/api.php:29` - Test route registration
  - `backend/app/Http/Controllers/Api/TestLoginController.php:71` - Endpoint guard
- **Security**: Only active in testing/local/CI environments

### **DB_PORT**
- **Purpose**: PostgreSQL database port
- **Default**: `5432`
- **Consumers**:
  - `backend/.env.example:26` - Database configuration template
  - `backend/.env.testing:6` - Test database setup
- **Usage**: Database connection configuration

### **CI_ALLOW_ACS_PROVIDER_TESTS**
- **Purpose**: Enable ACS shipping provider integration tests in CI
- **Default**: `undefined` (disabled)
- **Consumers**:
  - `backend/tests/Unit/Http/Controllers/Api/ShippingControllerWiringTest.php:255`
  - `backend/tests/Feature/Http/Controllers/Api/ShippingProviderIntegrationTest.php:402`
- **Usage**: External service integration testing control

## 🎛️ CI/CD FLAGS

### **CI**
- **Purpose**: Detect CI environment execution
- **Default**: `undefined` (local), `true` (CI)
- **Consumers**:
  - `frontend/playwright.config.ts:3` - CI-specific test configuration
  - `frontend/playwright.config.local.ts:6` - forbidOnly configuration
  - Various test skipping logic
- **Usage**: Automatic in GitHub Actions

### **PLAYWRIGHT_BASE_URL**
- **Purpose**: Override Playwright test base URL
- **Default**: `undefined` (uses E2E_BASE_URL)
- **Consumers**: Playwright configuration
- **Usage**: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3030 npx playwright test`

## 🔄 DEVELOPMENT WORKFLOW FLAGS

### **Testing Environment Setup**
```bash
# Backend testing
APP_ENV=testing php artisan test

# Frontend E2E testing
NEXT_PUBLIC_E2E=true npm run dev
E2E_BASE_URL=http://127.0.0.1:3030 npx playwright test

# CI-like testing
CI=true npm run test
```

### **Local Development Stack**
```bash
# Backend
APP_ENV=local php artisan serve --port=8001

# Frontend
PORT=3030 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api/v1 npm run dev
```

## 🚨 CRITICAL FLAGS MATRIX

| Flag | Environment | Required | Default | Impact if Missing |
|------|-------------|----------|---------|-------------------|
| `APP_ENV` | All | ✅ | `production` | Wrong config loaded |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | ⚠️ | localhost:8001 | API calls fail |
| `ALLOW_TEST_LOGIN` | Testing | ✅ | `false` | E2E auth fails |
| `E2E_BASE_URL` | E2E | ⚠️ | localhost:3001 | Tests target wrong port |
| `CI` | CI/CD | ✅ | `false` | Wrong test behavior |

## 🔒 SECURITY CONSIDERATIONS

### **Public vs Private Flags**
- **NEXT_PUBLIC_\*** → Exposed to browser (client-side)
- **APP_ENV, ALLOW_\*** → Server-side only
- **CI_\*** → CI environment only

### **Sensitive Flag Patterns** [[FILTERS]]
```bash
# Never expose in logs/docs
API_KEY=***
DB_PASSWORD=***
JWT_SECRET=***

# Safe to document
APP_ENV=testing
NEXT_PUBLIC_API_BASE_URL=http://...
ALLOW_TEST_LOGIN=true
```

## 📁 FLAG CONFIGURATION FILES

### **Frontend Configuration**
- `.env.local` (local development)
- `.env.production` (production build)
- `next.config.js` (Next.js configuration)

### **Backend Configuration**
- `.env` (local development)
- `.env.testing` (test environment)
- `.env.example` (template)
- `config/app.php` (Laravel config)

### **E2E Testing Configuration**
- `playwright.config.ts` (main config)
- `playwright.config.local.ts` (local overrides)
- `.github/workflows/pr.yml` (CI environment)

---

**Last Updated**: 2025-09-27 | **Total Flags**: 12 documented
**Related**: [[MAP]], [[E2E]], [[CI-RCA]], [[FILTERS]]
**Source Files**: Found via `grep -r "NEXT_PUBLIC_\|APP_ENV\|ALLOW_" ./`