# docs/INDEX.md — Dixis Docs Navigator

> **Single source of truth:** `docs/AGENT-STATE.md`. On ANY conflict between docs, AGENT-STATE.md wins. Update it in the same PR as your change.
> Only the docs listed below are LIVE. Everything else under `docs/` is historical.

## Entry & State (read first, in order)
| Doc | Purpose |
|-----|---------|
| `docs/AGENT-STATE.md` | THE canonical entry point — quick facts, current status, guardrails. Source of truth. |
| `docs/AGENT/CONTEXT-BOOT.md` | Cold-start brain — architecture, deploy procedures, permissions, pitfalls. |
| `docs/OPS/STATE.md` | Detailed per-pass session records (append on each pass). |

## Ops & Deploy
| Doc | Purpose |
|-----|---------|
| `docs/OPS/DEPLOY.md` | How production is deployed (auto + manual fallback). |
| `docs/OPS/SSH-DEPLOY-RUNBOOK.md` | Step-by-step SSH/VPS deploy runbook. |
| `docs/OPS/MONITORING.md` | Health checks, what the `/api/healthz` payload contains. |
| `docs/OPS/BACKUP-RESTORE.md` | Backup & restore procedure (Neon). |

## Strategy & Product
| Doc | Purpose |
|-----|---------|
| `docs/BUSINESS-REVIEW-2026-02.md` | Financial plan, go-to-market strategy & realistic projections. |
| `docs/B2B-READINESS.md` | B2B prep: invoicing, providers, implementation plan (Phase 2). |
| `docs/BACKLOG.md` | Task backlog (S-codes) and feature status. |
| `docs/PRODUCT/PRD-MUST-V1.md` | Must-have product requirements for V1. |
| `docs/ACCOUNTANT-BRIEFING-GR.md` | Greek briefing for the accountant (legal/tax open questions). |
| `docs/LEGAL-LIABILITY-FOOD-MARKETPLACE.md` | Food-marketplace legal liability notes (lawyer questions). |

## Rules (auto-loaded by agent)
| Doc | Purpose |
|-----|---------|
| `CLAUDE.md` | Project agent instructions, role, guardrails, commands. |
| `.claude/rules/backend.md` | Backend rules (Laravel 11 + PostgreSQL/Neon). |
| `.claude/rules/frontend.md` | Frontend rules (Next.js 15 + React 19). |

---

**Historical / read-only (do NOT update):** `docs/ARCHIVE/`, `docs/AGENT/PASSES/`, `docs/reports/`, `docs/prd/`. These are archives kept for reference only — never treat them as current.
