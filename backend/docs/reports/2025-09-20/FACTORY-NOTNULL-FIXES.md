# Factory/Seeder Fixes for NOT NULL Gaps
- Added `CartItemFactory` (user_id, product_id, quantity).
- Added `ShipmentFactory` (order_id via Order::factory, default status=pending).
- Added `PermissionsRolesSeeder` (Spatie) with `manage.orders` + `admin` on guard `web`, hooked in `DatabaseSeeder`.
- Added unit smoke tests for factories.