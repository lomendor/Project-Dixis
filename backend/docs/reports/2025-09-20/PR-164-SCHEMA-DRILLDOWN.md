# PR #164 — Schema Conflict Drilldown (2025-09-20)

## TL;DR
- **Primary Issue**: Migration `2025_08_31_112928_update_order_status_enums.php` uses PostgreSQL-specific PL/pgSQL syntax (`DO $$` blocks) that is incompatible with SQLite and other databases
- **Migration Changes**: PR removes 4 migrations from main and adds 1 shipments migration in different timestamp
- **Laravel Version Conflict**: PR includes Laravel upgrade from v11.45.2 → v12.28.1 which may introduce breaking changes
- **Root Cause**: Database-specific code violates Laravel's database abstraction principles

## Migrate/Seed run (first 120 lines)
```
INFO  Preparing database.  

  Creating migration table ....................................... 2.17ms DONE

   INFO  Running migrations.  

  0001_01_01_000000_create_users_table ........................... 0.77ms DONE
  0001_01_01_000001_create_cache_table ........................... 0.15ms DONE
  0001_01_01_000002_create_jobs_table ............................ 0.50ms DONE
  2025_08_24_092756_create_producers_table ....................... 0.15ms DONE
  2025_08_24_092816_create_products_table ........................ 0.19ms DONE
  2025_08_24_140748_create_personal_access_tokens_table .......... 0.20ms DONE
  2025_08_24_140800_create_permission_tables ..................... 1.64ms DONE
  2025_08_24_140858_add_user_id_to_producers_table ............... 4.44ms DONE
  2025_08_24_140919_add_role_to_users_table ...................... 0.13ms DONE
  2025_08_24_141441_create_messages_table ........................ 0.15ms DONE
  2025_08_24_141936_add_is_active_to_products_table .............. 0.13ms DONE
  2025_08_24_191037_create_orders_table .......................... 0.21ms DONE
  2025_08_24_191114_create_order_items_table ..................... 0.16ms DONE
  2025_08_24_191140_add_foreign_keys_to_orders_and_items ......... 1.98ms DONE
  2025_08_24_193156_update_users_role_to_enum .................... 0.63ms DONE
  2025_08_24_193449_add_slug_to_producers_table .................. 0.76ms DONE
  2025_08_24_193813_add_missing_fields_to_products_table ......... 0.41ms DONE
  2025_08_24_193837_add_foreign_key_to_products_table ............ 0.62ms DONE
  2025_08_25_033449_update_order_status_enum_to_include_paid ..... 0.03ms DONE
  2025_08_25_033526_add_is_active_to_producers_table ............. 0.19ms DONE
  2025_08_25_133747_rename_body_to_content_in_messages_table ..... 0.59ms DONE
  2025_08_25_153357_create_categories_table ...................... 0.15ms DONE
  2025_08_25_153421_create_product_category_table ................ 0.21ms DONE
  2025_08_25_153529_create_product_images_table .................. 0.20ms DONE
  2025_08_25_160748_create_cart_items_table ...................... 0.17ms DONE
  2025_08_25_160814_add_foreign_keys_to_cart_items_table ......... 0.65ms DONE
  2025_08_26_154152_adjust_orders_schema_to_requirements ......... 0.54ms DONE
  2025_08_26_154228_add_producer_id_to_order_items ............... 0.23ms DONE
  2025_08_26_154250_add_producer_foreign_key_to_order_items ...... 0.70ms DONE
  2025_08_26_154528_make_user_id_nullable_in_orders_table ........ 0.76ms DONE
  2025_08_26_154627_revert_order_status_enum_to_requirements ..... 0.03ms DONE
  2025_08_26_180814_add_currency_to_orders_table_if_missing ...... 0.23ms DONE
  2025_08_26_191144_add_greek_fields_to_producers_table .......... 1.64ms DONE
  2025_08_26_191149_add_discount_seasonal_to_products_table ...... 0.40ms DONE
  2025_08_26_191855_add_producer_indexes ......................... 0.33ms DONE
  2025_08_31_112928_update_order_status_enums .................... 0.08ms FAIL
```

## Migrate/Seed run (last 200 lines)
```
In Connection.php line 824:
                                                                               
  SQLSTATE[HY000]: General error: 1 near "DO": syntax error (Connection: sqli  
  te, SQL:                                                                     
              DO $$                                                            
              DECLARE r RECORD;                                                
              BEGIN                                                            
                  FOR r IN SELECT conname FROM pg_constraint                   
                  WHERE conrelid = 'orders'::regclass AND contype = 'c' AND c  
  onname LIKE 'orders_%_check'                                                 
                  LOOP                                                         
                      EXECUTE 'ALTER TABLE orders DROP CONSTRAINT ' || quote_  
  ident(r.conname) || ' CASCADE';                                              
                  END LOOP;                                                    
              END$$;                                                           
          )                                                                    
                                                                               

In Connection.php line 564:
                                                             
  SQLSTATE[HY000]: General error: 1 near "DO": syntax error
```

