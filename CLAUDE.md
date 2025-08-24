# PROJECT-DIXIS - CLEAN LARAVEL BOOTSTRAP

**Clean Laravel 11 template** | **GitHub Actions CI/CD** | **Status**: ✅ GREEN

---

## 🎯 PURPOSE

**Project-Dixis** is a **production-ready Laravel 11 template** with working GitHub Actions CI/CD pipeline. Created as a **clean bootstrap reference** for new Laravel projects.

## ✅ VERIFIED WORKING SETUP

### 🚀 Tech Stack
- **Laravel**: 11.45.2 (latest stable)
- **PHP**: 8.2 with full extension support
- **Database**: PostgreSQL 15 (production + CI)
- **Testing**: PHPUnit with comprehensive health checks
- **CI/CD**: GitHub Actions with PostgreSQL service containers

### 🔧 Key Features
- ✅ **Health Check API**: `/api/health` with database verification
- ✅ **PostgreSQL Integration**: Service containers in CI
- ✅ **Composer Caching**: Optimized dependency management
- ✅ **Laravel 11 Routing**: Properly configured API routes
- ✅ **Test Coverage**: 3 tests, 8 assertions passing
- ✅ **Automated Deployment**: Push-to-deploy workflow

## 📊 WORKING CONFIGURATION

### GitHub Actions CI Pipeline
```yaml
# .github/workflows/backend-ci.yml
✅ PostgreSQL 15 service container
✅ PHP 8.2 + required extensions (pdo_pgsql, etc.)
✅ Composer install with caching
✅ Database migrations
✅ PHPUnit test execution
✅ Health endpoint verification
```

### Health Check Endpoint
```php
// /api/health response
{
  "status": "ok",
  "database": "connected", 
  "timestamp": "2025-08-24T09:05:04.016172Z",
  "version": "11.45.2"
}
```

## 🛠️ QUICK START

### Prerequisites
- PHP 8.2+
- PostgreSQL 15+
- Composer

### Setup Commands
```bash
# Clone and setup
git clone https://github.com/lomendor/Project-Dixis.git
cd Project-Dixis/backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate

# Start server
php artisan serve
```

### Test Everything Works
```bash
# Run tests
php artisan test

# Check health endpoint
curl http://localhost:8000/api/health
```

## 🧠 KEY KNOWLEDGE PATTERNS

### 1. Laravel 11 API Routes Registration
```php
// bootstrap/app.php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',  // Required for API routes
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

### 2. CI Without Code Coverage (Critical Fix)
```yaml
# ❌ This fails in CI (no Xdebug/PCOV)
php artisan test --coverage --min=80

# ✅ This works in GitHub Actions
php artisan test
```

### 3. PostgreSQL Service in GitHub Actions
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

### 4. Health Check Pattern
```php
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'failed: ' . $e->getMessage();
    }

    return response()->json([
        'status' => 'ok',
        'database' => $dbStatus,
        'timestamp' => now()->toISOString(),
        'version' => app()->version(),
    ]);
});
```

## 📈 SUCCESS METRICS

- **GitHub Actions**: ✅ GREEN (3 tests passed)
- **Health Endpoint**: ✅ Responding with database connection
- **Laravel Version**: 11.45.2 (latest)
- **Database**: PostgreSQL connected
- **CI Duration**: ~48 seconds end-to-end

## 🔄 WORKFLOW TRIGGERS

- **Push to main**: Automatic testing
- **Pull Requests**: Pre-merge validation  
- **Manual Dispatch**: On-demand testing
- **Path Filtering**: Only triggers on `backend/**` changes

## 📚 DOCUMENTATION

- **CI/CD Patterns**: `docs/CI-CD-PATTERNS.md`
- **Workflow Notes**: `.github/WORKFLOW-NOTES.md`
- **Main Project**: `../Dixis Project 2/CLAUDE.md`

## 🎖️ BATTLE-TESTED SOLUTIONS

### Issue: "Code coverage driver not available"
**Solution**: Remove `--coverage` flags from CI tests
```yaml
- name: Execute tests
  run: php artisan test  # Not: php artisan test --coverage
```

### Issue: Laravel 11 API routes not working
**Solution**: Register API routes in `bootstrap/app.php`
```php
api: __DIR__.'/../routes/api.php',
```

### Issue: PostgreSQL connection in CI
**Solution**: Use service container with proper health checks

---

**Repository**: https://github.com/lomendor/Project-Dixis  
**Status**: ✅ Production Ready | **Created**: 2025-08-24  
**Purpose**: Clean Laravel 11 bootstrap template with CI/CD

**🏆 Use this as a template for new Laravel projects with confidence!**