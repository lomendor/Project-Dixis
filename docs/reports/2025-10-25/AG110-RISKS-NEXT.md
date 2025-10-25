# AG110 — RISKS-NEXT

## Risks
- **Πολύ χαμηλό**: CI-only workflow, δεν επηρεάζει production/dev databases
- **Label dependency**: Requires manual label application
  - **Mitigation**: Documented trigger mechanism
- **Shadow DB requirement**: Prisma needs shadow DB for migrate deploy
  - **Mitigation**: Workflow creates shadow DB automatically

## Testing Strategy
1. **Label Trigger**: Add `migration-clinic` label to any PR
2. **Manual Trigger**: Run via Actions tab → Migration Clinic → Run workflow
3. **Validation**: Check workflow logs for Prisma output

## Expected Results
- ✅ Workflow triggers only when label present or manually dispatched
- ✅ Prisma generate succeeds
- ✅ Prisma migrate status shows current state
- ✅ Prisma migrate deploy applies all migrations
- ✅ Prisma db validate confirms schema consistency
- ✅ Migration artifacts uploaded

## Next Steps

### AG111: Migration Repair (if clinic fails)
If Migration Clinic detects issues:
- Review uploaded artifacts
- Identify missing/broken migrations
- Create repair migration
- Re-run clinic to validate fix

### AG112: Production Migration Runbook
Once clinic passes:
- Document production migration steps
- Create rollback procedures
- Test on staging environment
- Schedule production migration window

### AG113: Auto-label Strategy
Enhance automation:
- Auto-add `migration-clinic` label when `prisma/` changes detected
- Integration with Danger.js
- Conditional required check for migration PRs

## Monitoring
- **Workflow runs**: GitHub Actions → Migration Clinic
- **Artifacts**: Download migration-clinic-artifacts for debugging
- **Logs**: Review Prisma output for warnings/errors
