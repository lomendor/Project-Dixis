# ACTIVE — Dixis Agent State

**Updated**: 2026-01-17 (CREDENTIALS-01)

> **This is THE entry point.** Read this first on every session.

---

## WIP (max 1)

_(empty — pick next unblocked item from NEXT)_

---

## NEXT (ordered, top 3 unblocked)

_(All unblocked passes complete — see docs/PRODUCT/PRD-MUST-V1.md for V1 status)_

---

## Recently Completed

- **Pass 60** — Email Enable (health diagnostic, awaiting credentials) ✅
- **Pass 52** — Stripe Enable (health diagnostic, Stripe live on prod) ✅
- **CREDENTIALS-01** — Credential wiring map for Pass 52/60 ✅
- **PRD-AUDIT-REFRESH-01** — Refresh audit after 8 passes (91% health) ✅
- **PRD-AUDIT-STRUCTURE-01** — Page inventory + flows + V1 must-haves ✅
- **EN-LANGUAGE-02** — Extend i18n to checkout/orders pages ✅
- **PRODUCER-DASHBOARD-01** — i18n + notifications link ✅
- **NOTIFICATIONS-01** — Notification bell + page UI ✅
- **EN-LANGUAGE-01** — English language support ✅

---

## BLOCKED (awaiting credentials)

| Pass | Blocker | See |
|------|---------|-----|
| Pass 60 — Email Infra | Resend API key needed | `docs/AGENT/TASKS/Pass-60-EMAIL-ENABLE.md` |

---

## Quick Facts

| Item | Value |
|------|-------|
| **Prod URL** | https://dixis.gr |
| **Health endpoint** | `/api/healthz` (200 = OK) |
| **SSH key** | `~/.ssh/dixis_prod_ed25519` (dixis-prod-20260115) |
| **VPS IP** | 147.93.126.235 |
| **Feature health** | 91% (78 DONE + 23 PARTIAL / 111 total) |
| **Ports** | 8001 (backend), 3001 (frontend) — LOCKED |

---

## Boot Sequence (3 files, ≤1000 tokens)

```bash
# 1. This file (you're here)
docs/ACTIVE.md

# 2. Agent constraints + working style
docs/AGENT/boot.md

# 3. Recent history (last 30 days)
docs/OPS/STATE.md
```

**Optional**: Latest pass summary
```bash
ls -t docs/AGENT/SUMMARY/*.md | head -1 | xargs cat
```

---

## Guardrails (non-negotiable)

- **WIP limit = 1** — Only one item in progress at any time
- **DoD required** — Every pass needs measurable Definition of Done
- **Artifacts required** — TASKS/ + SUMMARY/ files for every pass
- **No workflow changes** — `.github/workflows/**` locked without explicit directive
- **PR size ≤300 LOC** — Smaller = faster review

---

## After Completing a Pass

1. Update this file (move from WIP to done, pull next from NEXT)
2. Update `docs/OPS/STATE.md` (add entry at top)
3. Create `docs/AGENT/TASKS/Pass-{NAME}.md`
4. Create `docs/AGENT/SUMMARY/Pass-{NAME}.md`
5. Verify prod: `curl -sI https://dixis.gr/api/healthz`

---

## References

| Doc | Purpose |
|-----|---------|
| `docs/NEXT-7D.md` | Full backlog + completed history |
| `docs/OPS/STATE.md` | Detailed pass records (last 10) |
| `docs/OPS/STATE-ARCHIVE/` | Older pass history |
| `docs/PRODUCT/PRD-AUDIT.md` | Feature gap analysis |
| `docs/AGENT/SOPs/CREDENTIALS.md` | VPS credential setup |

---

_Lines: ~90 | Target: ≤150 | Tokens: ~600_
