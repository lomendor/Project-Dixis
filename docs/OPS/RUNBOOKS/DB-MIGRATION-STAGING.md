# Dixis — Staging DB Migration Runbook

**Σκοπός:** Ασφαλής δοκιμή των Prisma migrations σε **Staging** (αντίγραφο ή ξεχωριστή DB), πριν την Production.

## Προϋποθέσεις

- ✅ **Migration Clinic**: Πράσινο στο `main`
- ✅ **Staging DB**: Διαθέσιμη (ανεξάρτητη από production)
- ✅ **GitHub secret**: `DATABASE_URL_STAGING` ορισμένο

## Τι είναι το Staging?

Το **Staging** environment είναι ένα αντίγραφο της production που χρησιμοποιείται για:
- Testing migrations πριν την production
- Επιβεβαίωση ότι δεν υπάρχουν breaking changes
- Dry-run για timing estimates
- Validation ότι η εφαρμογή λειτουργεί μετά τη migration

## Εκτέλεση (GitHub Actions)

### Via Workflow (Προτεινόμενο)

1. **Navigate to**: Actions → **Staging Migration**
2. **Click**: Run workflow
3. **Input confirm**: Πληκτρολόγησε ΑΚΡΙΒΩΣ `DIXIS-STAGING-OK`
4. **Click**: Run workflow (πράσινο κουμπί)
5. **Monitor**: Παρακολούθησε τα logs real-time

**Προϋπόθεση**: Το secret `DATABASE_URL_STAGING` πρέπει να είναι ορισμένο.

### Via Command Line

```bash
gh workflow run "Staging Migration" \
  --repo lomendor/Project-Dixis \
  --ref main \
  -f confirm='DIXIS-STAGING-OK'
```

## Workflow Steps

1. **Setup**: Node 20 + pnpm
2. **Verify secret**: Checks `DATABASE_URL_STAGING` exists
3. **Install deps**: `pnpm install --frozen-lockfile`
4. **Prisma generate**: Generate client
5. **Prisma migrate deploy**: Apply all migrations to staging DB
6. **Prisma migrate status**: Verify all applied
7. **Prisma validate**: Validate schema

## Post-migration Checks

### 1. Verify migrations applied
```bash
# Expected: "Database schema is up to date!"
pnpm prisma migrate status
```

### 2. Validate schema
```bash
# Expected: "The schema at prisma/schema.prisma is valid 🚀"
pnpm prisma validate
```

### 3. Application smoke tests (if staging app deployed)
- ✅ Backend API: `GET /api/health` → 200 OK
- ✅ Frontend: Homepage loads
- ✅ Critical flows: Login, product listing, checkout

## Expected Timeline

| Phase | Duration |
|-------|----------|
| Setup + Install | 1-2 min |
| Migration execution | 2-5 min |
| Validation | 1 min |
| **Total** | **4-8 min** |

## Staging DB Setup Options

### Option A: Separate Staging Database
```sql
-- Create dedicated staging database
CREATE DATABASE dixis_staging;
```

**Pros**: Clean, independent testing
**Cons**: No production data patterns

### Option B: Production Snapshot/Clone
```bash
# Clone production DB to staging
pg_dump -Fc dixis_prod | pg_restore -d dixis_staging
```

**Pros**: Tests with production-like data
**Cons**: Must sanitize sensitive data

### Option C: Cloud Provider Snapshot
- AWS RDS: Create snapshot → Restore to new instance
- Digital Ocean: Clone database
- Heroku: Create follower database

## Troubleshooting

### Issue: Secret not found

**Error**: `❌ Missing secret: DATABASE_URL_STAGING`

**Solution**: Add secret in GitHub:
1. Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `DATABASE_URL_STAGING`
4. Value: `postgresql://user:pass@host:5432/dixis_staging`

### Issue: Migration fails on staging

**Symptoms**: Error during `prisma migrate deploy`

**Actions**:
1. Check logs for specific error
2. If safe, re-run (idempotent)
3. If blocking: Fix migration, test in Clinic, retry
4. **DO NOT** proceed to production until staging passes

### Issue: Schema validation fails

**Symptoms**: `prisma validate` reports errors

**Actions**:
1. Compare schema.prisma with database structure
2. Run `prisma db pull` to see what DB has
3. If mismatch: May need repair migration
4. Test repair in Clinic before applying

## Difference vs Production Migration

| Aspect | Staging | Production |
|--------|---------|------------|
| **Risk** | Low | Medium |
| **Confirm** | `DIXIS-STAGING-OK` | `DIXIS-PROD-OK` |
| **Secret** | `DATABASE_URL_STAGING` | `DATABASE_URL_PROD` |
| **Backup** | Optional | **Required** |
| **Maintenance** | Not needed | **Required** |
| **Rollback** | Restore or ignore | **Critical** |

## Success Criteria

**All must be GREEN before proceeding to production**:
- ✅ All migrations applied successfully
- ✅ `prisma migrate status` → "up to date"
- ✅ `prisma validate` → "valid"
- ✅ No errors in logs
- ✅ Application smoke tests pass (if staging app exists)

## Next Steps After Staging Success

1. **Document**: Record execution time, any issues
2. **Review**: Team review of staging results
3. **Plan production**: Use staging timing for prod window estimate
4. **Execute production**: Follow production runbook (DB-MIGRATION-PROD.md)

## Safety Notes

- ✅ **No production impact**: Staging uses separate database
- ✅ **Safe to retry**: All operations are idempotent
- ✅ **Manual only**: Workflow requires explicit confirmation
- ✅ **Secret isolated**: `DATABASE_URL_STAGING` separate from prod

## When to Run Staging Migration

**Run staging migration**:
- Before every production migration
- When testing new migrations
- After schema changes
- As part of deployment validation

**Skip staging migration** (only if):
- Emergency hotfix (still recommended if time permits)
- Already validated in production (rollback scenario)

---

**Last updated**: 2025-10-25
**Runbook version**: 1.0
**Related**: AG113 (Production Runbook), AG112 (Migration Clinic)
