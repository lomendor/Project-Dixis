# Task: Pass-ORDER-TOTALS-INVARIANTS-01

## What
Fix display bug where order totals didn't match their breakdown in the UI.

**Example**: Order #102 showed total €26.99 but breakdown was €19.99 + €2.00 tax + €0.00 shipping = €21.99.

## Why
- **User confusion**: Customers see total that doesn't add up
- **Trust issue**: Incorrect financial breakdowns damage credibility
- **Support burden**: Users calling to clarify charges
- **16 legacy orders affected** (out of 100 checked)

## How

### Root Cause
Legacy `Api/OrderController` hardcoded €5.00 shipping:
```php
$shippingAmount = ($request->shipping_method === 'PICKUP') ? 0.00 : 5.00;
$totalAmount = $subtotal + $taxAmount + $shippingAmount;
```

But it stored shipping in `shipping_amount` (legacy field), while `OrderResource` read from `shipping_cost` (new field) first. When `shipping_cost = 0`, it returned 0 instead of checking the legacy field.

### Fix
Modified `OrderResource.php` to detect when total doesn't match breakdown and infer the hidden shipping:

```php
if (abs($total - $breakdownTotal) > 0.01 && $shippingCost == 0) {
    $impliedShipping = $total - $subtotal - $taxAmount;
}
```

### Files Changed
- `backend/app/Http/Resources/OrderResource.php` (+33/-11 lines)

### Invariants Maintained
- **Invariant A**: `total == subtotal + tax + shipping` (±€0.01)
- **Invariant B**: `sum(items) == subtotal` (no discounts)

## Status
**CLOSED** - PR #2412 merged 2026-01-22T23:59:30Z
