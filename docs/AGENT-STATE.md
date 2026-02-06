# AGENT-STATE — Dixis Canonical Entry Point

**Updated**: 2026-02-06

> **This is THE entry point.** Read this first on every agent session. Single source of truth.

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health** | `/api/healthz` (200 = OK) |
| **SSH** | `ssh -i ~/.ssh/dixis_prod_ed25519_20260115 root@147.93.126.235` |
| **Ports** | 3000 (frontend via PM2), backend via PHP-FPM unix socket |

---

## WIP (max 1)

_(empty — pick from NEXT)_

---

## NEXT (top 3 unblocked)

| Priority | Pass ID | Feature |
|----------|---------|---------|
| 1 | **WISHLIST-01** | User wishlist feature |
| 2 | **ADMIN-BULK-STATUS-01** | Bulk order status update |
| 3 | **OAUTH-GOOGLE-01** | Google OAuth login (needs backend work) |

---

## Credentials Status

| System | Status |
|--------|--------|
| **Stripe (Card Payments)** | ✅ ENABLED |
| **Resend (Email)** | ✅ ENABLED |
| **Neon PostgreSQL** | ✅ WORKING |

---

## Recently Done (last 10)

- **NEON-DB-FIX-01** — Fixed Neon DB password mismatch (2026-02-06) ✅
- **ADMIN-EMAIL-OTP-01** — Admin login via email OTP (2026-02-06) ✅
- **ADMIN-SHIPPING-UI-01** — Shipping labels UI wired to admin ✅
- **PRODUCER-NOTIFY-01** — Producer emails working ✅
- **REORDER-01** — Reorder button on order details ✅
- **TRACKING-DISPLAY-01** — Public order tracking via UUID token ✅
- **ORDER-NOTIFY-01** — Order status email notifications ✅

---

## Guardrails (non-negotiable)

- **WIP limit = 1** — One item in progress at any time
- **DoD required** — Measurable Definition of Done before starting
- **PR size ≤300 LOC** — Smaller = faster review
- **No workflow changes** — `.github/workflows/**` locked

---

## After Completing a Pass

1. Update this file (WIP → Recently Done)
2. Add entry to `docs/OPS/STATE.md`
3. Create pass file in `docs/AGENT/PASSES/SUMMARY-Pass-{PASS-ID}.md`
4. Verify prod: `curl -sI https://dixis.gr/api/healthz`

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/OPS/WORKAROUNDS.md` | Active workarounds (check for cleanup) |
| `docs/OPS/STATE.md` | Detailed pass records |
| `docs/AGENT/SOPs/` | Standard operating procedures |

---

_Lines: ~65 | Target: ≤100_