## Migrations: main vs PR (diff)
```diff
--- /tmp/main_migrations.txt	2025-09-20 16:55:02
+++ /tmp/pr_migrations.txt	2025-09-20 16:55:02
@@ -36,8 +36,5 @@
 2025_08_31_112928_update_order_status_enums.php
 2025_08_31_113027_fix_order_constraints_properly.php.disabled
 2025_09_15_195840_create_addresses_table.php
+2025_09_15_195846_create_shipments_table.php
 2025_09_15_195854_add_dimensions_and_currency_to_products_table.php
-2025_09_16_000001_add_payment_intent_id_to_orders_table.php
-2025_09_16_142841_add_refund_fields_to_orders_table.php
-2025_09_16_145301_create_notifications_table.php
-2025_09_16_200917_create_shipments_table.php
```

## Conflict Map

### 🔴 Critical Database Compatibility Issues
- **Migration**: `2025_08_31_112928_update_order_status_enums.php`
- **Problem**: Uses PostgreSQL-specific PL/pgSQL syntax (`DO $$` blocks, `pg_constraint` catalog)
- **Impact**: Breaks on SQLite, MySQL, and any non-PostgreSQL database
- **Code Location**: Lines 34-44 in `fixOrdersConstraints()` method

### 🟠 Migration Timeline Conflicts  
- **Removed Migrations** (from main branch):
  - `2025_09_16_000001_add_payment_intent_id_to_orders_table.php` 
  - `2025_09_16_142841_add_refund_fields_to_orders_table.php`
  - `2025_09_16_145301_create_notifications_table.php`
  - `2025_09_16_200917_create_shipments_table.php`
- **Added Migration**: `2025_09_15_195846_create_shipments_table.php` (earlier timestamp)
- **Risk**: Migration rollback conflicts, dependency issues with removed tables

### 🟡 Framework Version Conflicts
- **Laravel Upgrade**: v11.45.2 → v12.28.1 (major version bump)
- **Risk**: Breaking changes in Laravel 12 may affect existing migrations/seeders
- **Impact**: Untested migration compatibility with new Laravel version

## Minimal Fix Plan (DO NOT APPLY YET)

### Priority 1: Database Compatibility Fix
**File**: `database/migrations/2025_08_31_112928_update_order_status_enums.php`
**Issue**: PostgreSQL-specific syntax in `fixOrdersConstraints()` method
**Solution**: Replace PL/pgSQL with Laravel-compatible constraint management:

```php
private function fixOrdersConstraints(): void 
{
    // Use Laravel's Schema builder instead of raw PostgreSQL
    Schema::table('orders', function (Blueprint $table) {
        // Drop existing enum constraints using Laravel methods
        $table->dropColumn('status');
        $table->dropColumn('payment_status');
    });
    
    Schema::table('orders', function (Blueprint $table) {
        // Recreate with new enum values
        $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'delivered', 'cancelled'])->default('pending');
        $table->enum('payment_status', ['pending', 'paid', 'completed', 'failed', 'refunded'])->default('pending');
    });
}
```

### Priority 2: Migration Dependency Resolution
**Issue**: Removed migrations may be referenced by seeders or other code
**Solution**: 
1. Verify no seeders depend on removed tables (`payment_intent_id`, `refund_*` fields, `notifications`)
2. If dependencies exist, create minimal migration stubs or update seeders
3. Ensure `shipments` table migration ordering doesn't break foreign key relationships

### Priority 3: Laravel Version Compatibility
**Issue**: Major version upgrade may introduce breaking changes
**Solution**:
1. Test all existing migrations against Laravel 12 syntax requirements
2. Review Laravel 12 migration documentation for deprecated methods
3. Consider creating separate PR for Laravel upgrade vs. schema changes

## Next Steps

### Immediate Actions (Required for CI fix)
1. **Convert PostgreSQL-specific migration** to use Laravel's database-agnostic Schema builder
2. **Test migration locally** on both PostgreSQL and SQLite to ensure compatibility
3. **Verify seeder compatibility** with removed migration fields

### Recommended Approach
1. **Option A (Quick Fix)**: Create patch PR that fixes only the PostgreSQL compatibility issue
2. **Option B (Comprehensive)**: Convert PR to draft, resolve all migration conflicts locally, then reopen
3. **Option C (Split)**: Separate Laravel upgrade from schema changes into different PRs

### Risk Assessment
- **High Risk**: Database-specific code violates Laravel best practices
- **Medium Risk**: Migration timeline changes may affect existing deployments  
- **Low Risk**: Shipments table migration appears clean and compatible

---
*Generated on: Σαβ 20 Σεπ 2025 16:56:42 EEST*
*Context: Read-only analysis of PR #164 schema conflicts*
