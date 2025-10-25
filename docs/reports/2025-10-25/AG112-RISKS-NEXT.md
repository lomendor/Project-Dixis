# AG112 — RISKS-NEXT

## Risks
- **Πολύ χαμηλό**: CI-only change, no production impact
- **Performance trade-off**: No pnpm caching means slower installs (~30s extra)
  - **Mitigation**: Acceptable for diagnostic workflow
  - **Future**: Re-add caching once root cause identified
- **pnpm version pinning**: Using `pnpm@9` major version
  - **Mitigation**: Stable major version, tested in other workflows
  - **Monitoring**: Watch for pnpm breaking changes

## Testing Strategy
1. **PR CI**: Standard checks (typecheck, build, QA)
2. **Manual trigger on main**: After merge, run Migration Clinic
3. **Success criteria**:
   - Setup Node succeeds
   - pnpm setup succeeds  
   - All Prisma commands complete
   - Artifacts uploaded

## Expected Results
- ✅ **Setup Node succeeds**: No cache dependency
- ✅ **pnpm available**: Explicit corepack setup
- ✅ **Diagnostic output**: Shows working directory structure
- ✅ **Dependencies installed**: `pnpm install --frozen-lockfile` works
- ✅ **Prisma commands succeed**: generate/status/deploy/validate
- ✅ **Artifacts uploaded**: `frontend/prisma/migrations`

## Possible Failure Scenarios

### 1. Corepack Not Available
**Symptom**: `corepack: command not found`  
**Diagnosis**: Node.js version doesn't include corepack  
**Fix**: Use `npm install -g pnpm` as fallback

### 2. pnpm Install Fails
**Symptom**: `pnpm install` errors  
**Diagnosis**: Check diagnostic output for path issues  
**Fix**: Adjust working-directory or use absolute paths

### 3. Prisma Migration Errors
**Symptom**: `prisma migrate deploy` fails  
**Diagnosis**: Check migration files, schema consistency  
**Fix**: AG112.2 - Migration repair based on specific error

## Next Steps

### If AG112 Passes ✅
**AG113: Production Migration Runbook**
- Document safe migration procedures for production
- Create rollback scripts and procedures
- Test on staging environment
- Schedule production migration window
- Monitor migration execution

### If AG112 Fails (pnpm setup) ❌
**AG112.1: npm Fallback**
- Replace pnpm with npm
- Use `npm ci` for reproducible installs
- Adjust Prisma commands if needed
- Sacrifice pnpm features for reliability

### If AG112 Fails (Prisma errors) ❌
**AG112.2: Migration Repair**
- Analyze specific Prisma error from logs
- Review migration history and schema
- Create repair migration if needed
- Re-baseline migration state
- Re-run clinic to validate

## Future Optimizations

### Re-add pnpm Caching
Once workflow is stable:
```yaml
- name: Setup Node (with cache)
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'
    cache-dependency-path: 'frontend/pnpm-lock.yaml'
```
Test thoroughly before merging.

### Remove Diagnostic Step
Once confident in setup:
- Remove "Diag workspace" step
- Reduces noise in logs
- Slight performance improvement

### Add Performance Metrics
Track workflow execution time:
- Measure install time without cache
- Compare with cached version when re-added
- Optimize based on data
