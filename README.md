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
- **CI/CD**: GitHub Actions with intelligent noise reduction
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
- Node.js 18+ (see `.nvmrc`)
- PostgreSQL 15+ (production) or SQLite (development)

### Repository Setup

This is the **main Project-Dixis repository**. Always work from this directory:

```bash
# Clone the main repository (NOT worktrees)
git clone https://github.com/lomendor/Project-Dixis.git
cd Project-Dixis

# Verify you're in the correct repo
pwd  # Should be: .../Project-Dixis
git remote -v  # Should show origin pointing to Project-Dixis

# Use correct Node version
nvm use  # Reads from frontend/.nvmrc
```

⚠️ **Important**: Do NOT work in worktree directories like `GitHub-Dixis-Project-1/`. Always use the main `Project-Dixis/` directory.

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

## 🔄 CI/CD Local Testing

To run the same checks that GitHub Actions performs:

### Full CI Pipeline Locally

```bash
# 1. Backend testing
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan test
php artisan serve --host=127.0.0.1 --port=8001 &

# 2. Frontend testing (separate terminal)
cd frontend
npm ci
npm run type-check
npm run build
npm run start &

# 3. E2E testing (separate terminal)
cd frontend
npx wait-on http://127.0.0.1:8001/api/health http://127.0.0.1:3001 --timeout 60000
npm run e2e

# 4. Lighthouse testing (optional)
npm install -g @lhci/cli
lhci autorun --collect.url=http://127.0.0.1:3001
```

### Port Configuration

**⚠️ CRITICAL**: Always use these ports to match CI environment:

- Backend API: `127.0.0.1:8001`
- Frontend: `127.0.0.1:3001`
- DO NOT use `:3000` or `:8000` (legacy ports)

### Environment Variables

```bash
# Frontend .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api/v1
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3001

# Backend .env (PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dixis_test
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

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

### Automated Workflows
GitHub Actions automatically:
- **Backend Testing**: PHPUnit on PostgreSQL 15
- **Frontend Testing**: TypeScript compilation + builds  
- **E2E Testing**: Playwright with comprehensive artifacts (traces, videos, screenshots)
- **Performance Monitoring**: Lighthouse CI on key pages (soft warnings)
- **Code Quality**: DangerJS gatekeeper with soft warnings
- **OpenAPI**: Documentation generation and validation

### Quality Gates (Soft Mode)
Our CI/CD includes gentle guidance without blocking:

#### 🎭 **Playwright Artifacts** (TOOLS-01)
- Complete debugging artifacts on failures
- Trace files, videos, and screenshots
- Retention: 7 days (failure) / 3 days (success)

#### 🔍 **Lighthouse CI** (TOOLS-02)  
- Performance monitoring on 4 key pages
- Thresholds: Performance ≥75%, Accessibility ≥90%
- Desktop preset with comprehensive reports

#### 🎯 **DangerJS Gatekeeper** (TOOLS-03)
- PR size warnings (>300 LOC)
- Port compliance monitoring (8001/3001 enforcement)
- Version pinning validation (Next.js 15.5.0)
- Missing test coverage reminders
- Configuration change alerts

All quality gates operate in **soft mode** - providing warnings and guidance without blocking merges.

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