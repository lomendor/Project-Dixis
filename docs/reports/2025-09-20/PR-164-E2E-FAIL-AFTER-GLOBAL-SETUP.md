# PR #164 — E2E failure after global-setup patch (2025-09-20)

**Run**: https://github.com/lomendor/Project-Dixis/actions/runs/17881275340/job/50849239370

## 🎯 **Analysis: E2E Seeder SQLite Compatibility Issue**

**Root Cause**: E2E seeder failing with SQLite - "no such table: users" error during second seeding operation

### ✅ **Progress Made**:
- ✅ **Global setup now accepts SQLite** (patch applied successfully)
- ✅ **Initial migrations ran successfully** with SQLite
- ✅ **First seeding completed** (database seeders all DONE)

### ❌ **New Issue: E2E Seeder SQLite Transaction**:
```sql
SQLSTATE[HY000]: General error: 1 no such table: users (Connection: sqlite,
SQL: select * from "users" where ("email" = test@dixis.local) limit 1)
```

**Problem**: E2E seeder runs migrations/seeding twice, and the second run encounters empty SQLite database

## Head (first 120 lines)
```
integration	Set up job	﻿2025-09-20T14:52:27.6799537Z Current runner version: '2.328.0'
integration	Set up job	2025-09-20T14:52:27.6842119Z ##[group]Runner Image Provisioner
integration	Set up job	2025-09-20T14:52:27.6843424Z Hosted Compute Agent
integration	Set up job	2025-09-20T14:52:27.6844076Z Version: 20250829.383
integration	Set up job	2025-09-20T14:52:27.6844782Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
integration	Set up job	2025-09-20T14:52:27.6845499Z Build Date: 2025-08-29T13:48:48Z
integration	Set up job	2025-09-20T14:52:27.6846120Z ##[endgroup]
integration	Set up job	2025-09-20T14:52:27.6846617Z ##[group]Operating System
integration	Set up job	2025-09-20T14:52:27.6847268Z Ubuntu
integration	Set up job	2025-09-20T14:52:27.6847773Z 24.04.3
integration	Set up job	2025-09-20T14:52:27.6848240Z LTS
integration	Set up job	2025-09-20T14:52:27.6848769Z ##[endgroup]
```

