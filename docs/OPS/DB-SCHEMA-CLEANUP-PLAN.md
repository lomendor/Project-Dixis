# DATABASE SCHEMA CLEANUP PLAN

**Created**: 2025-12-06
**Status**: 🟡 TECH DEBT - Cleanup needed
**Priority**: Medium (site works, but schema is messy)

---

## 1. CURRENT STATE

### Database: Neon PostgreSQL `dixis_prod`

**Dual Schema Situation**:
- Frontend (Next.js + Prisma) → uses **PascalCase** tables: `Product`, `Order`, `Producer`, etc.
- Backend (Laravel + Eloquent) → uses **snake_case** tables: `products`, `orders`, `producers`, etc.

**Why this happened**:
1. Frontend ran Prisma migrations first (November 2025) → created PascalCase schema
2. Backend never ran migrations until December 6, 2025 → finally added snake_case schema
3. PostgreSQL allowed both to coexist (case-sensitive table names)

**Current table count**:
- **9 Prisma tables**: `Product`, `Order`, `Producer`, `CheckoutOrder`, `Event`, `Notification`, `OrderItem`, `RateLimit`, `Waitlist`
- **34 Laravel tables**: `products`, `orders`, `producers`, `users`, `sessions`, `cache`, `jobs`, `permissions`, `roles`, `cart_items`, `shipments`, `commissions`, `tax_rates`, `categories`, `product_images`, `addresses`, `notifications`, `messages`, `fee_rules`, `commission_rules`, `commission_settlements`, `dixis_settings`, etc.
- **1 Metadata table**: `_prisma_migrations`
- **Total**: 44 tables (some conceptual duplicates like `Product`/`products`)

### Database Size & Performance Impact

- **Before migrations**: 728 KB (15 tables)
- **After migrations**: 1.48 MB (44 tables)
- **Impact**: Minimal performance overhead, but schema confusion for developers

---

## 2. TECH DEBT - WHAT NEEDS CLEANUP

### 2.1 Identify Schema Ownership

**Task**: Determine which system (Prisma vs Laravel) is the "source of truth" for each table type.

**Questions to answer**:
- Which tables are actively used by frontend? (check Next.js API routes)
- Which tables are actively used by backend? (check Laravel controllers)
- Are there any tables shared between both systems?
- Which schema has more complete data? (row counts, column completeness)

**Deliverable**:
- Spreadsheet or markdown table mapping each table to its active system
- Example:

  | Concept       | Prisma Table  | Laravel Table | Active System | Row Count (P/L) | Decision       |
  |---------------|---------------|---------------|---------------|-----------------|----------------|
  | Products      | Product       | products      | Both?         | TBD / 0         | Migrate to one |
  | Orders        | Order         | orders        | Both?         | TBD / 0         | Migrate to one |
  | Order Items   | OrderItem     | order_items   | Both?         | TBD / 0         | Migrate to one |
  | Producers     | Producer      | producers     | Both?         | TBD / 0         | Migrate to one |
  | Users         | User?         | users         | Laravel       | 0 / TBD         | Drop Prisma    |
  | Checkout      | CheckoutOrder | N/A           | Prisma only   | TBD / N/A       | Keep or merge  |
  | Events        | Event         | N/A           | Prisma only   | TBD / N/A       | Keep or merge  |
  | Notifications | Notification  | notifications | Both?         | TBD / 0         | Migrate to one |
  | Rate Limit    | RateLimit     | N/A           | Prisma only   | TBD / N/A       | Keep            |
  | Waitlist      | Waitlist      | N/A           | Prisma only   | TBD / N/A       | Keep            |

