# PROJECT-DIXIS — Agent Instructions

> **Entry Point**: `docs/AGENT-STATE.md` — Read this first every session.

---

## Guardrails (non-negotiable)

- **CI/CD**: NO changes to `.github/workflows/**`
- **Ports**: 8001 (backend), 3001 (frontend) — LOCKED
- **Next.js**: 15.5.0 — LOCKED
- **PR Size**: ≤300 LOC per PR
- **WIP limit**: 1 item in progress at a time
- **Artifacts**: playwright-report/**, test-results/** required

## Database Policy

- **Primary DB**: PostgreSQL (Neon) — production, staging, local dev
- **CI DB**: SQLite — fast CI tests via `schema.ci.prisma`
- **Constraint**: No PostgreSQL-specific features that break SQLite CI
  - Example: `mode: 'insensitive'` removed from Prisma queries
- **Schema sync**: `schema.ci.prisma` auto-generated from main schema

## Workspace Layout

- **Repo root**: Project-Dixis (frontend/ & backend/)
- **Frontend**: `./frontend` (Next.js 15 + React 19 + TypeScript 5)
- **Backend**: `./backend` (Laravel 11 + PostgreSQL 15)
- **Docs**: `docs/` — AGENT-STATE, SOPs, passes, product specs
- **Context Scope**: Limited to frontend/ (use `npm run agent:limit-scan`)

## Agent Working Style

- **ULTRATHINK**: Read AGENT-STATE.md + relevant docs before any work
- **Parent agent**: Maintains context, performs implementations/commits
- **Subagents**: Research-only (produce docs), no code edits
- **PR format**: ≤300 LOC, AC checklist, evidence links

## Key SOPs

| SOP | When |
|-----|------|
| `docs/AGENT/SOPs/SOP-VPS-DEPLOY.md` | Deploy to production VPS |
| `docs/AGENT/SOPs/SOP-Feature-Pass.md` | Start a new feature pass |
| `docs/AGENT/SOPs/SOP-PDAC-lite.md` | Lightweight planning process |
| `docs/AGENT/SOPs/PRECHECKS.md` | Pre-flight checks before work |

## Auth Flow (reference)

```
Phone → OTP (6 digits) → JWT in HttpOnly cookie → requireAdmin() checks cookie + DB
```

- No passwords (phone-based identity)
- Rate limited: 5 requests / 15 min
- Admin session: 24h expiry
- DB whitelist: AdminUser table
