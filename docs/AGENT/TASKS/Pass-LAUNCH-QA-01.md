# Pass LAUNCH-QA-01: V1 Launch QA Verification

**Created**: 2026-01-19
**Status**: IN PROGRESS
**Type**: QA / Verification (no code changes)

---

## Objective

Execute the V1 Launch QA Checklist with concrete proof for each item. Verify production readiness before V1 announcement.

---

## Definition of Done (DoD)

Each checklist item must have:
- [ ] Concrete proof (command output, URL response, or manual verification note)
- [ ] Timestamp of verification
- [ ] Pass/Fail status

---

## Checklist Items

### 1. Production Health

| Item | Proof Required |
|------|----------------|
| `https://dixis.gr/api/healthz` returns `{"status":"ok"}` | curl output |
| `https://dixis.gr/api/v1/public/products` returns products with cache headers | curl -i headers |
| Email delivery works | Trigger password reset, note timestamp + recipient |
| Card payment works in Stripe test mode | Manual verification or API check |

### 2. Performance Baseline

| Item | Proof Required |
|------|----------------|
| Products page TTFB < 2s | curl timing output |
| No 500 errors in Laravel logs for 24h | SSH log tail |

### 3. Security

| Item | Proof Required |
|------|----------------|
| HTTPS enforced | curl redirect check |
| CSP headers present | curl response headers |
| Auth endpoints rate-limited | Route middleware check |

### 4. Core Flows (Manual Smoke)

| Flow | Proof Required |
|------|----------------|
| Guest checkout | Step-by-step verification notes |
| User checkout with cart sync | Step-by-step verification notes |
| Producer add product | Step-by-step verification notes |
| Admin approve product | Step-by-step verification notes |
| Admin order status email | Step-by-step verification notes |

---

## Execution Plan

1. Run automated health checks (curl commands)
2. Check production logs via SSH
3. Trigger email delivery test
4. Document performance baseline
5. Record all results in SUMMARY doc

---

_Pass: LAUNCH-QA-01 | Author: Claude_