**SQL Query to Check Row Counts**:
```sql
-- Compare row counts between duplicate tables
SELECT 'Product (Prisma)' as source, COUNT(*) as count FROM "Product"
UNION ALL
SELECT 'products (Laravel)' as source, COUNT(*) as count FROM "products"
UNION ALL
SELECT 'Order (Prisma)' as source, COUNT(*) as count FROM "Order"
UNION ALL
SELECT 'orders (Laravel)' as source, COUNT(*) as count FROM "orders"
UNION ALL
SELECT 'Producer (Prisma)' as source, COUNT(*) as count FROM "Producer"
UNION ALL
SELECT 'producers (Laravel)' as source, COUNT(*) as count FROM "producers"
UNION ALL
SELECT 'OrderItem (Prisma)' as source, COUNT(*) as count FROM "OrderItem"
UNION ALL
SELECT 'order_items (Laravel)' as source, COUNT(*) as count FROM "order_items"
UNION ALL
SELECT 'Notification (Prisma)' as source, COUNT(*) as count FROM "Notification"
UNION ALL
SELECT 'notifications (Laravel)' as source, COUNT(*) as count FROM "notifications";
```

### 2.2 Choose Canonical Schema

**Options**:

**A) Migrate to Prisma-only** (PascalCase):
- ✅ Pros: Frontend already uses it, modern ORM, type-safe
- ❌ Cons: Laravel ecosystem expects snake_case, need to configure all models
- Effort: Medium (update Laravel models to specify table names)

**B) Migrate to Laravel-only** (snake_case):
- ✅ Pros: Standard Laravel conventions, no model config needed
- ❌ Cons: Need to migrate frontend from Prisma to Laravel API or update Prisma schema
- Effort: Medium (update Prisma schema to use snake_case or migrate frontend data access)

**C) Unified Schema** (pick one naming convention):
- ✅ Pros: Clean, no duplicates, single source of truth
- ❌ Cons: Requires data migration from one schema to the other
- Effort: High (write migration scripts, validate data integrity)

**Recommendation**:
- **Short-term**: Keep dual schema working (current state) ✅ **DONE**
- **Medium-term**: Analyze which tables have data and are actively used
- **Long-term**: Migrate to **Laravel-only** (snake_case) because:
  - Backend is the API source of truth
  - Frontend can adapt Prisma schema to use snake_case (`@@map("products")`)
  - Easier to maintain one authoritative schema
  - Laravel RBAC, permissions, commissions already in snake_case

### 2.3 Data Migration Strategy

**IF we choose to unify schemas, we need**:

#### Phase 1: Data Audit
```sql
-- Check schema differences between duplicate tables
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Product'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Find schema mismatches (columns that don't exist in both)
SELECT 'Only in Product' as location, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Product'
  AND column_name NOT IN (
    SELECT column_name FROM information_schema.columns WHERE table_name = 'products'
  )
UNION ALL
SELECT 'Only in products' as location, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name NOT IN (
    SELECT column_name FROM information_schema.columns WHERE table_name = 'Product'
  );
```

#### Phase 2: Migration Script Design
- Write SQL script to copy data from Prisma → Laravel tables (or vice versa)
- Handle ID mapping (if foreign keys differ)
- Handle schema differences (extra columns, different types)
- Validate data integrity (checksums, row counts)
- Test migration on staging database first

**Example Migration Script** (Prisma → Laravel):
```sql
-- Example: Migrate Product → products
BEGIN;

-- Insert products that don't exist in Laravel table
INSERT INTO products (
  id, name, description, price, stock, created_at, updated_at
)
SELECT
  id, title as name, description, price, quantity as stock,
  "createdAt" as created_at, "updatedAt" as updated_at
FROM "Product"
WHERE id NOT IN (SELECT id FROM products);

-- Verify row counts match
DO $$
DECLARE
  prisma_count INTEGER;
  laravel_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO prisma_count FROM "Product";
  SELECT COUNT(*) INTO laravel_count FROM products;

  IF prisma_count != laravel_count THEN
    RAISE EXCEPTION 'Row count mismatch: Product=%, products=%', prisma_count, laravel_count;
  END IF;

  RAISE NOTICE 'Migration successful: % rows', laravel_count;
END $$;

COMMIT;
```

