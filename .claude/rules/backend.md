# Backend Rules (Laravel 11 + PostgreSQL 15)

Applies when working on `backend/` files.

## Architecture
- **Product SSOT**: All product data lives in Laravel/PostgreSQL. Frontend only proxies.
- **Auth**: Sanctum for session auth + CSRF tokens (customers/producers).
- **Admin auth**: Separate JWT flow (Phone OTP). AdminUser table whitelist.
- **API prefix**: `/api/v1` — all routes behind this prefix.

## Deployment
- Backend served via PHP-FPM unix socket (nginx proxies `/api/*`).
- Port 8001 for local dev (`php artisan serve --port=8001`).
- Production: nginx routes `/api/*` -> Laravel, everything else -> Next.js.

## Database
- PostgreSQL 15 (Neon) — production + staging + local dev.
- Migrations in `database/migrations/`.
- No raw SQL with PostgreSQL-specific syntax that would break frontend's SQLite CI.
