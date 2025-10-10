# TL;DR — HF-172B.2

- **Added .env.ci**: CI-specific environment configuration with SHIPPING_* variables
- **FREE_THRESHOLD**: Set to 50 EUR for free shipping test scenario
- **Reinstated E2E**: Created `shipping-free-threshold.spec.ts` with proper ENV-based testing
- **No runtime mutation**: Tests read server-side ENV (from .env.ci) instead of mutating process.env
- **Two scenarios**: Above threshold (free shipping) and below threshold (normal shipping)

## Files Created/Modified

### Configuration
- `.env.ci` - CI environment configuration with shipping variables

### Testing
- `frontend/tests/checkout/shipping-free-threshold.spec.ts` - Free shipping threshold E2E tests

### Documentation
- `docs/AGENT/SUMMARY/Pass-172B.2.md` - This file
- `frontend/docs/OPS/STATE.md` - Updated with HF-172B.2 entry

## .env.ci Configuration

```env
SHIPPING_ENABLED=true
SHIPPING_BASE_EUR=3.5
SHIPPING_COD_FEE_EUR=2.0
SHIPPING_FREE_THRESHOLD_EUR=50
SHIPPING_REMOTE_SURCHARGE_EUR=0
```

## Test Coverage

### Test 1: Free Shipping Above Threshold
- Product price: 60 EUR (> 50 EUR threshold)
- Expected: `computedShipping = 0`
- Expected: `computedTotal = productPrice` (no shipping added)

### Test 2: Normal Shipping Below Threshold
- Product price: 30 EUR (< 50 EUR threshold)
- Expected: `computedShipping = BASE_EUR (3.5)`
- Expected: `computedTotal = productPrice + BASE_EUR`

## Technical Details

- Server reads .env.ci on startup (not runtime mutation)
- Playwright webServer uses .env.ci via dotenv-cli
- Tests validate server behavior, not client-side logic
- Idempotent: No schema changes, no business logic changes
