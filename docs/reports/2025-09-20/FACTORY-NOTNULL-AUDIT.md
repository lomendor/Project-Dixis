# Laravel Factories vs Schema — NOT NULL Coverage

Date: 2025-09-20

Analyzed scope: backend/database/migrations, backend/database/factories, backend/database/seeders

## Summary
Table | NOT NULL columns missing from factories/seeders | Representative PR/Context
--- | --- | ---
cart_items | user_id, product_id, quantity | N/A (core table, used by cart flows)
shipments | order_id | N/A (optional feature, not seeded)
permissions (spatie) | name, guard_name | RBAC only if used
roles (spatie) | name, guard_name | RBAC only if used

Note: Pivot `category_product` is fed via relation sync() in seeders and is considered covered.

## Top 5 Critical Findings
- cart_items: user_id, product_id, quantity
- shipments: order_id
- permissions: name, guard_name (only if RBAC used)
- roles: name, guard_name (only if RBAC used)
- (none)

## Details & Examples

### cart_items
- Missing: user_id, product_id, quantity
- Migration refs:
  - backend/database/migrations/2025_08_25_160748_create_cart_items_table.php:17
  - backend/database/migrations/2025_08_25_160748_create_cart_items_table.php:18
  - backend/database/migrations/2025_08_25_160748_create_cart_items_table.php:19
- Suggested defaults:
  - user_id: RelatedModel::factory() (User::factory())
  - product_id: RelatedModel::factory() (Product::factory())
  - quantity: faker()->numberBetween(1,3)

### shipments
- Missing: order_id
- Migration refs:
  - backend/database/migrations/2025_09_15_195846_create_shipments_table.php:16
- Suggested defaults:
  - order_id: RelatedModel::factory() (Order::factory())
  - status: 'pending' (if making non-nullable later)

### permissions (spatie/laravel-permission)
- Missing: name, guard_name
- Migration refs:
  - backend/database/migrations/2025_08_24_140800_create_permission_tables.php:26 / :27
- Suggested defaults:
  - name: e.g., 'manage.orders'
  - guard_name: 'web'

### roles (spatie/laravel-permission)
- Missing: name, guard_name
- Migration refs:
  - backend/database/migrations/2025_08_24_140800_create_permission_tables.php:40 / :41
- Suggested defaults:
  - name: 'admin'
  - guard_name: 'web'

## Covered By Seeders (for context)
- addresses: created via relation in `backend/database/seeders/ErdMvpSeeder.php` (user->addresses()->firstOrCreate)
- product_images: created via `ProductImage::firstOrCreate` in ProductSeeder
- category_product: covered by `$product->categories()->sync([...])` in ProductSeeder
- products, producers, categories, orders, order_items, messages: covered via factories/seeders

## Quick Recommendations (one-liners)
- Add `CartItemFactory` with `user_id`, `product_id`, `quantity` basics.
- Add `ShipmentFactory` with `order_id` + optional status.
- If RBAC is used: add a tiny seeder for default `roles` and `permissions`.

