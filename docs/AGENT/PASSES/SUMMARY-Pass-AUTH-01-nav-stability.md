# AUTH-01: Navigation Auth Stability Fix

**Date**: 2026-01-04
**PR**: feat/pass-auth-01-nav-stability
**Status**: Complete

## Problem

Header flashes between "guest" and "logged-in" states during navigation. Users briefly see "Σύνδεση/Εγγραφή" (Login/Register) buttons before auth loads.

## Root Cause

AuthContext initialized with:
- `loading = true`
- `user = null`
- `isAuthenticated = !!user` (= false)

During the loading period (while `initAuth()` fetches user profile from API), the header rendered guest state. This caused a visual flash on every page navigation because React hydration resets state.

## Fix

Added synchronous localStorage check during AuthContext initialization:

```typescript
function getInitialAuthState(): { hasToken: boolean } {
  if (typeof window === 'undefined') return { hasToken: false };
  const token = localStorage.getItem('auth_token');
  return { hasToken: !!token && token !== '' };
}

// In AuthProvider:
const [hasTokenOnMount] = useState(getInitialAuthState().hasToken);

// During loading, use token presence to determine auth state
const isAuthenticated = loading ? hasTokenOnMount : !!user;
```

This prevents the flash because:
1. Token exists in localStorage (from previous login)
2. `hasTokenOnMount` is `true` immediately on render
3. `isAuthenticated` is `true` during loading period
4. Header shows authenticated state from first render

## Files Changed

1. `frontend/src/contexts/AuthContext.tsx`
   - Added `getInitialAuthState()` function
   - Added `hasTokenOnMount` state
   - Changed `isAuthenticated` calculation to use `hasTokenOnMount` during loading

2. `frontend/tests/e2e/auth-nav-regression.spec.ts`
   - New regression test file
   - 2 tests: orders page access + multi-navigation auth persistence

3. `docs/OPS/STATE.md`
   - Added AUTH-01 fix documentation

## E2E Test Results

```
Running 2 tests using 1 worker
  2 passed (16.7s)
```

Tests verify:
1. `/account/orders` accessible without redirect to login
2. Header auth state persists through multiple navigations (products -> home -> cart -> products -> account/orders)

## Impact

- Eliminates header flash during navigation
- Better UX for authenticated users
- No changes to actual auth flow (token storage, API calls, etc.)
