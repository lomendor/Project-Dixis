# Task: Pass-CI-NEON-COMPUTE-01

## What
Reduce Neon compute burn by moving E2E PostgreSQL tests to GitHub Actions local postgres service.

## Status
**VERIFIED** - Already implemented. No changes needed.

## Scope
- Audit CI workflows for Neon usage
- Move E2E tests from Neon to local postgres service
- NO business logic changes

## Investigation

### Finding

**Neon is NOT used for CI E2E tests.** Current architecture:

| Workflow | DB Used | Notes |
|----------|---------|-------|
| `e2e-postgres.yml` ("E2E PostgreSQL") | SQLite | Uses `.env.ci` with `DATABASE_URL=file:./test.db` |
| `pg-e2e.yml` (label-gated) | GitHub Actions postgres | Uses service container, label required |
| `prod-migration.yml` | Neon (prod) | Deploy only, not tests |
| `staging-migration.yml` | Neon (staging) | Deploy only, not tests |

### Misleading Job Name

The job "E2E (PostgreSQL)" in `e2e-postgres.yml` is **misleading** - it uses SQLite, not PostgreSQL:
```yaml
# .env.ci
DATABASE_URL=file:./test.db
DIXIS_DATA_SRC=sqlite
```

### Neon Usage Summary

Neon secrets (`DATABASE_URL_PROD`, `DATABASE_URL_STAGING`) are used ONLY for:
- Production migrations/deployments
- Staging migrations/deployments

**NOT for any CI test workflows.**

## Files Changed

None - verification pass only.

## Conclusion

No Neon compute burn from CI E2E tests. The architecture already uses:
- SQLite for fast PR checks
- GitHub Actions postgres service for label-gated PG-specific tests
- Neon only for actual deployments