## Tail (last 200 lines)
```
integration	Run integration tests	2025-09-20T14:54:44.6753025Z   2025_08_31_112928_update_order_status_enums .................... 0.03ms DONE
integration	Run integration tests	2025-09-20T14:54:44.6765300Z   2025_09_15_195840_create_addresses_table ....................... 0.43ms DONE
integration	Run integration tests	2025-09-20T14:54:44.6777438Z   2025_09_15_195846_create_shipments_table ....................... 0.44ms DONE
integration	Run integration tests	2025-09-20T14:54:44.6825979Z   2025_09_15_195854_add_dimensions_and_currency_to_products_table  4.52ms DONE
integration	Run integration tests	2025-09-20T14:54:44.6827086Z
integration	Run integration tests	2025-09-20T14:54:44.6833489Z
integration	Run integration tests	2025-09-20T14:54:44.6833697Z    INFO  Seeding database.
integration	Run integration tests	2025-09-20T14:54:44.6834039Z
integration	Run integration tests	2025-09-20T14:54:44.6991275Z
integration	Run integration tests	2025-09-20T14:54:44.6991924Z 🔑 FRONTEND SMOKE TESTING CREDENTIALS:
integration	Run integration tests	2025-09-20T14:54:44.6992386Z    Consumer: consumer@example.com / password
integration	Run integration tests	2025-09-20T14:54:44.6993011Z    Producer: producer@example.com / password
integration	Run integration tests	2025-09-20T14:54:44.6993400Z    Admin: admin@example.com / password
integration	Run integration tests	2025-09-20T14:54:44.6993910Z    Consumer Token: 1|w8NhxWBwfZJdO78yatkFBI87foKXScjHrx7irkrI7400dd5a
integration	Run integration tests	2025-09-20T14:54:44.6994547Z    Producer Token: 2|7cPA4OyRUVhUGu4vpf09w83s0iIkrkYliVyKKngt2c06e0b4
integration	Run integration tests	2025-09-20T14:54:44.6994889Z
integration	Run integration tests	2025-09-20T14:54:44.6998016Z   Database\Seeders\ProducerSeeder .................................... RUNNING
integration	Run integration tests	2025-09-20T14:54:44.7007052Z   Database\Seeders\ProducerSeeder .................................. 0 ms DONE
integration	Run integration tests	2025-09-20T14:54:44.7007570Z
integration	Run integration tests	2025-09-20T14:54:44.7011991Z   Database\Seeders\CategorySeeder .................................... RUNNING
integration	Run integration tests	2025-09-20T14:54:44.7040053Z   Database\Seeders\CategorySeeder .................................. 2 ms DONE
integration	Run integration tests	2025-09-20T14:54:44.7040529Z
integration	Run integration tests	2025-09-20T14:54:44.7046151Z   Database\Seeders\ProductSeeder ..................................... RUNNING
integration	Run integration tests	2025-09-20T14:54:44.7127138Z   Database\Seeders\ProductSeeder ................................... 8 ms DONE
integration	Run integration tests	2025-09-20T14:54:44.7127638Z
integration	Run integration tests	2025-09-20T14:54:44.7132521Z   Database\Seeders\OrderSeeder ....................................... RUNNING
integration	Run integration tests	2025-09-20T14:54:44.7414983Z   Database\Seeders\OrderSeeder .................................... 28 ms DONE
integration	Run integration tests	2025-09-20T14:54:44.7415490Z
integration	Run integration tests	2025-09-20T14:54:44.7420866Z   Database\Seeders\E2ESeeder ......................................... RUNNING
integration	Run integration tests	2025-09-20T14:54:44.7450423Z 🔐 E2E Test Users Created:
integration	Run integration tests	2025-09-20T14:54:44.7450816Z    Consumer: test@dixis.local / Passw0rd!
integration	Run integration tests	2025-09-20T14:54:44.7451221Z    Producer: producer@dixis.local / Passw0rd!
integration	Run integration tests	2025-09-20T14:54:44.7501690Z ✅ E2E Seeder: Created deterministic users, 3 categories, 3 products (Greek & English for search)
integration	Run integration tests	2025-09-20T14:54:44.7505879Z   Database\Seeders\E2ESeeder ....................................... 8 ms DONE
integration	Run integration tests	2025-09-20T14:54:44.7506373Z
integration	Run integration tests	2025-09-20T14:54:44.8990695Z
integration	Run integration tests	2025-09-20T14:54:44.8991229Z    INFO  Seeding database.
integration	Run integration tests	2025-09-20T14:54:44.8991503Z
integration	Run integration tests	2025-09-20T14:54:44.9183348Z
⭐ CRITICAL ERROR (Lines 40-50):
integration	Run integration tests	2025-09-20T14:54:44.9207887Z In Connection.php line 824:
integration	Run integration tests	2025-09-20T14:54:44.9208573Z
integration	Run integration tests	2025-09-20T14:54:44.9209455Z   SQLSTATE[HY000]: General error: 1 no such table: users (Connection: sqlite,
integration	Run integration tests	2025-09-20T14:54:44.9210126Z    SQL: select * from "users" where ("email" = test@dixis.local) limit 1)
integration	Run integration tests	2025-09-20T14:54:44.9210960Z
integration	Run integration tests	2025-09-20T14:54:44.9211198Z
integration	Run integration tests	2025-09-20T14:54:44.9215451Z In Connection.php line 406:
integration	Run integration tests	2025-09-20T14:54:44.9216058Z
integration	Run integration tests	2025-09-20T14:54:44.9216748Z   SQLSTATE[HY000]: General error: 1 no such table: users
integration	Run integration tests	2025-09-20T14:54:44.9217179Z
integration	Run integration tests	2025-09-20T14:54:44.9217408Z
```

## Next actions (minimal)

### 🎯 **Issue**: Duplicate Seeding with SQLite

**Problem**: Global setup runs seeding twice:
1. `migrate:fresh --seed` (✅ works)
2. `db:seed --class=E2ESeeder` (❌ fails - empty database)

### 🔧 **Minimal Fix Options**:

**Option 1**: Remove duplicate seeding in global-setup.ts
```typescript
// Remove the second seeding call that's causing the issue
// execSync('php artisan db:seed --class=E2ESeeder --env=testing', {
//   cwd: backendCwd, stdio: 'inherit'
// });
```

**Option 2**: Add SQLite-safe database check before E2E seeding
```typescript
// Check if database is properly populated before E2E seeding
const tableCount = execSync("php artisan tinker --execute=\"echo \\App\\Models\\User::count();\"", {
  cwd: backendCwd
}).toString().trim();

if (tableCount === '0') {
  console.log('⚠️ Database empty, skipping E2E seeder');
} else {
  execSync('php artisan db:seed --class=E2ESeeder --env=testing', {
    cwd: backendCwd, stdio: 'inherit'
  });
}
```

### 📊 **Recommended**: Option 1 (remove duplicate seeding) - simplest and safest