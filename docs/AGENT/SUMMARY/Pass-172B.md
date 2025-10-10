# TL;DR — Pass 172B (Checkout totals use Shipping Engine, feature-flag)

- **Checkout API Enhancement**: POST `/api/checkout` now computes shipping costs using `shippingQuote()` engine
- **Response Fields**: Added `computedShipping` and `computedTotal` to checkout API response
- **Feature-Flag Driven**: Controlled by `SHIPPING_ENABLED` env variable (defaults to 'true')
- **Safe Implementation**: Falls back gracefully if shipping computation fails (logs warning, returns order data)
- **E2E Tests**: Three scenarios validating COURIER, COURIER_COD, and free threshold behavior

## Files Modified/Created

### API Integration
- `frontend/src/app/api/checkout/route.ts` - Integrated shipping engine into checkout flow

### Testing
- `frontend/tests/checkout/shipping-totals.spec.ts` - E2E tests for shipping cost calculation

### Documentation
- `docs/AGENT/SUMMARY/Pass-172B.md` - This file
- `frontend/docs/OPS/STATE.md` - Updated with Pass 172B entry

## Technical Details

### Shipping Computation Logic
1. Check if `SHIPPING_ENABLED` is true (default)
2. Extract shipping method from payload (default: 'COURIER')
3. Use order subtotal as basis for shipping calculation
4. Call `shippingQuote({ method, subtotal })` to get shipping cost
5. Add shipping cost to order total for `computedTotal`

### API Response Format
```json
{
  "success": true,
  "orderId": "...",
  "total": 20.00,
  "computedShipping": 3.50,
  "computedTotal": 23.50
}
```

### Test Coverage
- **Test 1**: COURIER method includes only BASE shipping fee
- **Test 2**: COURIER_COD includes BASE + COD fee
- **Test 3**: Free threshold zeroes shipping when subtotal >= FREE_THRESHOLD

## Safety Features
- Try/catch wrapper around shipping computation
- Falls back to original response if shipping fails
- No DB schema changes (shipping not persisted)
- Feature-flag controlled (can be disabled)

## Next Steps
- Pass 172C could add UI display of shipping costs in checkout summary
- Consider persisting shipping cost in Order model for historical tracking
