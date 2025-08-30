# Project-Dixis

![CI Status](https://github.com/lomendor/Project-Dixis/actions/workflows/backend-ci.yml/badge.svg)

**Modern Laravel 11 API** for agricultural marketplace connecting producers and consumers.

## 📋 Overview

Project-Dixis is a production-ready Laravel 11 backend API that facilitates connections between agricultural producers and consumers. Built with modern PHP practices, comprehensive testing, and automated CI/CD.

### 🛠️ Tech Stack

- **Framework**: Laravel 11.45.2
- **PHP**: 8.2+
- **Database**: PostgreSQL 15 (production), SQLite (local testing)
- **Authentication**: Laravel Sanctum
- **Testing**: PHPUnit with Feature tests
- **CI/CD**: GitHub Actions
- **Documentation**: OpenAPI 3.0

### ✨ Features

- **Products API**: Browse and search agricultural products with filters ([PR #6](https://github.com/lomendor/Project-Dixis/pull/6))
- **Producer System**: KPIs, product toggle, messaging integration ([PR #7](https://github.com/lomendor/Project-Dixis/pull/7))
- **Orders API**: Place and manage orders with authentication
- **Producer Management**: Dashboard KPIs, top products analytics
- **Health Check**: System status monitoring
- **Database Migrations**: PostgreSQL/SQLite compatible
- **Comprehensive Testing**: 51 tests / 359 assertions GREEN

## 🚀 Quick Start

### Prerequisites

- PHP 8.2 or higher
- Composer
- PostgreSQL 15+ (production) or SQLite (development)

### Installation

```bash
# Clone repository
git clone https://github.com/lomendor/Project-Dixis.git
cd Project-Dixis/backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate:fresh --seed

# Start development server
php artisan serve
```

### Testing

```bash
# Run all tests
php artisan test

# Run MVP feature tests only
php artisan test --testsuite=Feature --group mvp

# Run with coverage (requires Xdebug/PCOV)
php artisan test --coverage
```

### E2E Testing & Debugging 🎭

**Run Playwright E2E Tests**
```bash
cd backend/frontend

# Install Playwright browsers
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test shipping-integration.spec.ts

# Run with UI mode (local development)
npx playwright test --ui
```

**πώς ανοίγω trace (Debugging Failed Tests)**

When E2E tests fail in CI, comprehensive artifacts are automatically uploaded:

1. **Download Artifacts from GitHub**:
   - Go to the failed Actions run → "Summary" tab
   - Download `e2e-traces-[run-id]-[branch]` artifact

2. **Open Trace Viewer**:
   ```bash
   # Extract the downloaded zip
   unzip e2e-traces-[run-id]-[branch].zip
   
   # Open specific test trace
   npx playwright show-trace test-results/[test-name]/trace.zip
   ```

3. **Open HTML Report** (Overview of all tests):
   ```bash
   # Download playwright-report-[run-id]-[branch] artifact
   unzip playwright-report-[run-id]-[branch].zip
   
   # Open interactive HTML report
   npx playwright show-report playwright-report/
   ```

4. **Trace Viewer Features**:
   - **Timeline**: Visual step-by-step execution
   - **Screenshots**: Before/after each action
   - **Network**: API calls and responses  
   - **Console**: Browser logs and errors
   - **DOM**: Page state at each step

4. **Local Debugging**:
   ```bash
   # Run with trace debugging enabled
   npx playwright test --trace on
   
   # Debug mode (opens browser)
   npx playwright test --debug
   
   # Open last trace
   npx playwright show-trace test-results/[latest]/trace.zip
   ```

**Artifact Retention**:
- ✅ **Success runs**: 3 days (traces + HTML reports)
- ❌ **Failed runs**: 7 days (full artifacts + media)
- 🎥 **Videos/Screenshots**: Only on failures (7 days)
- 📊 **HTML Reports**: Always available (3-7 days)

## 📡 API Documentation

### Base URL
```
http://localhost:8001/api/v1
```

### Health Check
```bash
curl http://localhost:8001/api/health
```

### Products

**List Products**
```bash
curl -X GET "http://localhost:8001/api/v1/products" \
     -H "Accept: application/json"
```

**Get Product**
```bash
curl -X GET "http://localhost:8001/api/v1/products/{id}" \
     -H "Accept: application/json"
```

### Orders (Authentication Required)

**Create Order**
```bash
curl -X POST "http://localhost:8001/api/v1/orders" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{
       "items": [
         {
           "product_id": 1,
           "quantity": 2
         }
       ],
       "shipping_method": "HOME",
       "notes": "Please call before delivery"
     }'
```

**Get Order**
```bash
curl -X GET "http://localhost:8001/api/v1/orders/{id}" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Authentication

Use Laravel Sanctum for API authentication. After seeding, check logs for demo user token.

## 📚 Documentation

- **API v1 Endpoints**: [`backend/docs/API.md`](backend/docs/API.md)
- **OpenAPI Spec**: [`backend/docs/openapi.yml`](backend/docs/openapi.yml) 
- **Postman Collection**: [`backend/docs/collections/`](backend/docs/collections/)
- **Release v0.2.0**: [Producer System Integration](https://github.com/lomendor/Project-Dixis/releases/tag/v0.2.0)

## 🔧 Development

### Database Migrations

All migrations are database-agnostic and work with both PostgreSQL and SQLite:

```bash
# Fresh migration with seeding
php artisan migrate:fresh --seed

# Rollback
php artisan migrate:rollback
```

### Seeding

Seeders are idempotent and safe to run multiple times:

```bash
php artisan db:seed
```

### API Testing

The application includes comprehensive feature tests:

```bash
# Test specific endpoints
php artisan test tests/Feature/Api/V1/ProductsTest.php
php artisan test tests/Feature/Api/V1/OrdersTest.php
```

## 🚦 CI/CD

GitHub Actions automatically:
- Runs tests on PostgreSQL
- Validates code quality
- Generates OpenAPI artifacts
- Maintains green build status

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**🏆 Production-ready Laravel 11 template with PostgreSQL CI/CD**