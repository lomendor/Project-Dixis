# Pass 27: Auth Functional Verification (PROD + CI Guardrail)

**Date**: 2025-12-23
**Status**: IN PROGRESS
**Priority**: P1 (User reported login not working - pages load but functional flow unverified)

---

## Problem Statement

Pass 26 verified auth pages LOAD (200 OK), but functional flow unverified:
- ⚠️ Register form submission → does it create user?
- ⚠️ Login form submission → does it authenticate?
- ⚠️ Session/cookie → is it set correctly?
- ⚠️ UI → does it reflect authenticated state?

**User Hypothesis**: "May not have registered in current database" (likely correct)

---

## Definition of Done (DoD)

### PROD Verification (Hard Evidence)

1. **Register POST succeeds** (2xx) for a new user OR clear evidence it is blocked by verification policy
   - Evidence: HTTP status code + response body excerpt + any error messages
   - Endpoint: Discovered from codebase (not assumed)

2. **Login POST succeeds** (2xx) and sets session/cookie OR returns token
   - Evidence: HTTP status code + response body + cookie file content + session proof
   - Must capture: Set-Cookie header OR token in response body

3. **UI indicates authenticated state**
   - Evidence: Redirect location + presence of logged-in element (if exists)
   - OR: Clear explanation of why UI verification skipped (unstable selectors, etc.)

4. **CI Guardrail**: Playwright E2E test covers register+login in CI environment
   - Test file: `frontend/tests/e2e/auth-functional-flow.spec.ts` (or similar)
   - Flow: Register unique user → Login → Assert authenticated UI/session
   - Must PASS in CI

5. **Docs Updated**: VERIFIED vs NOT VERIFIED bullets in STATE.md + ops note
   - Clear documentation of what was verified vs what remains unverified
   - Evidence file: `docs/OPS/PROD-AUTH-VERIFICATION-2025-12-23.md`

---

## Constraints

- **Evidence-first**: No assumptions. Capture HTTP status, response body, cookies, UI state.
- **No refactors**: Only add test + docs. No auth code changes unless blocking bug found.
- **Email verification**: If PROD requires email confirmation and blocks flow → STOP with evidence + propose safest next step (staging/test-mode)
- **Secrets**: Keep out of repo. Credentials must be ephemeral/generated, not committed.

---

## Investigation Plan

### Phase 1: API Discovery

**Objective**: Find actual auth endpoints (not assumed)

**Actions**:
```bash
# Search frontend codebase for auth API calls
rg -n "register|login|auth" frontend/src | grep -E "(fetch|axios|api)" | head -50
```

**Expected Outputs**:
- Register endpoint: `POST /api/v1/auth/register` (or similar)
- Login endpoint: `POST /api/v1/auth/login` (or similar)
- Session/me endpoint: `GET /api/v1/auth/me` (optional)

---

### Phase 2: PROD Functional Verification

**Objective**: Verify register + login work with hard evidence

**Test Credentials**:
```bash
TS=$(date -u +"%Y%m%d-%H%M%S")
EMAIL="dixis.e2e.$TS@mailinator.com"
PASS="T3st!Pass-$TS"
```

**Actions**:

1. **Health Check** (baseline):
   ```bash
   curl -s -D - -o /dev/null https://www.dixis.gr/api/healthz
   ```

2. **Register**:
   ```bash
   curl -sS -D register-headers.txt -o register-body.txt \
     -H "Content-Type: application/json" \
     -X POST https://www.dixis.gr/api/v1/auth/register \
     --data "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"name\":\"Prod Test $TS\"}"
   ```
   - Capture: HTTP status, response body, any validation errors
   - Decision gate: 2xx → proceed to login | 4xx/5xx → STOP with evidence

3. **Login**:
   ```bash
   curl -sS -c cookies.txt -D login-headers.txt -o login-body.txt \
     -H "Content-Type: application/json" \
     -X POST https://www.dixis.gr/api/v1/auth/login \
     --data "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
   ```
   - Capture: HTTP status, Set-Cookie headers, response body (token?), cookies file
   - Decision gate: 2xx + cookie/token → PROD verified | else → STOP with evidence