#### Phase 3: Application Updates
- **Frontend** (if migrating to Laravel schema):
  - Update Prisma schema to use Laravel table names:
    ```prisma
    model Product {
      id    String @id @default(uuid())
      name  String
      price Float

      @@map("products")  // Maps to snake_case table
    }
    ```
  - Regenerate Prisma client: `npx prisma generate`
  - Update API routes that directly query database

- **Backend** (if migrating to Prisma schema):
  - Update Laravel models to specify Prisma table names:
    ```php
    class Product extends Model {
        protected $table = 'Product';  // PascalCase table name
    }
    ```
  - Run tests to ensure nothing breaks

#### Phase 4: Cutover
- Schedule maintenance window (3-5 AM EET, low traffic)
- Run migration script on production during maintenance
- Drop old tables after 7-day validation period
- Monitor error logs for query failures

### 2.4 Orphan Table Cleanup

**Task**: Identify and drop tables that aren't used by either system.

**Process**:
1. Use `pg_stat_user_tables` to see table access stats:
   ```sql
   SELECT
     schemaname,
     relname,
     seq_scan,
     seq_tup_read,
     idx_scan,
     idx_tup_fetch,
     n_live_tup as row_count
   FROM pg_stat_user_tables
   WHERE schemaname = 'public'
   ORDER BY seq_scan + idx_scan DESC;
   ```

2. Identify zero-activity tables over 7 days
3. Verify in code (grep for table name in codebase):
   ```bash
   # Check if table is referenced in code
   cd /path/to/project
   grep -r "RateLimit" --include="*.ts" --include="*.tsx" --include="*.php"
   grep -r "rate_limit" --include="*.ts" --include="*.tsx" --include="*.php"
   ```

4. Drop if confirmed unused:
   ```sql
   DROP TABLE IF EXISTS unused_table CASCADE;
   ```

### 2.5 Future Guardrails

**Prevent dual-schema situation from happening again**:

1. **Migration Policy**:
   - Document: "Frontend and Backend share ONE database schema"
   - Rule: "All schema changes must go through Laravel migrations"
   - Prisma schema file should be **generated from Laravel schema** (not source of truth)

2. **CI/CD Checks**:
   - Add workflow step: Compare Prisma schema with Laravel migrations
   - Fail CI if schemas diverge
   - Automated alert if new tables created outside migration system
   - Example GitHub Action:
     ```yaml
     - name: Verify Schema Sync
       run: |
         cd backend && php artisan schema:export > /tmp/laravel-schema.sql
         cd frontend && npx prisma migrate diff --from-schema-datamodel schema.prisma --to-schema-datasource > /tmp/prisma-diff.txt
         if [ -s /tmp/prisma-diff.txt ]; then
           echo "❌ Schema mismatch detected!"
           cat /tmp/prisma-diff.txt
           exit 1
         fi
     ```

3. **Deployment Checklist**:
   - Before VPS deploy: Verify migration status on all environments
   - After deploy: Run `php artisan migrate:status` and verify all migrations applied
   - Monitor logs for "table does not exist" errors
   - Check `_prisma_migrations` vs `migrations` tables for divergence

4. **Schema Sync Automation**:
   - Script to generate Prisma schema from Laravel migrations
   - Run on every backend schema change
   - Commit Prisma schema updates with migration PRs
   - Example script:
     ```bash
     #!/bin/bash
     # sync-prisma-schema.sh

     cd backend
     php artisan schema:export --connection=pgsql > schema.sql

     cd ../frontend
     npx prisma db pull --schema=./prisma/schema.prisma
     npx prisma format

     git add prisma/schema.prisma
     git commit -m "chore: sync Prisma schema from Laravel migrations"
     ```

---

## 3. SAFETY NOTES

### Critical Constraints for Cleanup Work

⚠️ **NEVER perform destructive operations without explicit approval**:
- ❌ NO `DROP TABLE` on production without backup + approval
- ❌ NO `TRUNCATE` without data export first
- ❌ NO `ALTER TABLE` that might lock tables during business hours
- ❌ NO schema changes during peak traffic times (9 AM - 9 PM EET)
- ❌ NO foreign key changes without cascade analysis

