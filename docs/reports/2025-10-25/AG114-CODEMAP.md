# AG114 — CODEMAP

## New Files Created

### .github/workflows/staging-migration.yml
Manual GitHub Actions workflow for staging migrations:
- **Trigger**: `workflow_dispatch` only (manual)
- **Confirm gate**: Requires exact input `DIXIS-STAGING-OK`
- **Secret**: `DATABASE_URL_STAGING` (verified before execution)
- **Concurrency**: Single execution only
- **Steps**:
  - Setup Node + pnpm
  - Verify staging secret
  - Install dependencies
  - Prisma generate
  - Prisma migrate deploy (STAGING)
  - Prisma migrate status
  - Prisma validate

### docs/OPS/RUNBOOKS/DB-MIGRATION-STAGING.md
Comprehensive staging migration runbook:
- Purpose & prerequisites
- Execution via workflow or command line
- Post-migration checks
- Timeline estimates (4-8 min)
- Staging DB setup options
- Troubleshooting guide
- Success criteria
- Next steps after staging success

## Safety Features

### Double Confirm Gates
1. **Manual trigger**: Workflow doesn't run automatically
2. **Confirm input**: Must type exactly `DIXIS-STAGING-OK`
3. **Secret verification**: Checks `DATABASE_URL_STAGING` exists

### Isolated from Production
- Uses separate database (`DATABASE_URL_STAGING`)
- No production impact
- Safe to retry (idempotent operations)
- Can test without risk

## Purpose

Staging migration provides:
- **Validation**: Test migrations before production
- **Timing**: Measure actual execution time
- **Confidence**: Verify no breaking changes
- **Practice**: Dry-run the process

## Difference from Production (AG113)

| Aspect | Staging (AG114) | Production (AG113) |
|--------|-----------------|---------------------|
| **Risk** | Low | Medium |
| **Confirm** | `DIXIS-STAGING-OK` | `DIXIS-PROD-OK` |
| **Secret** | `DATABASE_URL_STAGING` | `DATABASE_URL_PROD` |
| **Backup** | Optional | **Required** |
| **Maintenance** | Not needed | **Required** |
| **Impact** | None (isolated) | User-facing |

## Usage Flow

```
1. Set DATABASE_URL_STAGING secret
   ↓
2. Run "Staging Migration" workflow
   ↓
3. Input: DIXIS-STAGING-OK
   ↓
4. Monitor logs
   ↓
5. Verify: migrate status + validate
   ↓
6. Test application on staging
   ↓
7. If OK → Proceed to production (AG113)
```

## Expected Results

### Successful Run
```
✅ Prisma migrate deploy completed
✅ Prisma migrate status → "Database schema is up to date!"
✅ Prisma validate → "schema is valid 🚀"
✅ No errors in logs
```

### Timeline
- Setup + Install: 1-2 min
- Migration execution: 2-5 min
- Validation: 1 min
- **Total**: 4-8 min

## What This Enables

**Before AG114**:
- ❌ No staging testing process
- ❌ Direct to production (risky)
- ❌ Unknown timing
- ❌ No practice run

**After AG114**:
- ✅ Safe staging testing
- ✅ Validate before production
- ✅ Known timing estimates
- ✅ Confidence through practice

## Integration with AG113

AG114 (Staging) is a **prerequisite** for AG113 (Production):
1. **AG114**: Test on staging → Verify works
2. **AG113**: Deploy to production → With confidence

## Next Actions

1. **Add secret**: `DATABASE_URL_STAGING` to repository
2. **Run staging**: Test migrations on staging DB
3. **Verify results**: Check logs + application
4. **Document timing**: Record actual execution time
5. **Proceed to prod**: Use AG113 runbook when ready
