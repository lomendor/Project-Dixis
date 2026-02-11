# Audit Backlog — Codebase Health Issues

**Created**: 2026-02-11 (from full codebase health audit)
**Last Updated**: 2026-02-11 (P3 items resolved)

> Items discovered during a 5-agent parallel audit. Critical items (PRs #2738-#2741) already fixed.
> This file tracks remaining issues for future sprints.

---

## RESOLVED (PRs #2738-#2741)

| Issue | PR | Status |
|-------|----|--------|
| 4 separate PrismaClient instances | #2738 | MERGED |
| `prismaSafe.ts` anti-pattern (silent null fallback) | #2738 | MERGED |
| `mode: 'insensitive'` breaks SQLite CI (6 occurrences) | #2739 | MERGED |
| CLAUDE.md ports wrong (3001 vs 3000) | #2740 | MERGED |
| AGENT-STATE.md outdated (missing recent passes) | #2740 | MERGED |
| Contact form HTML injection (XSS in admin email) | #2741 | MERGED |
| Viva-verify does DB mutation on GET request | #2741 | MERGED |
| Producer onboarding mock (always userId=1) | #2743 | MERGED |
| Producer status mock (hardcoded fake data) | #2743 | MERGED |
| 13 env vars undocumented in .env.example | P3-DOCS | MERGED |
| OPS/STATE.md missing pass entries | P3-DOCS | MERGED |

---

## REMAINING — Priority Order

### P1: Security / Data Integrity

1. **Rate limiting only in-memory** — ACCEPTED (decision documented)
   - File: `src/lib/rateLimit.ts` + `src/lib/rate-limit.ts`
   - Problem: Two in-memory rate limiters reset on PM2 restart.
   - Decision: **Accepted as-is**. Reasons:
     - A third, DB-backed rate limiter (`src/lib/rl/db.ts`) already exists for critical paths
     - PM2 restarts are rare (~20 in production lifetime)
     - The abuse window is seconds, not minutes
     - OTP auth has its own limits + 6-digit code verification
   - Future: Migrate remaining in-memory limiters to `rl/db.ts` if abuse is detected.

### P2: Reliability / Observability

2. ~~**Admin audit logging silently fails**~~ — RE-EVALUATED: NOT AN ISSUE
   - All callers already have `console.error('[Admin] Audit log failed:', auditErr)` in catch blocks.
   - The try/catch correctly prevents audit failures from breaking the main request.
   - No action needed.

4. **Inconsistent error responses across ~82 API routes**
   - Problem: Some routes return `{ error: "..." }`, others `{ ok: false, message: "..." }`, others plain text with status codes.
   - Impact: Frontend error handling is fragile — must handle multiple response shapes.
   - Fix: Create shared `apiError(message, status)` helper, migrate routes incrementally.
   - Effort: High (82 routes, spread across multiple PRs)

### P3: Documentation / DX — ✅ ALL RESOLVED

5. ~~**13 env vars undocumented in .env.example**~~ — RESOLVED
   - Fixed: Added all missing env vars to `.env.example` with section headers and comments.

6. ~~**OPS/STATE.md outdated**~~ — RESOLVED
   - Fixed: Added AUTH-UNIFY, DUAL-DB-MIGRATION, CLEANUP-SPRINT-01, ADMIN-BULK-STATUS-01 entries.

---

## What's Working Well (from audit)

- Build passes (0 errors, 0 warnings)
- Production health 200 OK
- No localhost URLs in production bundle
- No secrets in git history
- TypeScript strict mode passes
- tsconfig paths resolve correctly
- PM2 config matches actual deployment
- Laravel SSOT migration complete (products served from Laravel)
- PrismaClient unified to single singleton

---

_Reference: AGENT-STATE.md > Recently Done > CLEANUP-SPRINT-01_