✅ **Always follow safe procedure**:
1. **Backup first**: `pg_dump` or Neon snapshot before any changes
   ```bash
   # Create Neon snapshot via API or console
   # Or manual pg_dump:
   pg_dump "postgresql://neondb_owner:PASSWORD@HOST/dixis_prod?sslmode=require" > backup-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Test on staging**: Run cleanup script on staging DB first
   - Use Neon branch feature to create test branch
   - Apply changes to branch
   - Validate application still works
   - Merge branch to main if successful

3. **Dry-run mode**: Implement `--dry-run` flag that shows what would happen
   ```bash
   ./cleanup-dual-schema.sh --dry-run  # Shows plan
   ./cleanup-dual-schema.sh --execute  # Executes changes
   ```

4. **Rollback plan**: Document exact steps to undo changes
   - Keep `migrations` table backup before cleanup
   - Keep SQL dump of tables before DROP
   - Document foreign key dependencies

5. **Maintenance window**: Schedule during low-traffic hours (3-5 AM EET)
   - Announce downtime 24h in advance
   - Enable maintenance mode: `php artisan down`
   - Perform cleanup
   - Disable maintenance mode: `php artisan up`

6. **Monitoring**: Watch error logs for 24h after cleanup
   - Laravel logs: `/var/www/dixis/current/backend/storage/logs/laravel.log`
   - Next.js logs: `pm2 logs dixis-frontend`
   - Database slow queries: `php artisan db:slow-queries`

### Example Dry-Run Script

```bash
#!/bin/bash
# cleanup-dual-schema.sh

set -euo pipefail

DRY_RUN=${1:---dry-run}
DB_URL="postgresql://neondb_owner:PASSWORD@HOST/dixis_prod?sslmode=require"

if [[ "$DRY_RUN" == "--dry-run" ]]; then
  echo "🔍 DRY RUN MODE - No changes will be made"
  echo ""
  echo "Would execute the following operations:"
  echo ""
  echo "1. Data Migration"
  echo "   - Copy Product → products (estimate: 150 rows)"
  echo "   - Copy Order → orders (estimate: 85 rows)"
  echo "   - Copy OrderItem → order_items (estimate: 320 rows)"
  echo ""
  echo "2. Validation"
  echo "   - Verify row counts match"
  echo "   - Verify foreign key integrity"
  echo "   - Checksum comparison"
  echo ""
  echo "3. Cleanup"
  echo "   - Drop table Product CASCADE"
  echo "   - Drop table Order CASCADE"
  echo "   - Drop table OrderItem CASCADE"
  echo "   - Drop table _prisma_migrations"
  echo ""
  echo "4. Post-cleanup"
  echo "   - VACUUM ANALYZE"
  echo "   - Rebuild indexes"
  echo ""
  echo "Estimated time: 5-10 minutes"
  echo "Estimated downtime: 0 minutes (online operation)"
  echo ""
  echo "Run with --execute to apply changes"
  exit 0
fi

echo "⚠️  EXECUTE MODE - This will modify production database!"
read -p "Are you sure? Type 'yes' to continue: " confirm

if [[ "$confirm" != "yes" ]]; then
  echo "Aborted."
  exit 1
fi

echo "🚀 Starting cleanup..."

# Actual cleanup logic here...
psql "$DB_URL" <<EOF
BEGIN;

-- Example: Migrate data from Prisma to Laravel tables
INSERT INTO products SELECT * FROM "Product"
ON CONFLICT (id) DO NOTHING;

-- Verify
DO \$\$
DECLARE
  prisma_count INTEGER;
  laravel_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO prisma_count FROM "Product";
  SELECT COUNT(*) INTO laravel_count FROM products;
  IF prisma_count != laravel_count THEN
    RAISE EXCEPTION 'Migration failed: counts do not match';
  END IF;
END \$\$;

-- Drop old table
DROP TABLE "Product" CASCADE;

COMMIT;
EOF

