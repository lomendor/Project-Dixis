# CLAUDE.md — Project Dixis (concise guide for Claude Code)

## Objectives
- Keep backend (Laravel, Postgres) + frontend (Next.js) consistent.
- Make CI green and keep it green.
- Prefer minimal diffs, idempotent DB patches, and stable E2E tests.

## Invariants (treat as source of truth)
- API base URL (local & CI): `http://127.0.0.1:8001/api/v1`
- Frontend dev port: `3001`
- Database: **PostgreSQL** only (no SQLite fallbacks)
- Playwright artifacts: **save screenshots/videos only on failure**, retain 3 days
- One server rule: πριν σηκώσεις οτιδήποτε, κλείσε πόρτες 3001/8001

## Folder layout (monorepo)
- `backend/` → Laravel API
- `backend/frontend/` → Next.js app
- `.github/workflows/` → CI (backend-ci.yml, frontend-ci.yml)
- `backend/frontend/tests/e2e/` → Playwright specs

## Backend rules (Laravel + Postgres)
- Use `.env` (local) and GH Actions job env (CI) με:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=project_dixis_local # CI: project_dixis_test
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

- **Migrations**:
  - `create_*` migrations: **χωρίς** FKs.
  - Foreign keys μπαίνουν **σε later migration** και πάντα **idempotent**:
    - `ALTER TABLE … DROP CONSTRAINT IF EXISTS …;` μετά `ADD CONSTRAINT …`.
  - Patch columns με `Schema::hasColumn` guards (π.χ. money `decimal(10,2)`).
- **Seeders**:
  - Μην αλλάζεις enums/constraints για να "χωρέσουν" seed values. Διόρθωσε τους seeders.
  - Αν χρειάζεται slug/unique, φτιάξε το στη δημιουργία (ή model booted()).

## Frontend rules (Next.js)
- **API URL join**: χρησιμοποίησε helper που καθαρίζει slashes, ώστε:
  - `apiUrl('public/products')` → `http://127.0.0.1:8001/api/v1/public/products`
- **Do not** σκληροκωδικοποιείς `api/v1/api/v1`. Πάντα relative paths στον helper.
- Αν πρέπει να τρέξει σε single port dev, κλείσε πρώτα ό,τι τρέχει σε 3000/3001.

## E2E (Playwright) rules
- Περιμένουμε **κατάστασεις UI** (data-testid) — όχι αυθαίρετα timeouts.
- Αν αποτυγχάνει για 404/empty data:
  - Έλεγξε ότι τρέχει backend στο 8001 **και** ότι `NEXT_PUBLIC_API_BASE_URL` δείχνει σωστά.
- Artifacts:
```ts
use: {
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure'
}
```

## Runbooks

### Pre-flight (local, once per session)
1. Κλείσε πόρτες:
```bash
lsof -ti :3001 | xargs kill -9 || true
lsof -ti :8001 | xargs kill -9 || true
```

2. Backend:
```bash
cd backend
cp -n .env.example .env || true
php artisan key:generate || true
createdb -h 127.0.0.1 -U postgres project_dixis_local 2>/dev/null || true
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8001
```

3. Frontend:
```bash
cd backend/frontend
npm install
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8001/api/v1" npm run dev -- -p 3001
```

### E2E locally
```bash
cd backend/frontend
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8001/api/v1" npx playwright test
```

## CI expectations
- `backend-ci.yml`: στήνει Postgres service, γράφει testing .env, τρέχει migrate:fresh --seed, tests.
- `frontend-ci.yml`:
  - Σηκώνει API (Laravel) σε 8001 (artisan serve & migrate fresh)
  - Τρέχει Next build ή dev server (προτιμότερο next build && next start για σταθερά timings)
  - NEXT_PUBLIC_API_BASE_URL περασμένο στο job env
  - Playwright με artifacts only-on-failure

## When something fails
- **404 on products**: πιθανό διπλό prefix ή λάθος base. Δες helper + env.
- **42703 column missing**: πρόσθεσε 1 idempotent patch migration, μόνο αυτό.
- **42710 duplicate FK/index**: DROP IF EXISTS πριν το ADD.
- **Not null violation σε seeders**: φτιάξε τον seeder, όχι το constraint.

## Quick commands
```bash
# Kill and restart everything
lsof -ti :3001,:8001 | xargs kill -9; cd backend && php artisan serve --port=8001 &
cd backend/frontend && npm run build && npm start -- -p 3001

# Run specific test suite  
npx playwright test mobile-navigation.spec.ts --project=chromium

# Check API health
curl http://localhost:8001/api/health

# Fresh database
php artisan migrate:fresh --seed
```

## Key files
- `backend/.env` - Database config
- `backend/frontend/src/lib/api.ts` - API client με apiUrl helper
- `backend/frontend/playwright.config.ts` - E2E test config
- `.github/workflows/` - CI/CD workflows
- `backend/database/seeders/` - Test data setup