# Προτεινόμενα Επόμενα Passes (Post AUTH-CORE-0)

**Generated**: 2025-12-10 13:15 EET
**Context**: Μετά το AUTH-CORE-0 pass (production auth fix), προτείνονται τα παρακάτω passes με φόρμουλα: SECURITY FIRST → UX POLISH → OBSERVABILITY.

---

## 🚨 Sprint 1: Critical Security (Total: ~2h)

### **MONITOR-01: VPS Health & Security Monitoring**

**Priority**: 🔴 HIGH (Critical - Security)
**Complexity**: M (Medium - 60-90 min)
**Dependencies**: VPS SSH access, existing monitoring scripts

**Σκοπός**:
Proactive monitoring για security threats μετά το DDoS incident (Dec 6). Detection για:
- Auth failures (brute-force attempts)
- CPU spikes (crypto miners, malicious containers)
- Unauthorized processes/network activity
- Resource exhaustion attacks

**Τι θα αλλάξει**:
- Νέα monitoring scripts:
  - `auth-failure-monitor.sh` (track failed login attempts, auto-ban IPs)
  - `cpu-spike-detector.sh` (alert on >80% CPU for >5min)
  - `container-watch.sh` (detect unauthorized Docker containers)
- Integration με existing monitoring dashboard (`/monitoring.html`)
- Alerts via email/webhook on anomalies
- Automated response: IP ban μετά από 10 failed logins
- Logs aggregation στο `/var/log/dixis/security.log`

**Acceptance Criteria**:
- [ ] Scripts installed σε `/var/www/dixis/scripts/monitoring/`
- [ ] Cron jobs για κάθε script (runs every 5min)
- [ ] Test alert: simulate failed login → email received
- [ ] Test alert: simulate CPU spike → webhook triggered
- [ ] Dashboard shows live metrics (CPU, auth failures, active containers)

---

### **AUTH-01: Rate Limiting για Auth Endpoints**

**Priority**: 🔴 HIGH (Security - από BACKLOG-AUTH.md)
**Complexity**: S (Small - 10-15 min)
**Dependencies**: Backend Laravel access

**Σκοπός**:
Protection από brute-force attacks στα `/api/v1/auth/login` και `/register` endpoints.
Συνέπεια με το BACKLOG-AUTH.md planning (task AUTH-1).

**Τι θα αλλάξει**:
- `backend/routes/api.php`:
  ```php
  // Before
  Route::post('/auth/login', [AuthController::class, 'login']);

  // After
  Route::post('/auth/login', [AuthController::class, 'login'])
      ->middleware('throttle:5,1'); // 5 requests per minute

  Route::post('/auth/register', [AuthController::class, 'register'])
      ->middleware('throttle:10,1'); // 10 requests per minute
  ```
- Frontend ήδη handle 429 responses (Greek error: "Πάρα πολλές προσπάθειες")

**Acceptance Criteria**:
- [ ] Login throttle: 5 requests/min per IP
- [ ] Register throttle: 10 requests/min per IP
- [ ] Test: 6th login attempt → 429 "Too Many Requests"
- [ ] Frontend shows Greek error message: "Πάρα πολλές προσπάθειες. Δοκιμάστε σε λίγο."

---

## 🎨 Sprint 2: UX & Observability (Total: ~2h)

### **AUTH-UX-01: Post-Login Flow Polish**

**Priority**: 🟡 MEDIUM (UX Enhancement)
**Complexity**: M (Medium - 45-60 min)
**Dependencies**: Frontend AuthContext refactoring

**Σκοπός**:
Βελτίωση user experience μετά το successful login/register. Role-based smart redirects + first-time user onboarding.

**Τι θα αλλάξει**:
- `frontend/src/contexts/AuthContext.tsx`:
  - Smart redirect logic based on `user.role`:
    ```typescript
    if (user.role === 'producer') {
      router.push('/dashboard/producer')
    } else if (user.role === 'consumer') {
      router.push(intendedDestination || '/products')
    }
    ```
- First-time user hints:
  - Welcome modal για νέους χρήστες (optional)
  - Quick tour highlights (e.g., "Εδώ βλέπεις τα προϊόντα σου")
- Post-auth loading states:
  - Skeleton screens κατά την redirection
  - "Καλώς ήρθες!" toast με όνομα χρήστη (ήδη υπάρχει, ensure works)
- Session persistence test:
  - Verify refresh page δεν logout user

