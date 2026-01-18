# Pass OPS-PM2-01

**When**: 2026-01-15 00:00 UTC

## What

Fix deploy-frontend workflow false-fails caused by OPS-PM2-01 20x curl proof starting before Next.js is ready.

## Why

Deploy runs were failing at OPS-PM2-01 even though the app was healthy:
- Next.js startup takes 25-30s
- 20x proof started immediately after PM2 start
- First few requests returned 000 (connection refused)
- Workflow failed with NO_LISTENER_3000

Additionally, .env was being wiped on each deploy, losing manually-set keys like `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## How

1. Added WAIT_FOR_3000 readiness gate (90s max, 18 attempts × 5s)
2. Changed .env handling from wipe to upsert (preserve existing keys)
3. Merged PR #2203
4. Re-added STRIPE key to VPS (wiped by previous deploy)
5. Triggered deploy-frontend workflow

## Verification

| Deploy | Result | Notes |
|--------|--------|-------|
| Run 21014160709 | ✅ PASS | All steps passed including OPS-PM2-01 |

**Deploy run**: https://github.com/lomendor/Project-Dixis/actions/runs/21014160709

### Prod Sanity Checks (all pass)

| Endpoint | Result |
|----------|--------|
| `https://dixis.gr/` | 200 OK, HTML |
| `/api/v1/public/products` | 200 OK, JSON (5 products) |

## Definition of Done

- [x] deploy-frontend runs PASS with new WAIT_FOR_3000 gate
- [x] OPS-PM2-01 20x proof passes (all 200/204)
- [x] .env preserves manually-set keys
- [x] Prod endpoints healthy

## PRs

| PR | Title | Status |
|----|-------|--------|
| #2203 | fix: deploy-frontend OPS-PM2-01 false-fail (readiness gate + env upsert) | MERGED |
