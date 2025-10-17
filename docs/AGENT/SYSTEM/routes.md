# App Routes

## Pages

- `/`
- `/(storefront)/cart`
- `/(storefront)/checkout`
- `/(storefront)/products`
- `/(storefront)/products/[id]`
- `/account/orders`
- `/account/orders/[orderId]`
- `/admin` (BASIC_AUTH=1 guard)
- `/admin/analytics` (BASIC_AUTH=1 guard)
- `/admin/orders` (BASIC_AUTH=1 guard)
- `/admin/orders/[id]` (BASIC_AUTH=1 guard)
- `/admin/pricing` (BASIC_AUTH=1 guard)
- `/admin/producers` (BASIC_AUTH=1 guard)
- `/admin/producers/images` (BASIC_AUTH=1 guard)
- `/admin/products` (BASIC_AUTH=1 guard)
- `/admin/toggle` (BASIC_AUTH=1 guard)
- `/auth/login`
- `/auth/register`
- `/checkout/confirmation`
- `/checkout/flow`
- `/checkout/payment`
- `/dev-check`
- `/dev/notifications`
- `/my/orders`
- `/my/products`
- `/my/products/[id]/edit`
- `/my/products/create`
- `/ops/metrics`
- `/order/confirmation/[orderId]`
- `/orders/[id]`
- `/orders/lookup`
- `/orders/track`
- `/orders/track/[id]`
- `/producer/analytics`
- `/producer/dashboard`
- `/producer/onboarding`
- `/producer/orders`
- `/producer/products`
- `/producer/products/[id]/edit`
- `/producer/products/create`
- `/product/[id]`
- `/test-error`

## API Routes

### Public
- `POST /api/orders` (rate-limited: 60/min in prod)
  - Creates checkout order (Prisma + in-memory fallback)
- `POST /api/checkout/quote` (rate-limited: 60/min in prod)
  - Generates shipping quote
- `POST /api/checkout/session` (rate-limited: 30/min in prod)
  - Creates mock payment session

### Admin (BASIC_AUTH=1)
- `GET /api/admin/orders`
  - Lists recent orders (Prisma + in-memory fallback)
- `GET /api/admin/orders/[id]`
  - Fetches single order by ID (Prisma + in-memory fallback)

### CI/Dev
- `POST /api/ci/devmail/send` (rate-limited: 30/min in prod)
  - Dev mailbox capture (SMTP_DEV_MAILBOX=1)
- `GET /api/ci/devmail/list`
  - Lists dev mailbox messages

## Middleware

**Security Headers** (all routes):
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`

**Admin Guard** (prod-only):
- `/admin/*` requires `BASIC_AUTH=1` or returns 404

## Helpers

- `adminGuard.ts` - BASIC_AUTH=1 check
- `rateLimit.ts` - Token-bucket rate limiting (prod-only)
- `prismaSafe.ts` - Safe Prisma client singleton
- `orderStore.ts` - In-memory order fallback
