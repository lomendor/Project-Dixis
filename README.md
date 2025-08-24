# Project-Dixis

Clean Laravel 11 backend with GitHub Actions CI/CD pipeline.

## Features

- ✅ Laravel 11.45.2
- ✅ PostgreSQL support
- ✅ Health check endpoint (`/api/health`)
- ✅ PHPUnit tests
- ✅ GitHub Actions CI pipeline

## Quick Start

```bash
# Install dependencies
cd backend
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

## Health Check

```bash
curl http://localhost:8000/api/health
```

## Tests

```bash
cd backend
php artisan test
```

## CI/CD

GitHub Actions automatically runs tests on:
- Push to main branch
- Pull requests to main branch
- Manual workflow dispatch

Status: ![CI](https://github.com/lomendor/Project-Dixis/workflows/Backend%20CI/badge.svg)