echo "✅ Cleanup complete!"
```

---

## 4. EXECUTION TIMELINE (Proposed)

### Immediate (Today - Dec 6, 2025)
- ✅ Document current state (this file)
- ✅ Update STATE.md with dual-schema note
- ✅ Site is working (no immediate action needed)
- ⏸️ VPS unreachable - waiting for network to restore

### Week 1 (Dec 7-13, 2025)
- Data audit: Compare Prisma vs Laravel table contents
- Schema analysis: Document column differences
- Usage analysis: Track which tables are actively queried
- **Deliverable**: Schema ownership matrix (see section 2.1)

### Week 2 (Dec 14-20, 2025)
- Choose canonical schema (Prisma vs Laravel)
- Design migration script
- Test migration on local dev database
- Create Neon staging branch for testing
- **Deliverable**: Tested migration script

### Week 3 (Dec 21-27, 2025)
- Test migration on staging database (Neon branch)
- Validate data integrity
- Update application code to use unified schema
- Run full test suite (E2E + unit tests)
- **Deliverable**: PR with schema unification changes

### Week 4 (Dec 28, 2025 - Jan 3, 2026)
- Schedule maintenance window (Jan 2, 3-5 AM EET)
- Execute migration on production
- Drop duplicate tables after validation
- Monitor logs for 48 hours
- **Deliverable**: Clean production schema

---

## 5. DECISION LOG

**2025-12-06**: Created dual-schema setup as emergency fix for production outage
- **Decision**: Run Laravel migrations WITHOUT dropping Prisma tables
- **Rationale**: Site down ("products table does not exist" error), need immediate fix, safe to coexist temporarily
- **Trade-off**: Accept tech debt for production uptime
- **Migration method**: Direct Neon DB connection from local Laravel (VPS SSH unreachable)

**Next Decision Required**: Choose canonical schema (Prisma vs Laravel)
- **When**: After data audit complete (Week 1)
- **Who**: Tech lead + product owner
- **Input needed**: Table usage stats, row counts, code dependencies

---

## 6. REFERENCES

**Related Files**:
- `/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis/backend/database/migrations/` - 49 Laravel migration files
- `/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis/frontend/prisma/schema.prisma` - Prisma schema (PascalCase)
- `docs/OPS/STATE.md` - Production state log

**Database Access**:
- Neon Console: https://console.neon.tech/
- Database: `dixis_prod`
- Connection string: See VPS `.env` files (keep secret)
- PostgreSQL version: 17.7

**Monitoring**:
- VPS logs (when accessible): `/var/www/dixis/current/backend/storage/logs/laravel.log`
- Database stats: `php artisan db:show`
- Query slow log: `php artisan db:slow-queries` (AG116.8 feature)
- Table access stats: `pg_stat_user_tables` system view

**Neon Features**:
- Branching: Create test branches for safe schema experiments
- Time-travel: Query historical data without snapshots
- Autoscaling: Database scales with load automatically
- Point-in-time recovery: Restore to any point in time

---

## 7. RISKS & MITIGATION

### Risk 1: Data Loss During Migration
**Probability**: Low
**Impact**: High
**Mitigation**:
- Always backup before migration
- Use transactions for atomicity
- Dry-run on staging first
- Keep backups for 30 days

### Risk 2: Downtime During Cleanup
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Online schema changes (no exclusive locks)
- Maintenance window during low traffic
- Blue-green deployment if possible
- Rollback plan ready

### Risk 3: Application Breaks After Schema Change
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Full test suite run before deployment
- Staging environment validation
- Gradual rollout (canary deployment)
- Feature flags for schema-dependent code

### Risk 4: Schema Diverges Again in Future
**Probability**: High (without guardrails)
**Impact**: Medium
**Mitigation**:
- CI/CD schema validation checks
- Migration policy enforcement
- Automated schema sync scripts
- Code review requirements for schema changes

---

**Last Updated**: 2025-12-06
**Owner**: Tech Team
**Review**: Quarterly (or when schema changes needed)
