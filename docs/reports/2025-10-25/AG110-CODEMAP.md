# AG110 — CODEMAP

## New File

### .github/workflows/migration-clinic.yml
Label-triggered workflow for Prisma migration validation on clean PostgreSQL.

**Features**:
- **Triggers**:
  - Manual: `workflow_dispatch`
  - Auto: PR with `migration-clinic` label
- **PostgreSQL Service**: Fresh Postgres 15 container
- **Shadow Database**: For Prisma migration validation
- **Steps**:
  1. `pnpm prisma generate` - Generate Prisma client
  2. `pnpm prisma migrate status` - Check migration status
  3. `pnpm prisma migrate deploy` - Apply migrations to clean DB
  4. `pnpm prisma db validate` - Validate schema consistency
  5. Upload migration artifacts

**Use Cases**:
- Validate migrations work on clean database
- Catch missing migration steps
- Ensure schema consistency before production deploy
- Debug migration issues in isolation

**Configuration**:
```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dixis_ci?schema=public
SHADOW_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dixis_ci_shadow?schema=shadow
```

## Impact
- ✅ CI-only, no runtime changes
- ✅ Safe dry-run for migration validation
- ✅ Catches schema drift before production
- ✅ Artifact upload for debugging
