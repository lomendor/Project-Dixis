# Frontend Rules (Next.js 15 + React 19)

Applies when working on `frontend/` files.

## Architecture
- **Product data SSOT is Laravel**. Frontend proxies via `apiClient` (`src/lib/api.ts`). Never create Prisma product models.
- **PrismaClient**: Single singleton at `@/lib/db/client`. NEVER `new PrismaClient()`.
- **Cart**: Zustand store + server sync, keyed by Laravel integer IDs. `clearCartStorage()` on login/logout.
- **Categories**: 10 unified slugs. `toStorefrontSlug()` bridge in `category-map.ts`.
- **i18n**: Single `i18n.ts` config + `messages/` directory (el.json, en.json). NOT an `i18n/` directory.

## Auth
- **Customer/Producer**: Email + password, Sanctum (client-side, cookie-based), `useAuth` hook, `AuthGuard.tsx` wrapper.
- **Admin**: Phone OTP (6 digits) -> JWT in HttpOnly cookie `dixis_jwt` -> `requireAdmin()` server-side check.
- Admin cookie was renamed from `dixis_session` to `dixis_jwt` to avoid collision with Laravel session.
- **Never mix patterns**: Producer auth = client-side (Sanctum), admin auth = server-side (JWT).

## Common Pitfalls
- `LARAVEL_INTERNAL_URL` already includes `/api/v1`. Use `laravelUrl('path')` from `@/lib/laravel/url`.
- Worktree builds may fail with Prisma errors — always `npx prisma generate` first.
- No `mode: 'insensitive'` or other PG-only features (breaks SQLite CI).
- Greek locale everywhere: `el-GR` for dates/currency, 5-digit postal codes, AFM 9-digit.
- `/my/*` routes are redirect stubs to `/producer/*`. All implementations live at `/producer/*`.

## Conventions
- Standalone output mode for PM2 deployment.
- Admin layout pattern: copy from `src/app/admin/components/AdminShell.tsx`.
- Producer routes: `/producer/*` (dashboard, orders, products, settings, analytics, settlements).
