# Testing & CI

## Local
```bash
# API
cd backend && php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8001 &

# FE (prod-like)
cd backend/frontend && npm run build
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8001/api/v1" npm start -- -p 3001 &

# E2E
npx playwright test --reporter=line
```

## CI Order
1. `type-check` (npm run type-check)
2. build FE/API
3. wait-on 127.0.0.1:8001 & 127.0.0.1:3001
4. E2E (npx playwright test)

## Playwright Conventions
- Retries: `retries: process.env.CI ? 2 : 0`
- Selectors: role/label-based (avoid brittle text)
- Auth edge-case: clear cookies/session before 2nd attempt

```typescript
await page.context().clearCookies();
await page.reload();
```

## Seed Data
- E2ESeeder includes Greek products used by tests.
- Idempotent: safe to run multiple times.

## Reports
- Always upload Playwright report as CI artifact on failure.