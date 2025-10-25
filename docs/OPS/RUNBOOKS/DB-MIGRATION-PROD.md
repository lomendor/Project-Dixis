# Dixis — Production DB Migration Runbook

**Σκοπός:** Ασφαλής εκτέλεση των Prisma migrations στη production Postgres.

## Προϋποθέσεις (όλα «ΝΑΙ»)

- ✅ **Migration Clinic**: Πράσινο στο `main`
- ✅ **Code freeze**: Για το παράθυρο συντήρησης
- ✅ **Full backup**: `pg_dump -Fc` ή snapshot από τον πάροχο
- ✅ **GitHub secrets**: `DATABASE_URL_PROD` (και προαιρετικά `SHADOW_DATABASE_URL_PROD`)
- ✅ **Maintenance window**: Συμφωνημένο (Europe/Athens). Banner/maintenance σε web αν χρειάζεται

## Dry-run σε Staging (προτείνεται)

1. Πάρε αντίγραφο της prod (snapshot/restore) σε staging
2. Θέσε `DATABASE_URL` προς staging και τρέξε:
   ```bash
   cd frontend
   pnpm prisma migrate deploy
   pnpm prisma migrate status
   pnpm prisma validate
   ```
3. Επιβεβαίωσε ότι όλες οι migrations εφαρμόζονται χωρίς errors
4. Έλεγξε την εφαρμογή με το staging database

## Εκτέλεση σε Production (χειροκίνητη)

### Επιλογή Α – από το τερματικό (script με «διπλό φρένο»)

```bash
export DATABASE_URL="postgresql://user:pass@host:5432/dixis_prod"
export SHADOW_DATABASE_URL="postgresql://user:pass@host:5432/dixis_prod_shadow"  # προαιρετικό

./scripts/db/migrate_prod.sh
```

**Το script θα ζητήσει επιβεβαίωση**: Πληκτρολόγησε ΑΚΡΙΒΩΣ `DIXIS-PROD-OK` για να συνεχίσει.

### Επιλογή Β – μέσω GitHub Actions (manual)

1. Navigate to: **Actions** → **Production Migration**
2. Click **Run workflow**
3. Input field: Πληκτρολόγησε ΑΚΡΙΒΩΣ `DIXIS-PROD-OK`
4. Click **Run workflow** (πράσινο κουμπί)
5. Παρακολούθησε τα logs real-time

**Προϋπόθεση**: Το secret `DATABASE_URL_PROD` πρέπει να είναι ορισμένο στο repository.

## Rollback Plan

### Προτιμώμενο: Restore από backup
```bash
# PostgreSQL restore
pg_restore -d dixis_prod dixis_prod_backup.dump

# ή snapshot restore από cloud provider
# (AWS RDS, Digital Ocean, Heroku, κλπ.)
```

**Σημείωση**: Τα Prisma down migrations δεν είναι εγγυημένα. Πάντα προτιμάμε full restore.

### Εναλλακτικό: Hotfix migration
Αν το rollback δεν είναι εφικτό (π.χ. υπάρχουν ήδη production data):
1. Δημιούργησε repair migration τοπικά
2. Test σε staging
3. Deploy μέσω standard Migration Clinic workflow

## Post-migration έλεγχοι

### 1. Verify migrations
```bash
cd frontend
pnpm prisma migrate status
# Expected: "Database schema is up to date!"

pnpm prisma validate
# Expected: "The schema at prisma/schema.prisma is valid 🚀"
```

### 2. Application health checks
- ✅ Backend API: `GET /api/health` → 200 OK
- ✅ Frontend loads: Homepage accessible
- ✅ Critical flows: Login, product listing, checkout
- ✅ Database connections: Check connection pool metrics

### 3. Monitor logs
- Check for unexpected errors in application logs
- Monitor database slow query logs
- Watch for constraint violations or FK errors

## Migration Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Pre-checks | 5 min | Verify backup, secrets, staging dry-run |
| Maintenance banner | 2 min | Put up maintenance page |
| Migration execution | 2-5 min | Depends on data volume |
| Post-checks | 5 min | Validation + smoke tests |
| **Total** | **15-20 min** | Buffer for unexpected issues |

## Maintenance Window Communication

### Before maintenance
**24h notice** (email + in-app banner):
```
Προγραμματισμένη συντήρηση: [DATE] [TIME] Europe/Athens
Διάρκεια: ~20 λεπτά
Κατά τη διάρκεια της συντήρησης η εφαρμογή δεν θα είναι προσβάσιμη.
```

### During maintenance
Display maintenance page:
```html
<h1>Συντήρηση σε εξέλιξη</h1>
<p>Θα επιστρέψουμε σύντομα!</p>
<p>Εκτιμώμενη ολοκλήρωση: [TIME]</p>
```

### After maintenance
**Confirmation notice**:
```
✅ Η συντήρηση ολοκληρώθηκε επιτυχώς!
Η εφαρμογή είναι ξανά διαθέσιμη.
```

## Troubleshooting

### Issue: Migration fails mid-execution

**Symptoms**: Error during `prisma migrate deploy`, some migrations applied

**Actions**:
1. **DO NOT PANIC** - migrations are transactional when possible
2. Check logs for specific error
3. If safe, re-run `prisma migrate deploy` (idempotent)
4. If blocking error: Restore from backup + investigate offline

### Issue: Schema validation fails after migration

**Symptoms**: `prisma validate` reports errors

**Actions**:
1. Check `prisma migrate status` - all migrations applied?
2. Compare schema.prisma with database structure
3. If mismatch: May need repair migration
4. If critical: Restore from backup

### Issue: Application fails to start after migration

**Symptoms**: 500 errors, connection errors, data access errors

**Actions**:
1. Check database connection string (correct host/credentials?)
2. Verify Prisma Client generated: `pnpm prisma generate`
3. Check for missing indexes (performance issue, not blocker)
4. If data corruption: Restore from backup immediately

## Security Checklist

- [ ] **Backup verified**: Tested restore process in staging
- [ ] **Secrets rotation**: Consider rotating DB credentials after migration
- [ ] **Access logs**: Review who accessed production during maintenance
- [ ] **Audit trail**: Document who executed migration, when, from where
- [ ] **Rollback tested**: Verified backup restore works

## Appendix: Migration History

| Date | Migration | Status | Notes |
|------|-----------|--------|-------|
| 2025-10-25 | AG112.4 fix | ✅ Verified in Clinic | All 7 migrations pass on clean DB |
| TBD | First prod run | Pending | This runbook |

## Contact & Escalation

**On-call engineer**: [NAME] ([PHONE])
**Backup contact**: [NAME] ([PHONE])
**Database provider support**: [SUPPORT LINK]

**Emergency decision maker**: Product Owner / CTO

---

**Last updated**: 2025-10-25
**Runbook version**: 1.0
**Related**: AG112 migration repair series (AG112.2-AG112.5)
