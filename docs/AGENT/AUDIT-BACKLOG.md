# Audit Backlog — Codebase Health Issues

**Created**: 2026-02-11 (from full codebase health audit)
**Last Updated**: 2026-02-11

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

---

## REMAINING — Priority Order

### P1: Security / Data Integrity

1. **Rate limiting only in-memory**
   - File: `src/lib/rateLimit.ts`
   - Problem: Rate limit buckets are stored in a `Map` in memory. PM2 restart clears all limits.
   - Impact: After deploy/restart, rate limits reset — brief window for abuse.
   - Fix: Accept current behavior (PM2 restarts are rare) OR add Redis/file-based persistence.
   - Effort: Low (accept) / Medium (Redis)

2. **Producer onboarding mock — always returns userId=1**
   - File: `src/app/api/producer/onboarding/route.ts`
   - Problem: Always returns `{ userId: 1 }` regardless of input — placeholder from early dev.
   - Impact: No real producer registration works end-to-end.
   - Fix: Wire to Laravel producer registration API OR implement Prisma-based registration.
   - Effort: Medium
   - Blocked: Needs product decision on producer registration flow.

### P2: Reliability / Observability

3. **Admin audit logging silently fails**
   - File: `src/lib/audit/logger.ts`
   - Problem: Audit log writes are wrapped in try/catch that swallows errors.
   - Impact: Security-relevant actions (login, order changes) may not be logged.
   - Fix: Add console.error in catch block, or queue failed writes for retry.
   - Effort: Low

4. **Inconsistent error responses across ~82 API routes**
   - Problem: Some routes return `{ error: "..." }`, others `{ ok: false, message: "..." }`, others plain text with status codes.
   - Impact: Frontend error handling is fragile — must handle multiple response shapes.
   - Fix: Create shared `apiError(message, status)` helper, migrate routes incrementally.
   - Effort: High (82 routes, spread across multiple PRs)

### P3: Documentation / DX

5. **13 env vars undocumented in .env.example**
   - Problem: Variables like `LARAVEL_INTERNAL_URL`, `CI_SEED_TOKEN`, `DIXIS_AGG_PROVIDER`, `SMTP_DEV_MAILBOX`, etc. are used in code but not listed in `.env.example`.
   - Impact: New developers / fresh deployments miss configuration.
   - Fix: Add all env vars to `.env.example` with comments.
   - Effort: Low

6. **OPS/STATE.md outdated**
   - File: `docs/OPS/STATE.md`
   - Problem: Missing entries for AUTH-UNIFY, DUAL-DB-MIGRATION, CLEANUP-SPRINT passes.
   - Impact: Historical record incomplete.
   - Fix: Add missing entries.
   - Effort: Low

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
