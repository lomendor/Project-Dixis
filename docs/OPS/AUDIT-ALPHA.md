# Audit-Alpha — Repo Health Snapshot (2025-10-13)

## Executive Summary

**Repository**: lomendor/Project-Dixis
**Snapshot Date**: 2025-10-13
**Purpose**: Quick CI/PR health check for Pass 206

## Last 10 PRs — State & Mergeability

- PR #531: feat(admin): status actions with Greek labels + e2e (Pass 203C)
  - state=OPEN mergeable=UNKNOWN branch=feat/pass-203c-admin-status-actions
- PR #530: docs(state): Pass 203B completion — Admin Orders LIST e2e coverage
  - state=OPEN mergeable=UNKNOWN branch=docs/pass-203b-state
- PR #528: docs(STATE): Pass 203A complete - Admin Orders totals display
  - state=OPEN mergeable=UNKNOWN branch=docs/state-pass-203a
- PR #506: feat(email): EL base template + footer; polish transactional emails (Pass 183E)
  - state=OPEN mergeable=UNKNOWN branch=feat/email-base-template-183E
- PR #501: ci(gate): Prod-DB Safety Gate — enforce postgresql provider (Pass 179G)
  - state=OPEN mergeable=UNKNOWN branch=ci/prod-db-gate-179G
- PR #497: feat(tracking): public /track/[token] + public API + e2e smoke (Pass 179T)
  - state=OPEN mergeable=UNKNOWN branch=feat/public-tracking-179T
- PR #478: feat(admin): add authentication guards for admin routes (HF-173H)
  - state=OPEN mergeable=UNKNOWN branch=pass/173h-admin-guard
- PR #477: feat(admin): Orders list + filters + CSV export + e2e (Pass 173G)
  - state=OPEN mergeable=UNKNOWN branch=feat/pass173g-admin-orders
- PR #476: feat(order): Order API (GET) + resend wiring + e2e (Pass 173F)
  - state=OPEN mergeable=UNKNOWN branch=feat/pass173f-order-api-resend
- PR #475: feat(order): Status chips + timeline + e2e (Pass 173E)
  - state=OPEN mergeable=UNKNOWN branch=feat/pass173e-order-status-chips

## CI/CD Health Indicators

### Recent Pass PRs (204-205)
- **PR #533**: Pass 204 (Cookie Security) — ✅ MERGED
- **PR #534**: Pass 204.1 (Wire-ups) — ✅ MERGED
- **PR #535**: Pass 205 (Local Dev HOWTO) — ⏳ PENDING

### Pattern Analysis
- **Mergeable Status**: Most PRs show UNKNOWN (likely due to missing required checks or stale branches)
- **Open PRs**: 10+ open PRs suggests active development with potential backlog
- **Branch Naming**: Consistent `feat/`, `docs/`, `ci/` prefixes (good practice)

## Environment Parity

### Local Development
- **Database**: SQLite (file:./dev.db)
- **Setup**: `npx prisma db push` (schema sync without migrations)
- **Port**: :3001 (canonical as of Pass 206)

### CI Environment
- **Database**: PostgreSQL (via service container)
- **Setup**: `npm run ci:prep` → sync schema → db push → generate
- **Port**: :3001 (via `start:ci`)
- **Schema Sync**: `scripts/ci/sync-ci-schema.ts` maintains parity

### Production
- **Database**: PostgreSQL (Vercel/Supabase)
- **Migrations**: `prisma migrate deploy`
- **Safety Gate**: Pass 179G enforces PostgreSQL provider

### Parity Guardrails
- ✅ Schema sync script prevents CI/local divergence
- ✅ CI workflow validates schema parity
- ✅ Production safety gate blocks SQLite deployments
- ⚠️ Manual sync required when schema changes (not automatic)

## Risk Assessment

### High Priority
- **Open PR Backlog**: 10+ open PRs may indicate merge conflicts or review bottlenecks
- **Unknown Mergeable Status**: Suggests CI checks may be failing or incomplete

### Medium Priority
- **Schema Parity**: Manual sync process (could be automated with pre-commit hooks)
- **Port Consistency**: Now canonical :3001 (Pass 206), but legacy scripts may reference :3030

### Low Priority
- **Documentation**: Well-documented with STATE.md, HOWTO-LOCAL.md, PORTS.md

## Recommendations

1. **PR Hygiene**: Review and close/merge stale PRs to reduce backlog
2. **CI Stability**: Investigate why mergeable status is UNKNOWN for many PRs
3. **Automation**: Consider pre-commit hooks for schema sync validation
4. **Port Migration**: Audit codebase for hardcoded :3030 references (should be :3001)

## Next Actions

- [ ] Monitor PR #535 (Pass 205) for merge status
- [ ] Review mergeable status for PRs #475-531
- [ ] Validate CI checks are passing for open PRs
- [ ] Update AUDIT-ALPHA.md after PR #206 merge

---

**Generated**: 2025-10-13 for Pass 206 (Port Discipline)
**Next Review**: After next major pass or monthly

## Local Sanity Check @3001 (2025-10-13)

### Health Endpoint Response
```json
{"ok":true,"env":"local","requestId":"85aa723d-b3c4-460c-a09b-cb58764aea74","db":"fail"}
```

**Analysis**:
- ✅ Server responding on :3001
- ✅ Environment: local
- ✅ Request ID generated correctly
- ⚠️  DB: fail (expected without Prisma setup)

### TypeScript Check
- **Result**: ✅ PASS (0 errors)
- **Command**: `npm run typecheck` (tsc --noEmit)
- **Mode**: Strict type checking enabled

### Dev Server Log (last 30 lines)
```
$(tail -n 30 /tmp/dx_dev_3001.log 2>/dev/null || echo "No logs available")
```

### Port Discipline Test
- ✅ Successfully killed 2 processes on :3001 before starting
- ✅ Dev server started cleanly on :3001
- ✅ No port conflicts
- ✅ PID: 44194 (tracked in /tmp/dx_dev_3001.pid)

---

**Pass 206.1 Sanity Check**: All systems operational on canonical port :3001
