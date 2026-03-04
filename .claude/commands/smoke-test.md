# Production Smoke Test

Run this **after every deployment** to verify nothing is broken.

## Instructions

Run these checks in order. Report results as a table. If ANY check fails, investigate immediately before doing anything else.

### 1. Page Load Checks (HTTP status)

Test these URLs and expect HTTP 200:
- `https://dixis.gr/` (Homepage)
- `https://dixis.gr/products` (Products listing)
- `https://dixis.gr/producers` (Producers listing)
- `https://dixis.gr/cart` (Cart page)
- `https://dixis.gr/auth/admin-login` (Admin login)
- `https://dixis.gr/producers/login` (Producer login)

Note: `/producer/*` pages return 307 (redirect to login) when not authenticated — this is CORRECT.

### 2. API Health Checks

Test these APIs and verify data returns:
- `https://dixis.gr/api/v1/public/products` → should return `data[]` with products (>0)
- `https://dixis.gr/api/public/categories` → should return `categories[]` with items (>0)

**CRITICAL**: If categories returns 0 or error, the Prisma/DATABASE_URL connection is broken.

### 3. Infrastructure Checks (SSH to VPS)

SSH to `dixis-prod` and verify:
- `pm2 status` → `dixis-frontend` should be `online`
- `pm2 env <id> | grep DATABASE` → Should show full `postgresql://...` URL (NOT just a password fragment)
- `crontab -l | grep queue` → Should show queue:work cron entry
- `crontab -l | grep schedule` → Should show schedule:run cron entry
- Check PM2 logs for errors: `pm2 logs dixis-frontend --nostream --lines 20 | grep -i error`

### 4. Known Failure Patterns

If you see these errors, here are the fixes:

| Error | Root Cause | Fix |
|-------|-----------|-----|
| `prisma:error the URL must start with postgresql://` | DATABASE_URL is wrong in PM2 env | Fix `.env`, then `pm2 delete dixis-frontend && pm2 start npm --name dixis-frontend -- start && pm2 save` |
| `Module '@prisma/client' has no exported member 'PrismaClient'` | Prisma client not generated | `npx prisma generate` then rebuild |
| Categories returns 0 but DB has data | Same as Prisma URL issue | See above |
| Queue jobs stuck (0 processed) | No queue worker running | Check cron: `crontab -l \| grep queue` |
| PM2 `--update-env` doesn't fix env vars | PM2 caches env from first start | Must `pm2 delete` + `pm2 start` (not just restart) |

### 5. Deploy Checklist

Before deploying frontend changes:
1. SCP changed files to VPS
2. SSH to VPS: `cd /var/www/dixis/current/frontend`
3. `npx prisma generate` (ALWAYS, even if schema didn't change)
4. `NODE_OPTIONS='--max_old_space_size=2048' npx next build`
5. If build succeeds: `pm2 restart dixis-frontend`
6. Run this smoke test: `/smoke-test`
7. If ANY check fails, fix before moving on

For backend changes:
1. SCP changed PHP files to VPS `/var/www/dixis/current/backend/`
2. `php artisan cache:clear && php artisan config:clear && php artisan route:clear`
3. Run this smoke test

## Output Format

Present results as:
```
=== DIXIS SMOKE TEST ===
[1/10] Homepage:          200 ✅
[2/10] Products page:     200 ✅
...
[9/10] PM2 status:        online ✅
[10/10] Prisma DB:        connected ✅

Result: ALL PASS ✅ (or X FAILURES ❌)
```
