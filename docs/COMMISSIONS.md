# Commission Engine

## Overview

The Commission Engine calculates marketplace fees for orders based on flexible rules stored in the `commission_rules` table. This system is controlled by the `commission_engine_v1` feature flag (defaults to OFF).

## Current Status

**Phase**: COMM-ENGINE-02 (Skeleton + Feature Flag)  
**Flag**: `commission_engine_v1` (defaults to OFF)  
**Impact**: Zero - returns 0 commission when flag is OFF

## Architecture

### CommissionService

Location: `backend/app/Services/CommissionService.php`

**Methods**:
- `calculateFee(Order $order): int` - Returns commission in cents (0 when flag is OFF)
- `getCommissionBreakdown(Order $order): array` - Returns detailed breakdown with flag status

### Feature Flag

- **Name**: `commission_engine_v1`
- **Default**: OFF (disabled)
- **Purpose**: Gradual rollout of commission calculation
- **Toggle**: Use Laravel Pennant API

```php
use Laravel\Pennant\Feature;

// Check if active
if (Feature::active('commission_engine_v1')) {
    // Commission calculation enabled
}

// Activate for testing
Feature::activate('commission_engine_v1');

// Deactivate
Feature::deactivate('commission_engine_v1');
```

### Commission Rules Schema

Table: `commission_rules`

**Scope Fields**:
- `scope_channel`: 'B2B', 'B2C', 'ALL'
- `scope_category_id`: nullable (specific category)
- `scope_producer_id`: nullable (specific producer)

**Pricing Fields**:
- `percent`: decimal(5,2) - percentage fee
- `fixed_fee_cents`: int - fixed fee in cents
- `tier_min_amount_cents`: int - minimum order amount for this rule
- `tier_max_amount_cents`: int - maximum order amount (nullable)

**Configuration**:
- `vat_mode`: 'INCLUDE', 'EXCLUDE', 'NONE'
- `rounding_mode`: 'UP', 'DOWN', 'NEAREST'
- `effective_from`: datetime - when rule becomes active
- `effective_to`: datetime - when rule expires (nullable)
- `priority`: int - higher priority wins when multiple rules match
- `active`: boolean - soft disable/enable

### Default Rules (Seeded)

1. **B2C Default**: 12% on all orders
2. **B2B Default**: 7% on all orders  
3. **B2C Volume**: 10% on orders > €100 (priority 1, overrides default)

## Usage

```php
use App\Services\CommissionService;
use App\Models\Order;

$service = new CommissionService();
$order = Order::find($orderId);

// Get commission (returns 0 when flag is OFF)
$fee = $service->calculateFee($order); // int (cents)

// Get detailed breakdown
$breakdown = $service->getCommissionBreakdown($order);
/*
[
    'total_cents' => 0,
    'flag_active' => false,
    'applied_rules' => [], // TODO: populated in COMM-ENGINE-03
]
*/
```

## Testing

### Feature Flag Health Tests

Location: `backend/tests/Feature/FeatureFlagHealthTest.php`

- Verifies flag defaults to OFF
- Tests flag toggle functionality
- Ensures flag isolation

### Service Tests

Location: `backend/tests/Feature/Services/CommissionServiceTest.php`

- Verifies zero commission when flag is OFF
- Tests breakdown structure
- Validates different order amounts

Run tests:
```bash
cd backend
php artisan test --filter=CommissionService
php artisan test --filter=FeatureFlagHealth
```

## Roadmap

### COMM-ENGINE-03 (Next)
- Wire service to read from `commission_rules` table
- Implement rule resolution algorithm (priority, scoping, tiers)
- Apply VAT and rounding modes
- Calculate actual fees when flag is ON

### COMM-ENGINE-04 (Future)
- Integrate with order total calculation
- Add commission breakdown to order response
- Producer dashboard showing commission history

### ADMIN-UI (Future)
- Web interface for managing commission rules
- Rule preview and testing tools
- Analytics dashboard

## Safety

- **Feature flag defaults to OFF**: No production impact
- **No wiring to checkout**: Service is isolated
- **Comprehensive tests**: Health + service tests ensure safety
- **Idempotent migrations**: Safe to run multiple times

## Migration

Migration: `database/migrations/*_create_commission_rules_table.php`  
Seeder: `database/seeders/CommissionRuleSeeder.php`

```bash
# Run migrations
php artisan migrate

# Seed default rules
php artisan db:seed --class=CommissionRuleSeeder
```
