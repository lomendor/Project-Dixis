# AG114 — RISKS-NEXT

## Risks

- **Πολύ χαμηλό**: Αφορά μόνο staging environment
  - **Mitigation**: Isolated database, no production impact
  - **Validation**: Manual trigger, confirm gate, secret verification

## Safety Features

### Triple Safety Gates
1. **Manual trigger only**: No automatic execution
2. **Confirm input**: Exact match required (`DIXIS-STAGING-OK`)
3. **Secret verification**: Checks before proceeding

### Isolated Environment
- Separate database from production
- No user impact
- Safe to experiment
- Easy to reset

## Testing Strategy

### Prerequisites
1. **Staging DB setup**: Create or clone staging database
2. **Add secret**: `DATABASE_URL_STAGING` in repository
3. **Verify Clinic**: Ensure main branch migrations pass Clinic

### Execution
1. **Trigger workflow**: Manual run with confirm input
2. **Monitor logs**: Watch real-time execution
3. **Verify results**: Check migrate status + validate
4. **Test application**: Smoke tests on staging

### Expected Results
- ✅ All 7 migrations applied
- ✅ Database schema up to date
- ✅ Schema validation passes
- ✅ Application works on staging

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Setup + Install | 1-2 min |
| Migration execution | 2-5 min |
| Validation | 1 min |
| **Total** | **4-8 min** |

**Use this timing** to estimate production maintenance window!

## Next Steps

### Before Staging Run
1. **Create staging DB**: Separate database or production snapshot
2. **Add secret**: Settings → Secrets → `DATABASE_URL_STAGING`
3. **Verify main**: Migration Clinic green on main branch

### During Staging Run
1. **Trigger workflow**: Actions → Staging Migration → Run workflow
2. **Input confirm**: `DIXIS-STAGING-OK`
3. **Monitor**: Watch logs real-time
4. **Verify**: Check success criteria

### After Staging Success
1. **Test application**: Run smoke tests on staging
2. **Document timing**: Record actual execution time
3. **Review results**: Team review of staging migration
4. **Plan production**: Use timing for prod window
5. **Execute production**: Follow AG113 runbook

### If Staging Fails
1. **Analyze logs**: Identify exact error
2. **Fix migration**: Repair in separate PR
3. **Test in Clinic**: Ensure Clinic passes
4. **Retry staging**: Re-run with fix
5. **DO NOT proceed to production** until staging passes

## Success Criteria

**All must be GREEN before proceeding to production**:
- [ ] `prisma migrate deploy` completed without errors
- [ ] `prisma migrate status` → "Database schema is up to date!"
- [ ] `prisma validate` → "schema is valid"
- [ ] No errors in workflow logs
- [ ] Application loads on staging (if deployed)
- [ ] Critical flows work (login, product listing, etc.)

## Staging DB Setup Options

### Option A: Separate Staging Database (Recommended)
```sql
CREATE DATABASE dixis_staging;
```

**Pros**: Clean, independent, fast
**Cons**: No production data patterns

**Secret value**:
```
postgresql://user:pass@host:5432/dixis_staging
```

### Option B: Production Snapshot/Clone
```bash
# PostgreSQL dump
pg_dump -Fc dixis_prod > prod_snapshot.dump
pg_restore -d dixis_staging prod_snapshot.dump

# Or cloud provider clone/snapshot
```

**Pros**: Production-like data, realistic testing
**Cons**: Must sanitize sensitive data, slower setup

### Option C: Cloud Provider Features
- **AWS RDS**: Create snapshot → Restore as new instance
- **Digital Ocean**: Clone database feature
- **Heroku**: Create follower database
- **Render**: Clone database

## Monitoring

### During Execution
- GitHub Actions logs (real-time)
- Migration progress
- Database connection status

### Post-Execution
- Application health (if staging app deployed)
- Database query performance
- Schema validation results

## Rollback Plan (Staging)

Since staging is isolated:
- **Simple reset**: Drop and recreate staging DB
- **Restore from backup**: If you want to retry
- **No urgency**: No user impact, take time to fix

## Communication

### Internal Team
**Before staging run**:
- Notify team of staging test
- Request no concurrent staging changes
- Share estimated timeline

**After staging run**:
- Share results (success/failure)
- Document timing for production planning
- Discuss any issues or learnings

### No User Communication Needed
Staging runs don't affect users - no announcements required.

## Integration Points

### Depends On
- **AG112.5**: Migration Clinic must be green
- **AG113**: Production runbook exists (for reference)

### Enables
- **AG113 execution**: Confidence to run production migration
- **Production planning**: Known timing for maintenance window
- **Team confidence**: Validated process before production

## Future Enhancements

### Potential Additions
1. **Auto-notify**: Slack/email on staging run completion
2. **Smoke tests**: Automated application tests post-migration
3. **Performance metrics**: Capture before/after query times
4. **Staging app deploy**: Trigger staging app redeploy after migration

### Not Needed
- ❌ Automatic runs (manual is safer)
- ❌ Production parity (staging can be simpler)
- ❌ Complex rollback (just reset staging DB)

## Risk Assessment

**Risk Level**: **MINIMAL**
- Isolated environment
- No production impact
- Safe to retry
- Manual execution

**Ready to Use**: **YES** (after secret setup)
**Confidence**: **HIGH** (AG112 series proves migrations work)

---

**Summary**: AG114 provides a safe, isolated staging environment to validate migrations before production deployment. Low risk, high value!
