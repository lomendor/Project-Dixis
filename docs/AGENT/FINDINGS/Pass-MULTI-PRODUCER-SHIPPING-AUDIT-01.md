# Pass-MULTI-PRODUCER-SHIPPING-AUDIT-01: Multi-Producer Checkout Investigation

**Status**: ✅ COMPLETE | **Date**: 2026-01-26 | **Type**: Read-Only Audit

---

## 1. Current Truth: Multi-Producer Checkout Structure

### Database Records Created

For a cart with items from N producers:

| Record Type | Count | Parent | Example IDs |
|-------------|-------|--------|-------------|
| `checkout_sessions` | 1 | - | id=6 |
| `orders` | N (one per producer) | checkout_session_id=6 | id=115, 116 |
| `order_items` | varies | order_id | linked to respective order |
| `order_shipping_lines` | N (one per order) | order_id | one shipping line per child order |

### Key Fields

**checkout_sessions table:**
- `id`, `user_id`, `status`, `currency`
- `subtotal` (sum of all child orders)
- `shipping_total` (sum of all child shipping)
- `total` (subtotal + shipping_total)
- `order_count` (N = number of producers)

**orders table (child orders):**
- `checkout_session_id` → links to parent CheckoutSession
- `is_child_order` = true
- `subtotal` (producer's items total)
- `shipping_cost` (producer's shipping)
- `tax_amount` = 0.00 (NOT CALCULATED - see section 3)
- `total` = subtotal + shipping_cost

**order_shipping_lines table:**
- `order_id` → links to child order
- `producer_id`, `producer_name`
- `subtotal` (producer's items)
- `shipping_cost` (calculated per producer)
- `shipping_method`
- `free_shipping_applied` (boolean)

---

## 2. Shipping Calculation Logic

### Location
**File**: `backend/app/Services/CheckoutService.php:268-279`

### Algorithm
```php
private const FREE_SHIPPING_THRESHOLD = 35.00; // €35 per producer
private const FLAT_SHIPPING_RATE = 3.50;       // €3.50 flat rate

private function calculateProducerShipping(float $subtotal, bool $isPickup): float
{
    if ($isPickup) return 0.0;
    if ($subtotal >= self::FREE_SHIPPING_THRESHOLD) return 0.0;
    return self::FLAT_SHIPPING_RATE;
}
```

### Shipping Computation Summary

| Condition | Shipping Cost |
|-----------|---------------|
| Pickup (PICKUP/STORE_PICKUP) | €0.00 |
| Producer subtotal ≥ €35.00 | €0.00 (free) |
| Producer subtotal < €35.00 | €3.50 flat |

### Key Insight: **Per-Producer, Not Per-Cart**
- Each producer is evaluated independently
- A 2-producer cart can have €7.00 total shipping (€3.50 × 2)
- Free shipping threshold applies per producer, not total cart

---

## 3. VAT/Tax: Why It's Always €0.00

### Finding: **TAX IS NOT APPLIED TO ORDERS**

#### Evidence from Production Data
All orders show `tax_amount: "0.00"`:
```json
{"id": 115, "tax_amount": "0.00", "subtotal": "20.00", "shipping_cost": "3.50"}
{"id": 116, "tax_amount": "0.00", "subtotal": "15.00", "shipping_cost": "3.50"}
```

#### Root Cause: CheckoutService Never Calculates Tax

**File**: `backend/app/Services/CheckoutService.php`

The `processCheckout()` method creates orders without any VAT calculation:
```php
$order = Order::create([
    // ...
    'subtotal' => $producerSubtotal,
    'shipping_cost' => $shippingCost,
    'total' => $orderTotal,  // <-- orderTotal = subtotal + shipping (NO TAX!)
    // tax_amount not set → defaults to 0.00
]);
```

#### TaxService Exists But Is UNUSED

**File**: `backend/app/Services/TaxService.php`
- Has `applyVat()` method with 24% default rate
- **But it's never called from CheckoutService**

#### Frontend Confusion

**File**: `frontend/src/lib/checkout/totals.ts`
```typescript
const VAT = envNum('VAT_RATE', 0.13);  // 13% default
const vat = +(subtotal * VAT).toFixed(2);
```

The frontend has local VAT calculation, but:
1. This is for **preview purposes only**
2. Backend API response overrides with actual 0.00
3. Mismatch causes "VAT calculated next step" message to remain

---

## 4. UI Message: "Shipping and VAT will be calculated in the next step"

### Location
**File**: `frontend/src/app/(storefront)/checkout/page.tsx:307`
```tsx
<p className="text-xs text-gray-500 mt-2">
  {t('checkoutPage.shippingNote')}
</p>
```

**Translation**: `frontend/messages/el.json:240`
```json
"shippingNote": "Τα μεταφορικά και ο ΦΠΑ θα υπολογιστούν στο επόμενο βήμα"
```

### Why This Message Exists

The message was written when:
1. Shipping required address validation (city/postal code)
2. VAT was expected to be calculated server-side

### Current Reality
- Shipping IS calculated at checkout (€3.50 per producer < €35)
- VAT is NEVER calculated (always 0.00)
- Message is misleading/stale

---

## 5. Summary Table

| Aspect | Current State | Location |
|--------|--------------|----------|
| **Shipping Model** | €3.50 flat per producer, free ≥€35 | `CheckoutService.php:21-22` |
| **Tax/VAT** | Not implemented (always 0.00) | `CheckoutService.php` (missing) |
| **TaxService** | Exists but unused | `TaxService.php:19-28` |
| **UI Message** | Stale - claims VAT calculated | `checkout/page.tsx:307` |
| **Order Split** | 1 CheckoutSession → N Orders | `CheckoutService.php:56-170` |
| **Shipping Lines** | One per child order | `CheckoutService.php:129-138` |

---

## 6. Recommendations

### Immediate (Low Risk)
1. **Update UI message** - Remove VAT mention since it's not calculated:
   - Change to: "Τα μεταφορικά υπολογίζονται €3.50 ανά παραγωγό"
   - Or show actual shipping in cart summary

### Medium Term
2. **Integrate TaxService** - If VAT is required:
   - Call `TaxService::applyVat()` in CheckoutService
   - Store `tax_amount` in orders table
   - Update OrderResource to show tax_amount

### Testing Recommendation
3. **E2E Test for Multi-Producer Shipping**:
   - Verify 2-producer cart shows €7.00 shipping (2 × €3.50)
   - Verify free shipping kicks in at €35+ per producer
   - Verify pickup orders have €0.00 shipping

---

## Files Referenced

| File | Purpose |
|------|---------|
| `backend/app/Services/CheckoutService.php` | Order creation + shipping calc |
| `backend/app/Services/TaxService.php` | VAT calculation (UNUSED) |
| `backend/app/Http/Resources/OrderResource.php` | Order API response |
| `backend/app/Http/Resources/CheckoutSessionResource.php` | Multi-producer response |
| `frontend/src/app/(storefront)/checkout/page.tsx` | Checkout UI |
| `frontend/src/lib/checkout/totals.ts` | Client-side total calc (preview) |
| `frontend/messages/el.json` | Greek translations |
