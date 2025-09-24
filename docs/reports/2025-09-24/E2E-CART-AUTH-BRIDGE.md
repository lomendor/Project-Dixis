# E2E Shipping — Authenticated Cart Validation

**Date**: 2025-09-24
**Branch**: e2e/unquarantine-shipping-integration
**PR**: #230
**Test**: shipping-integration.spec.ts

## Goal
UI cart sees authenticated cart after API fallback add-to-cart.

## Fixes Applied
- ✅ Persist token in TestAuthHelper + applyAuthToContext() for all UI requests
- ✅ Mirror auth to multiple localStorage keys (test_auth_token, auth_token, token)
- ✅ Absolute API URL + Authorization header in API fallback
- ✅ Route hook `**/api/v1/**` to inject Authorization if missing
- ✅ Diagnostic GET /cart before UI assert
- ✅ Resilient UI waits (timeouts increased to 15s)

## Result
- **Test**: Shipping Integration Demo >> shipping fields are present and functional
- **Status**: ❌ **FAIL**
- **Critical Finding**: 🔴 **Cart GET returns 404**

## Diagnostic Output
```
🩺 Cart GET status: 404
🩺 Cart GET text: <!DOCTYPE html><html lang="en">...<title>Not Found</title>...
```

## Root Cause Analysis
The diagnostic GET request to `http://127.0.0.1:8001/api/v1/cart` returns **404 Not Found**, which indicates:
1. **Wrong endpoint**: The cart endpoint might be at a different path (e.g., `/api/v1/cart/items` or `/api/v1/carts/current`)
2. **Missing route**: The backend may not have a GET /cart endpoint (only POST /cart/items exists)
3. **Auth format issue**: The endpoint might require a different auth format or additional headers

## Files Modified
- `tests/e2e/helpers/test-auth.ts`: Added applyAuthToContext() + multi-key localStorage
- `tests/e2e/shipping-integration.spec.ts`: Added auth context application + route injection + diagnostics

## Next Actions Required
1. **Verify cart API endpoints**: Check backend routes for correct cart GET endpoint
2. **Check API documentation**: Confirm if `/api/v1/cart` exists or if it's `/api/v1/cart/items`
3. **Test different endpoints**: Try `/api/v1/carts`, `/api/v1/cart/current`, or `/api/v1/user/cart`

**Status**: Authentication architecture implemented but cart endpoint discovery needed