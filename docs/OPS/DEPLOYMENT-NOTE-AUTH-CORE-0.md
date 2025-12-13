# Deployment Note: AUTH-CORE-0 Fix

**Date**: 2025-12-10
**Issue**: Register/Login not working on production (dixis.gr)
**Status**: ✅ FIXED (code changes only, VPS deployment required)

---

## 🔴 **CRITICAL: VPS Deployment Required**

Το production frontend στο VPS **ΠΡΕΠΕΙ** να ενημερώσει το `.env` file με το σωστό API URL.

### Current (BROKEN) State

```bash
# ❌ WRONG - this subdomain doesn't exist
NEXT_PUBLIC_API_BASE_URL=https://api.dixis.gr/api/v1
```

### Required Fix

```bash
# ✅ CORRECT - backend is on main domain
NEXT_PUBLIC_API_BASE_URL=https://dixis.gr/api/v1
```

---

## 📋 Deployment Steps (On VPS)

### Step 1: SSH to VPS

```bash
ssh -i ~/.ssh/dixis_prod_ed25519 root@147.93.126.235
```

### Step 2: Update Frontend .env

```bash
cd /var/www/dixis/current/frontend

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update API URL
sed -i 's|https://api\.dixis\.gr/api/v1|https://dixis.gr/api/v1|g' .env

# Verify change
grep NEXT_PUBLIC_API_BASE_URL .env
```

**Expected Output:**
```
NEXT_PUBLIC_API_BASE_URL=https://dixis.gr/api/v1
```

### Step 3: Rebuild + Restart Frontend

```bash
# Option A: Full rebuild (slower but safer)
cd /var/www/dixis/current/frontend
pnpm build
pm2 restart ecosystem.production

# Option B: Just restart if .env is loaded at runtime (faster)
pm2 restart ecosystem.production
```

### Step 4: Verify Fix

```bash
# Test register endpoint from VPS
curl -X POST https://dixis.gr/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@dixis.test","password":"password123","password_confirmation":"password123","role":"consumer"}'

# Should return 201 Created with user + token
```

**From browser**: Open https://dixis.gr/auth/register and try to create account

---

## 🔍 Verification Checklist

- [ ] `.env` file updated with correct URL
- [ ] Frontend rebuilt (if needed)
- [ ] PM2 restarted
- [ ] Register page loads without errors
- [ ] Register form submission works (check Network tab)
- [ ] No NXDOMAIN errors in console
- [ ] Success toast appears after registration
- [ ] Login works with newly created account

---

## 🛠️ Troubleshooting

### If still getting NXDOMAIN errors:

```bash
# Check if .env was actually updated
cat /var/www/dixis/current/frontend/.env | grep API_BASE_URL

# Check PM2 environment
pm2 show ecosystem.production | grep NEXT_PUBLIC_API_BASE_URL

# Force clear Next.js cache
rm -rf /var/www/dixis/current/frontend/.next
pnpm build
pm2 restart ecosystem.production
```

### If browser still uses old URL:

- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Check Network tab → Headers to see actual request URL
- Verify no service worker is caching old code

---

## 📝 Related Changes

This deployment fixes the issue identified in:
- **Pass**: AUTH-CORE-0
- **Root Cause**: DNS issue - `api.dixis.gr` subdomain doesn't exist
- **Files Changed** (in codebase):
  - `frontend/.env.example` - fixed production URL comment
  - `frontend/.env.production.example` - NEW template with correct values
  - `frontend/tests/e2e/auth-api-validation.spec.ts` - NEW validation tests

**VPS File to Update**:
- `/var/www/dixis/current/frontend/.env` - must have `https://dixis.gr/api/v1`

---

## ⚠️ Future Prevention

To prevent this issue in the future:

1. **CI/CD validation**: Add a test that checks `NEXT_PUBLIC_API_BASE_URL` doesn't contain `api.dixis.gr`
2. **Health check**: Add frontend health endpoint that reports configured API URL
3. **Deployment checklist**: Always verify `.env` matches `.env.production.example`

---

**Status**: 🟡 Awaiting VPS deployment
**Expected Resolution Time**: 5-10 minutes (includes restart)
**Impact**: HIGH - Auth functionality completely broken until deployed