**Acceptance Criteria**:
- [ ] Producer login → redirects to `/dashboard/producer`
- [ ] Consumer login → redirects to intended destination (ή `/products`)
- [ ] First-time user sees welcome modal (optional feature flag)
- [ ] Refresh page after login → user still authenticated
- [ ] Post-login toast: "Καλώς ήρθες, [name]!"

---

### **CI-HEALTHZ-01: Auth Endpoint Health Checks**

**Priority**: 🟢 LOW (Nice-to-have, not urgent)
**Complexity**: M (Medium - 60 min)
**Dependencies**: GitHub Actions, backend healthz endpoint

**Σκοπός**:
Automated CI tests που verify production auth endpoints availability.
Nightly smoke tests για register/login reachability.

**Τι θα αλλάξει**:
- New GitHub Actions workflow: `.github/workflows/auth-health-check.yml`:
  ```yaml
  name: Auth Health Check
  on:
    schedule:
      - cron: '0 */4 * * *' # Every 4 hours
    workflow_dispatch:

  jobs:
    health:
      runs-on: ubuntu-latest
      steps:
        - name: Check Register Endpoint
          run: |
            curl -f https://dixis.gr/api/v1/auth/register || exit 1

        - name: Check Login Endpoint
          run: |
            curl -f https://dixis.gr/api/v1/auth/login || exit 1
  ```
- New backend endpoint: `GET /api/v1/auth/health`:
  ```php
  // Returns: {"status": "ok", "endpoints": ["register", "login", "logout"]}
  ```
- Integration με existing uptime-ping workflow
- Alerts on failures: Email + Slack notification

**Acceptance Criteria**:
- [ ] Workflow runs every 4 hours automatically
- [ ] Test: Manually disable auth → workflow fails → alert received
- [ ] Healthz endpoint returns JSON με status + available endpoints
- [ ] Badge in README: ![Auth Health](https://img.shields.io/github/workflow/status/...)

---

## 🚀 Recommended Execution Order

### **Phase 1: Security Critical** (Execute Immediately)
1. **AUTH-01** (Rate Limiting) - 15 min
   - Simple middleware change
   - Immediate protection από brute-force
2. **MONITOR-01** (VPS Monitoring) - 90 min
   - Comprehensive security coverage
   - Peace of mind μετά DDoS incident

**Total Phase 1**: ~2 hours
**Outcome**: Production security hardened, proactive threat detection

---

### **Phase 2: Polish & Automation** (Execute Next Week)
3. **AUTH-UX-01** (Post-Login Polish) - 60 min
   - Better user experience
   - Role-based flow improvements
4. **CI-HEALTHZ-01** (Health Checks) - 60 min
   - Automated monitoring
   - Early warning system για outages

**Total Phase 2**: ~2 hours
**Outcome**: Professional UX + Automated observability

---

## 📊 Impact Matrix

| Pass | Priority | Impact | Effort | ROI |
|------|----------|--------|--------|-----|
| AUTH-01 | 🔴 HIGH | HIGH (Security) | LOW (15min) | ⭐⭐⭐⭐⭐ |
| MONITOR-01 | 🔴 HIGH | HIGH (Security) | MEDIUM (90min) | ⭐⭐⭐⭐ |
| AUTH-UX-01 | 🟡 MEDIUM | MEDIUM (UX) | MEDIUM (60min) | ⭐⭐⭐ |
| CI-HEALTHZ-01 | 🟢 LOW | LOW (Nice-to-have) | MEDIUM (60min) | ⭐⭐ |

---

## 🔗 Related Documentation

- **Auth Backlog**: `docs/OPS/BACKLOG-AUTH.md` (9 tasks, AUTH-1 to AUTH-9)
- **Auth PRD**: `docs/PRODUCT/AUTH-PRD.md` (Complete auth specification)
- **Current State**: `docs/OPS/STATE.md` (AUTH-CORE-0 entry added)
- **Previous Pass**: `docs/AGENT/SUMMARY/Pass-AUTH-CORE-0.md`
- **Incident Report**: `docs/OPS/INCIDENT-2025-12-DDOS-and-ChunkError.md`

---

**🎯 Next Action for Panagiotis**:
1. Manual browser QA για auth flows (register + login από πραγματικό browser)
2. Approve Phase 1 execution (AUTH-01 + MONITOR-01)
3. Assign agent για MONITOR-01 pass με VPS access

**Generated by**: Claude Sonnet 4.5 (DOCS-AUTH-CORE-0 pass)
**Date**: 2025-12-10 13:15 EET
