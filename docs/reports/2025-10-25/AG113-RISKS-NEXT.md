# AG113 — RISKS-NEXT

## Risks

- **Πολύ χαμηλό**: Δεν τρέχει τίποτα από μόνο του σε production
  - **Mitigation**: Manual triggers only, double confirmation gates
  - **Validation**: Requires explicit `DIXIS-PROD-OK` input

## Safety Gates

### Local Script (Option A)
1. Environment variable check: `DATABASE_URL` must be set
2. Double confirmation: Must type exactly `DIXIS-PROD-OK`
3. Working directory check: Must be in git repository

### GitHub Workflow (Option B)
1. Manual trigger: `workflow_dispatch` only
2. Confirm input: Must provide `DIXIS-PROD-OK` in form
3. Secret verification: Checks `DATABASE_URL_PROD` exists
4. Workflow condition: Only runs if confirm matches exactly

## Testing Strategy

### Pre-Production Testing
1. **Staging dry-run**: Required before production execution
2. **Backup verification**: Test restore process works
3. **Timeline validation**: Confirm maintenance window is adequate

### Production Execution
1. **Pre-checks**: Verify backup, secrets, staging results
2. **Execution**: Choose Option A (script) or Option B (workflow)
3. **Post-checks**: Run validation checklist from runbook

## Expected Timeline

| Phase | Duration | Risk Level |
|-------|----------|------------|
| Staging dry-run | 10-15 min | Low (non-prod) |
| Backup creation | 5-10 min | Low (precaution) |
| Production execution | 2-5 min | Medium (prod write) |
| Post-validation | 5 min | Low (read-only) |
| **Total** | **25-35 min** | **Managed** |

## Rollback Plan

### Primary: Backup Restore
```bash
# PostgreSQL restore from dump
pg_restore -d dixis_prod dixis_prod_backup.dump

# Or cloud provider snapshot restore
# (AWS RDS, Digital Ocean, etc.)
```

**Time to restore**: 5-10 minutes depending on DB size

### Alternative: Hotfix Migration
If data already exists post-migration and restore would lose it:
1. Create repair migration locally
2. Test on staging
3. Deploy via standard Migration Clinic workflow

**Time to hotfix**: 30-60 minutes

## Next Steps

### Immediate (Before First Production Run)
1. **Add secret**: `DATABASE_URL_PROD` to GitHub repository
2. **Test staging**: Run full dry-run on staging copy of production
3. **Verify backup**: Ensure backup/restore process works
4. **Schedule window**: Coordinate maintenance time with team

### During Maintenance Window
1. **Create backup**: Full `pg_dump` or cloud snapshot
2. **Put up banner**: Maintenance page for users
3. **Execute migration**: Via script (A) or workflow (B)
4. **Run post-checks**: Validate + test critical flows
5. **Remove banner**: Application back online

### Post-Migration
1. **Monitor logs**: Watch for unexpected errors
2. **Performance check**: Verify database query performance
3. **User testing**: Critical flows working correctly
4. **Document**: Record execution time, any issues, lessons learned

## Success Criteria

**All must be GREEN**:
- ✅ `prisma migrate status` → "Database schema is up to date!"
- ✅ `prisma validate` → "schema is valid"
- ✅ Application health endpoint → 200 OK
- ✅ Critical user flows → Working
- ✅ No errors in application logs
- ✅ Database performance → Normal

## Monitoring

### During Migration
- GitHub Actions logs (if using workflow)
- Terminal output (if using script)
- Database connection count
- Active queries

### Post-Migration (First Hour)
- Application error rates
- API response times
- Database slow query log
- User-reported issues

### Ongoing (First Week)
- Daily health checks
- Performance trending
- User feedback
- Data integrity spot checks

## Communication Plan

### Before Maintenance
**24h notice** via:
- Email to all users
- In-app banner
- Social media (if applicable)

### During Maintenance
- Maintenance page displayed
- Status updates if longer than expected
- ETA for completion

### After Maintenance
- Success confirmation
- Thank users for patience
- Report any known issues or changes

## Emergency Contacts

**Required**:
- On-call engineer: [FILL IN]
- Backup contact: [FILL IN]
- Database provider support: [FILL IN]

**Decision maker**:
- Product Owner / CTO: [FILL IN]

## Lessons from AG112 Series

### What We Learned
1. **Migration Clinic is critical**: Caught 7 migration issues before production
2. **Idempotent DDL**: `IF NOT EXISTS` saves us from re-run errors
3. **Dependency order matters**: Parent tables before child tables with FKs
4. **Column timing**: Don't pre-add columns that later migrations add
5. **Workflow validation**: Small command errors can fail entire workflow

### How This Informs AG113
- **Safety first**: Multiple confirmation gates
- **Clear runbook**: Document all scenarios
- **Rollback plan**: Always have a way back
- **Validation steps**: Verify success at each phase
- **Transparency**: Clear logging and communication

## Future Enhancements

### Potential Improvements
1. **Automated backup**: Trigger backup creation via workflow
2. **Staging automation**: Auto-deploy to staging before production option
3. **Notification integration**: Slack/email alerts on completion
4. **Audit logging**: Track all production migration executions
5. **Performance baseline**: Capture metrics before/after for comparison

### Not Recommended
- ❌ Automatic production migrations (too risky)
- ❌ Rollback via down migrations (not guaranteed safe)
- ❌ Skipping staging dry-run (removes safety net)
- ❌ Running without backup (no recovery path)

---

**Risk Level**: LOW (with proper procedure)
**Ready for Production**: YES (after secret setup + staging test)
**Confidence**: HIGH (AG112 series proves migrations work)