4. **Session Verification** (optional):
   ```bash
   curl -sS -b cookies.txt -D - https://www.dixis.gr/api/v1/auth/me
   ```
   - Capture: Authenticated user info OR 401 if session invalid

**Expected Evidence**:
- Register: `HTTP/1.1 201 Created` + `{"user": {...}, "message": "..."}`
- Login: `HTTP/1.1 200 OK` + `Set-Cookie: session=...` OR `{"token": "..."}`
- Session: `HTTP/1.1 200 OK` + `{"user": {"id": ..., "email": "..."}}`

---

### Phase 3: PROD UI Smoke (Optional)

**Objective**: Verify UI reflects authenticated state

**Approach**:
- Run Playwright locally against PROD (if safe)
- Visit `/auth/login`, fill form, submit, assert redirect/logged-in marker
- SKIP if selectors unstable or flow unknown (document why)

---

### Phase 4: CI Guardrail E2E

**Objective**: Add non-regressing test in CI

**Test File**: `frontend/tests/e2e/auth-functional-flow.spec.ts`

**Flow**:
```typescript
test('auth flow: register → login → authenticated', async ({ page }) => {
  // Generate unique credentials
  const email = `test-${Date.now()}@example.com`;
  const password = 'TestPass123!';

  // Register
  await page.goto('/auth/register');
  await page.fill('[data-testid="register-email"]', email);
  await page.fill('[data-testid="register-password"]', password);
  await page.click('[data-testid="register-submit"]');
  await expect(page).toHaveURL(/\/auth\/login|\/dashboard/);

  // Login
  await page.goto('/auth/login');
  await page.fill('[data-testid="login-email"]', email);
  await page.fill('[data-testid="login-password"]', password);
  await page.click('[data-testid="login-submit"]');

  // Assert authenticated (redirect + UI marker)
  await expect(page).toHaveURL(/\/dashboard|\/products/);
  await expect(page.getByTestId('user-menu')).toBeVisible();
});
```

**Run**:
```bash
cd frontend
pnpm install --frozen-lockfile
pnpm playwright test auth-functional-flow.spec.ts --reporter=line
```

---

### Phase 5: Documentation

**Files to Update**:

1. **docs/OPS/PROD-AUTH-VERIFICATION-2025-12-23.md** (NEW):
   - Endpoints used (REGISTER_URL, LOGIN_URL, ME_URL)
   - HTTP status codes
   - Response excerpts (no secrets)
   - Cookie/session proof
   - UI proof or why skipped

2. **docs/OPS/STATE.md**:
   - Move Pass 27 from IN PROGRESS → CLOSED
   - Update VERIFIED vs NOT VERIFIED bullets

3. **docs/AGENT-STATE.md**:
   - Add Pass 27 to DONE section

4. **docs/AGENT/PASSES/SUMMARY-Pass-27.md**:
   - Summary of findings + evidence + test added

---

## Risk Assessment

**Low Risk** (evidence-gathering + test addition):
- No auth code changes
- Ephemeral test credentials (mailinator)
- CI test isolated to CI env

**Potential Blockers**:
- Email verification required in PROD (may need mailinator access or staging env)
- CSRF tokens required (may need form scraping)
- Cookie SameSite/domain issues (may affect verification)

**Mitigation**:
- STOP with evidence if blocked + propose next step
- Document limitations clearly in VERIFIED vs NOT VERIFIED

---

## Success Criteria

**Pass 27 Complete** when:
- ✅ PROD register verified (2xx OR clear block evidence)
- ✅ PROD login verified (2xx + cookie/token)
- ✅ CI E2E test added + PASS
- ✅ Docs updated with hard evidence
- ✅ PR merged with ai-pass, risk-ok labels

---

**Next**: Execute Phase 1 (API Discovery)
