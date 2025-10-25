# AG113 — CODEMAP

## New Files Created

### docs/OPS/RUNBOOKS/DB-MIGRATION-PROD.md
Comprehensive production migration runbook with:
- Prerequisites checklist
- Staging dry-run procedure
- Two execution options (local script + GitHub Actions)
- Rollback plan (backup restore)
- Post-migration validation checks
- Timeline estimates & maintenance window communication
- Troubleshooting guide
- Security checklist

### scripts/db/migrate_prod.sh
Safe local execution script with double confirmation:
- Requires `DATABASE_URL` environment variable
- Double confirmation gate: Must type exactly `DIXIS-PROD-OK`
- Runs all 4 Prisma commands in sequence:
  1. `prisma generate`
  2. `prisma migrate deploy`
  3. `prisma migrate status`
  4. `prisma validate`
- Clear success/failure messaging

### .github/workflows/prod-migration.yml
Manual GitHub Actions workflow:
- **Trigger**: `workflow_dispatch` only (no automatic runs)
- **Confirm gate**: Requires exact input `DIXIS-PROD-OK`
- **Secret required**: `DATABASE_URL_PROD`
- **Concurrency**: Single execution at a time (no parallel runs)
- **Steps**:
  - Setup Node + pnpm
  - Verify secrets exist
  - Install dependencies
  - Prisma generate
  - Prisma migrate deploy (PRODUCTION)
  - Prisma migrate status
  - Prisma validate
  - Summary with next steps

## Safety Features

### Triple Safety Gates
1. **Manual trigger only**: Workflow doesn't run automatically
2. **Confirm input**: Must type exactly `DIXIS-PROD-OK`
3. **Secret verification**: Checks `DATABASE_URL_PROD` exists before proceeding

### Idempotent Operations
All Prisma commands are idempotent:
- `prisma migrate deploy`: Safe to re-run, skips applied migrations
- `prisma migrate status`: Read-only check
- `prisma validate`: Schema validation only

### No Destructive Operations
- No data deletion
- No schema rollback
- No automatic downgrades
- Rollback via backup restore only

## What This Enables

**Before AG113**:
- ❌ No documented process for production migrations
- ❌ No safe execution tools
- ❌ High risk of manual errors
- ❌ No rollback plan

**After AG113**:
- ✅ Complete runbook with all scenarios covered
- ✅ Safe execution script with double confirmation
- ✅ CI workflow option with confirm gate
- ✅ Clear rollback procedure (backup restore)
- ✅ Post-migration validation checklist
- ✅ Troubleshooting guide

## Next Steps

1. **Set secret**: Add `DATABASE_URL_PROD` to GitHub repository secrets
2. **Staging test**: Run dry-run on staging copy of production DB
3. **Schedule maintenance**: Coordinate maintenance window (Europe/Athens timezone)
4. **Execute**: Choose script (Option A) or workflow (Option B)
5. **Validate**: Run post-migration checks from runbook

## Design Principles

### Principle 1: Safety First
All operations require explicit confirmation. Nothing runs automatically.

### Principle 2: Transparency
Clear logging at each step. User knows exactly what's happening.

### Principle 3: Rollback Plan
Always have a way back via backup restore.

### Principle 4: Validation
Verify success with `migrate status` + `validate` after deployment.

### Principle 5: Documentation
Complete runbook with all scenarios, timelines, troubleshooting.

## Related Work

- **AG110-AG112.1**: Migration Clinic workflow setup
- **AG112.2-AG112.4**: Migration repair (all 7 migrations now work)
- **AG112.5**: Workflow validation fix (full green)
- **AG113**: Production deployment tools (this PR)
