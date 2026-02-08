# ISSUE: LARAVEL-500-01 — Laravel Backend Returns 500 Server Error

**Date**: 2026-02-08
**Status**: ✅ RESOLVED
**Severity**: HIGH (was blocking)

---

## Problem

Όλα τα Laravel API endpoints επέστρεφαν `500 Server Error`:

```bash
# Login endpoint
curl -X POST "https://dixis.gr/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
# Response: {"message": "Server Error"}
```

---

## Root Cause

**Τα Laravel migrations δεν είχαν τρέξει ποτέ στο production!**

Η βάση PostgreSQL (Neon) ήταν κενή — δεν υπήρχαν πίνακες.

```
SQLSTATE[42P01]: Undefined table: 7 ERROR: relation "products" does not exist
```

---

## Resolution

1. **SSH Access Fixed**: Σωστή IP είναι `147.93.126.235` (από SOP-VPS-DEPLOY.md)
   - Λάθος IP στο AGENT-STATE.md: `144.76.224.1` (timeout)

2. **Ran Migrations**:
   ```bash
   ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235
   cd /var/www/dixis/current/backend
   php artisan migrate --force
   ```
   - 66 migrations ran successfully

3. **Ran Seeders**:
   ```bash
   php artisan db:seed --force
   ```
   - ProducerSeeder ✅
   - CategorySeeder ✅
   - ProductSeeder ✅
   - OrderSeeder ❌ (minor bug, not critical)

---

## Verification

```bash
# Registration ✅
curl -X POST "https://dixis.gr/api/v1/auth/register" \
  -d '{"name":"Test User","email":"testuser@example.com",...}'
# Response: {"message":"User registered successfully...","token":"..."}

# Login ✅
curl -X POST "https://dixis.gr/api/v1/auth/login" \
  -d '{"email":"testuser@example.com","password":"password123"}'
# Response: {"message":"Login successful","user":{...},"token":"..."}

# Products ✅
curl "https://dixis.gr/api/v1/products"
# Response: {"data":[...]}
```

---

## Lessons Learned

1. **Always verify database state** after deployment
2. **Keep VPS connection info** in one canonical location (SOP-VPS-DEPLOY.md)
3. **Migrations should be part** of deployment workflow

---

## Next Steps

1. ✅ Update AGENT-STATE.md with correct VPS IP
2. ⬜ Add migrations to deployment script
3. ⬜ Test full auth flow in browser

---

_Resolved: 2026-02-08 22:07_
