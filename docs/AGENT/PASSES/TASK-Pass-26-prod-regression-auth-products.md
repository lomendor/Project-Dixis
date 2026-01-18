# Pass 26: PROD Regression Triage - Auth + Products

**Date**: 2025-12-23
**Priority**: P0 (Production broken)
**Type**: Regression triage + minimal fix

---

## Problem Report

**Reported**: User attempted login on dixis.gr (2025-12-23) - failed
**Symptoms**:
1. Products not displaying on dixis.gr
2. Register/Login not working

**Note**: User suspects may not have registered in current database (possible root cause for login failure)

---

## Definition of Done (DoD)

### 1. Evidence Capture ✅/❌
- [ ] Capture HTTP responses from PROD endpoints:
  - `curl -i https://www.dixis.gr/api/healthz`
  - `curl -i https://www.dixis.gr/products`
  - `curl -i https://www.dixis.gr/api/v1/public/products`
  - `curl -i https://www.dixis.gr/auth/login`
  - `curl -i https://www.dixis.gr/auth/register`
- [ ] Document status codes + key headers in `docs/OPS/PROD-REGRESSION-2025-12-23.md`
- [ ] Run `./scripts/prod-facts.sh` and check output

### 2. Root Cause Analysis ✅/❌
- [ ] Diagnose "no products" issue:
  - Frontend API base URL misconfiguration?
  - Backend API returning empty array vs error?
  - Database empty/migrations not run?
  - Product visibility filter (approval_status)?
- [ ] Diagnose "auth broken" issue:
  - Frontend forms pointing to wrong endpoint?
  - Backend auth routes missing/broken?
  - CORS/CSRF token issues?
  - Session/Sanctum configuration?

### 3. Minimal Fix ✅/❌
- [ ] Apply ONE minimal safe fix (or document why not reproducible)
- [ ] If frontend config: fix env/API base URL
- [ ] If backend route: fix controller/middleware
- [ ] If database: identify seed/migration issue
- [ ] NO refactors, NO unrelated changes

### 4. Tests ✅/❌
- [ ] Add/extend Playwright smoke test:
  - Anonymous user can load products list (non-empty or at least renders container)
  - Register flow works (if supported by CI seeds)
  - Login flow works (if user exists in seed data)
- [ ] Backend test if logic changed (minimal)

### 5. Verification ✅/❌
- [ ] Local tests PASS
- [ ] CI tests PASS
- [ ] PROD endpoints verified (after deployment, if applicable)

### 6. Documentation ✅/❌
- [ ] Create `docs/OPS/PROD-REGRESSION-2025-12-23.md` (incident report)
- [ ] Create `docs/AGENT/PASSES/SUMMARY-Pass-26.md` (proof + fix summary)
- [ ] Update `docs/OPS/STATE.md` (Pass 26 → CLOSED with evidence)
- [ ] Update `docs/AGENT-STATE.md` (Pass 26 → DONE)

---

## Investigation Plan

### Phase 1: Capture PROD Facts
```bash
# Health endpoint
curl -i https://www.dixis.gr/api/healthz

# Products page
curl -i https://www.dixis.gr/products

# Public products API
curl -i https://www.dixis.gr/api/v1/public/products

# Auth pages
curl -i https://www.dixis.gr/auth/login
curl -i https://www.dixis.gr/auth/register

# Check if products exist in backend
curl -i https://dixis.gr/api/v1/public/products
```

### Phase 2: Repo-level Diagnosis

**Frontend API base URL**:
```bash
rg -n "NEXT_PUBLIC|API_URL|baseURL" frontend/
cat frontend/.env*
```

**Backend routes**:
```bash
rg -n "public/products|auth/login|auth/register" backend/routes/
cat backend/routes/api.php | grep -A5 "public/products"
```

**Product visibility logic**:
```bash
rg -n "approval_status|published|active" backend/app/
```

### Phase 3: Likely Causes

**Products not showing**:
1. Frontend pointing to wrong API URL (common after Pass 19 SSR changes)
2. Backend API returning empty array (DB empty or filter too strict)
3. Product approval_status filter (Pass 24 added moderation, default='approved')

**Auth broken**:
1. User not registered in current database (user's hypothesis)
2. Frontend forms pointing to wrong auth endpoint
3. CORS/CSRF blocking requests
4. Session/Sanctum misconfiguration

---

## Risk Assessment

**Risk**: HIGH (PROD broken for end users)

**Constraints**:
- Evidence-first approach (no blind fixes)
- Minimal safe patches only
- Prefer config fixes over code changes
- If requires VPS changes → STOP and document required change

---

## Files to Touch (Predicted)

**Diagnosis** (read-only):
- `frontend/.env*`
- `frontend/src/lib/api-client.ts` or similar
- `backend/routes/api.php`
- `backend/app/Http/Controllers/Api/PublicProductController.php`
- `backend/app/Models/Product.php`

**Potential Fixes**:
- `frontend/.env.production` (if API URL wrong)
- `backend/database/seeders/*` (if DB empty)
- `backend/app/Http/Controllers/Api/PublicProductController.php` (if filter too strict)

**Tests**:
- `frontend/tests/e2e/prod-smoke-regression.spec.ts` (new)
- `backend/tests/Feature/PublicProductsTest.php` (extend if needed)

**Docs**:
- `docs/OPS/PROD-REGRESSION-2025-12-23.md` (incident report)
- `docs/AGENT/PASSES/SUMMARY-Pass-26.md` (fix summary)
- `docs/OPS/STATE.md` (update)
- `docs/AGENT-STATE.md` (update)

---

**Status**: Ready to investigate
**Next**: Capture PROD facts → Diagnose → Apply minimal fix
