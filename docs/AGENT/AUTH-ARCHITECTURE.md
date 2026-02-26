# Auth Architecture — Quick Reference

> **Why this doc exists:** Dixis has two independent auth systems hitting the same Laravel backend.
> Every new endpoint must use the correct middleware, or you get silent 401s.
> This doc prevents the bug from PR #3195 (admin edit → 401) from recurring.

---

## Two Auth Systems

| Aspect | Admin Panel | Producer / Consumer |
|--------|------------|-------------------|
| **Identity** | Phone → OTP (6 digits) | Email + Password → Sanctum |
| **Token type** | HS256 JWT (`dixis_jwt` cookie) | Laravel Sanctum token (session cookie) |
| **Where token is created** | Next.js API route (`/api/admin/login`) | Laravel `auth/login` endpoint |
| **Laravel middleware** | `jwt.admin` + `admin` | `auth:sanctum` |
| **Middleware file** | `VerifyAdminJwt.php` | Laravel built-in Sanctum |
| **JWT payload** | `{ type: "admin", iss: "dixis-auth", phone: "..." }` | N/A (session-based) |
| **Session duration** | 24 hours | Until logout |
| **Rate limit** | 5 OTP requests / 15 min | Standard Laravel throttle |

## How Admin Auth Flows

```
Browser                    Next.js API Route              Laravel
  │                              │                           │
  ├─ POST /api/admin/login ──────►                           │
  │   (phone number)             │                           │
  │                              ├─ Generate OTP ──────────► │
  │                              │   Store in DB             │
  │  ◄── 200 "OTP sent" ────────┤                           │
  │                              │                           │
  ├─ POST /api/admin/verify ─────►                           │
  │   (phone + OTP code)         │                           │
  │                              ├─ Verify OTP               │
  │                              ├─ Sign JWT (HS256)         │
  │                              ├─ Set HttpOnly cookie      │
  │  ◄── 200 + dixis_jwt ───────┤   "dixis_jwt"             │
  │                              │                           │
  ├─ GET /api/admin/products ────►                           │
  │   (cookie: dixis_jwt)        │                           │
  │                              ├─ Read dixis_jwt cookie    │
  │                              ├─ Forward as Bearer ─────► │
  │                              │   Authorization header    ├─ VerifyAdminJwt
  │                              │                           │   middleware decodes
  │                              │                           │   JWT, sets Auth::user()
  │  ◄── 200 products ──────────┤ ◄── 200 ──────────────────┤
```

## Critical Rule: Choosing Middleware

```
IF endpoint is for admin panel:
  → Use Route::middleware(['jwt.admin', 'admin'])
  → In routes/api.php, inside prefix('admin/...')

IF endpoint is for producer/consumer:
  → Use Route::middleware(['auth:sanctum'])
  → In routes/api.php, standard auth group

NEVER mix them. Admin JWT ≠ Sanctum token.
```

## Where Admin Routes Live

### Laravel (`routes/api.php`)

```php
// Admin routes — jwt.admin middleware
Route::middleware(['jwt.admin', 'admin'])->prefix('admin/products')->group(function () {
    Route::get('pending', ...);
    Route::patch('{product}/moderate', ...);
    Route::patch('{product}', ...);  // Added PR #3195
});
```

### Next.js (API Routes)

```
frontend/src/app/api/admin/products/route.ts       → GET (list)
frontend/src/app/api/admin/products/[id]/route.ts   → PATCH (update)
frontend/src/app/api/admin/products/[id]/approve/    → POST (moderate)
frontend/src/app/api/admin/products/[id]/reject/     → POST (moderate)
```

Each Next.js admin API route:
1. Reads `dixis_jwt` cookie via `getSessionToken()`
2. Calls `getLaravelInternalUrl()` for the base URL
3. Forwards JWT as `Authorization: Bearer <token>` to Laravel
4. Laravel's `VerifyAdminJwt` middleware decodes and authenticates

## Common Gotchas

### 1. Admin PATCH/POST to wrong Laravel route → 401
**Symptom:** Admin GET works, but PATCH/POST returns `{"error":"Unauthenticated."}`
**Cause:** GET hits a public route (`/public/products`), PATCH hits `auth:sanctum` route
**Fix:** Ensure the PATCH route is under `jwt.admin` middleware in `routes/api.php`

### 2. LARAVEL_INTERNAL_URL already includes `/api/v1`
**Symptom:** 404 or double path like `/api/v1/api/v1/products`
**Cause:** Concatenating `/api/` to `getLaravelInternalUrl()` output
**Fix:** Use `laravelUrl('admin/products')` helper (see `src/lib/laravel/url.ts`)

### 3. Admin cookie name
The cookie is `dixis_jwt`, NOT `dixis_session` or `token`.
Read it with: `cookies().get('dixis_jwt')?.value`

## DB Whitelist

Admin access requires entry in `AdminUser` table (checked by `admin` middleware).
Phone number must be whitelisted before OTP login works.
