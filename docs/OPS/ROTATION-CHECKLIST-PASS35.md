# Pass 35 — Credential Rotation Checklist (NO SECRETS)

**Date**: 2025-12-26
**Goal**: Rotate RESEND_API_KEY + Neon database credentials
**Policy**: ZERO secrets printed, status-code verification only

---

## Pre-Rotation Baseline

**Production Health** (verified before rotation):
- `GET /api/healthz` → 200 ✅
- `GET /internal/orders` → 500 ⚠️ (pre-existing issue, not blocker)

**Infrastructure**:
- Frontend: systemd service `dixis-frontend-launcher.service` (PM2 deprecated)
- Backend: systemd service `dixis-backend.service`
- Secrets source: GitHub Repository Secrets

---

## User Actions (Outside Terminal)

### 1. Resend API Key Rotation
- [ ] Login to Resend dashboard (https://resend.com/api-keys)
- [ ] Revoke old RESEND_API_KEY
- [ ] Generate new RESEND_API_KEY
- [ ] Copy new key value (keep secure, do NOT paste in terminal)

### 2. Neon Database Credentials Rotation
- [ ] Login to Neon console (https://console.neon.tech)
- [ ] Navigate to Project → Connection Details
- [ ] Reset password (generates new password)
- [ ] Copy new DATABASE_URL with updated password (keep secure)

### 3. GitHub Secrets Update
- [ ] Navigate to: https://github.com/lomendor/Project-Dixis/settings/secrets/actions
- [ ] Update `RESEND_API_KEY` secret (paste new value from step 1)
- [ ] Update `DATABASE_URL_PROD` secret (paste new value from step 2)
- [ ] Verify secrets updated timestamp changed

---

## Server Update (SSH - No Printing Values)

**Method**: SSH to VPS and update environment files WITHOUT printing secrets.

### Backend Service (.env update)
```bash
# SSH to VPS (uses dixis_prod_ed25519 key)
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235

# Navigate to backend directory
cd /var/www/dixis/current/backend

# Update .env file (manual edit - DO NOT cat/grep)
sudo nano .env
# - Update DATABASE_URL= line (paste new value from Neon)
# - Update RESEND_API_KEY= line (paste new value from Resend)
# - Save and exit (Ctrl+X, Y, Enter)

# Restart backend service to apply new env
sudo systemctl restart dixis-backend.service

# Verify service started (status only, no logs with secrets)
sudo systemctl status dixis-backend.service | head -5
```

### Frontend Service (.env update)
```bash
# Still in VPS session
cd /var/www/dixis/current/frontend

# Update .env file (manual edit - DO NOT cat/grep)
sudo nano .env
# - Update DATABASE_URL= line (paste new value from Neon)
# - Update RESEND_API_KEY= line (paste new value from Resend)
# - Save and exit

# Restart frontend service
sudo systemctl restart dixis-frontend-launcher.service

# Verify service started
sudo systemctl status dixis-frontend-launcher.service | head -5
```

---

## Verification (Status Codes Only - No Secrets)

### Production Health Endpoints
```bash
# From local machine (NOT VPS)
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://dixis.gr/api/healthz

# Expected: healthz=200

# Backend API endpoint
curl -s -o /dev/null -w "api_products=%{http_code}\n" https://dixis.gr/api/v1/public/products

# Expected: api_products=200

# Frontend SSR page
curl -s -o /dev/null -w "products_page=%{http_code}\n" https://dixis.gr/products

# Expected: products_page=200
```

### Database Connectivity (Implicit)
If `/api/healthz` returns 200, database connection is working (healthz endpoint queries DB).

### Email Sending (Optional - NOT required for Pass 35 DoD)
If testing needed, use Laravel Artisan command on VPS:
```bash
# On VPS, in backend directory
cd /var/www/dixis/current/backend
php artisan tinker
# > use App\Mail\TestMail;
# > Mail::to('test@example.com')->send(new TestMail());
# > exit
# Check Resend dashboard for delivery (DO NOT print API response)
```

---

## Success Criteria (DoD)

- [x] Baseline health snapshot taken (healthz=200)
- [ ] Old RESEND_API_KEY revoked in Resend dashboard
- [ ] Old Neon password revoked (new one generated)
- [ ] GitHub Secrets updated (RESEND_API_KEY, DATABASE_URL_PROD)
- [ ] Backend .env updated on VPS (no printing)
- [ ] Frontend .env updated on VPS (no printing)
- [ ] Backend service restarted
- [ ] Frontend service restarted
- [ ] Production health verified: `GET /api/healthz` → 200
- [ ] API endpoints functional: `GET /api/v1/public/products` → 200
- [ ] Frontend SSR working: `GET /products` → 200
- [ ] No secrets in PR diff (guard script PASS)
- [ ] STATE.md updated with completion note (no values)

---

## Rollback Plan (If Issues)

1. Revert GitHub Secrets to old values (if you saved them securely)
2. Revert VPS .env files to old values
3. Restart services
4. Verify healthz=200 with old credentials

**Prevention**: Keep old credentials saved securely until rotation verified successful.

---

## Security Notes

- ✅ **Never print** DATABASE_URL or RESEND_API_KEY in terminal output
- ✅ **Never use** `cat`, `grep`, or `echo` on .env files
- ✅ **Verify via** status codes only (200 = success, 500 = failure)
- ✅ **Guard script** prevents accidental secret commits (runs in CI)
- ✅ **SOP compliance**: See `docs/AGENT/SOPs/SOP-SEC-ROTATION.md`

---

**Pattern**: Defense-in-depth credential rotation following Pass SEC-GUARDRAILS methodology.
