# AG111 — RISKS-NEXT

## Risks
- **Πολύ χαμηλό**: CI-only changes, no production impact
- **Working directory dependency**: All steps assume `frontend/` context
  - **Mitigation**: Clearly documented in workflow
  - **Validation**: Re-run on main will confirm

## Testing Strategy
1. **PR CI**: Workflow will run when merged (no label needed for code review)
2. **Manual trigger on main**: Run after merge to validate fix
3. **Expected success**: All Prisma steps should complete

## Expected Results
- ✅ **Setup Node succeeds**: pnpm cache found at `frontend/pnpm-lock.yaml`
- ✅ **pnpm install succeeds**: Runs in directory with `package.json`
- ✅ **Prisma generate succeeds**: Finds `prisma/schema.prisma` in frontend
- ✅ **Prisma migrate deploy succeeds**: Applies migrations to clean DB
- ✅ **Prisma db validate succeeds**: Schema consistency confirmed
- ✅ **Artifacts uploaded**: `frontend/prisma/migrations` uploaded

## Possible Failure Scenarios

### 1. Prisma Schema Issues
**Symptom**: `prisma migrate deploy` fails with schema errors  
**Diagnosis**: Download artifacts, review error logs  
**Fix**: AG112 - Schema repair migration

### 2. Missing Migrations
**Symptom**: Migration history inconsistent  
**Diagnosis**: Check `prisma migrate status` output  
**Fix**: AG112 - Baseline migration or repair

### 3. Database Connection
**Symptom**: Cannot connect to postgres service  
**Diagnosis**: Check postgres health check logs  
**Fix**: Adjust postgres service configuration

## Next Steps

### If AG111 Clinic Passes (Success)
**AG112: Production Migration Runbook**
- Document safe migration procedures
- Create rollback scripts
- Test on staging environment
- Schedule production migration window

### If AG111 Clinic Fails (Prisma Issues)
**AG112: Migration Repair** (different focus)
- Analyze specific migration error
- Create repair migration
- Re-baseline if necessary
- Re-run clinic to validate

### Future Enhancements
**AG113: Auto-label Migration PRs**
- Detect changes to `frontend/prisma/**`
- Auto-add `migration-clinic` label
- Make clinic a required check for migration PRs
- Integrate with Danger.js

## Monitoring
After merge, verify:
1. **PR CI**: Check if workflow runs successfully on PR
2. **Manual run**: Trigger on main to validate clean state
3. **Artifacts**: Download and inspect migration files
4. **Logs**: Review all Prisma command outputs
