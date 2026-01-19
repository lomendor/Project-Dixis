# Task: Pass SEC-AUTH-RL-02 - Auth Rate Limiting

**Date**: 2026-01-19
**Status**: Implementation Complete
**Priority**: P2 Security

---

## Objective

Fix the security gap identified in Pass V1-VERIFY-TRIO-01: `/api/v1/auth/login` and `/api/v1/auth/register` endpoints lacked rate limiting, enabling brute force attacks.

## Requirements

1. Add rate limiting to login endpoint (10 requests per minute per IP+email)
2. Add rate limiting to register endpoint (5 requests per minute per IP)
3. Use Laravel's native RateLimiter (no hand-rolled solutions)
4. Add automated tests proving 429 is returned after limit exceeded
5. Document changes

## Implementation

### Files Changed

| File | Changes |
|------|---------|
| `backend/app/Providers/AppServiceProvider.php` | Added `configureRateLimiting()` with named limiters |
| `backend/routes/api.php` | Added `throttle:auth-login` and `throttle:auth-register` middleware |
| `backend/tests/Feature/AuthRateLimitTest.php` | New test file with 4 tests |

### Rate Limiter Configuration

```php
// Login: 10 attempts per minute, keyed by IP + normalized email
RateLimiter::for('auth-login', function (Request $request) {
    $email = strtolower(trim($request->input('email', '')));
    $key = $email ? $request->ip() . '|' . $email : $request->ip();
    return Limit::perMinute(10)->by($key);
});

// Register: 5 attempts per minute per IP
RateLimiter::for('auth-register', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});
```

### Route Changes

```php
Route::post('register', [AuthController::class, 'register'])
    ->middleware('throttle:auth-register');
Route::post('login', [AuthController::class, 'login'])
    ->middleware('throttle:auth-login');
```

## Test Results

```
PASS  Tests\Feature\AuthRateLimitTest
✓ login rate limit triggers 429 after 10 attempts (0.39s)
✓ register rate limit triggers 429 after 5 attempts (0.03s)
✓ login rate limit is per email (0.03s)
✓ rate limit response includes retry after header (0.02s)

Tests: 4 passed (21 assertions)
```

## Verification

- Local tests: PASS (4/4 tests)
- Production: Requires deployment (PR merge + CI/CD)

---

_Task: SEC-AUTH-RL-02 | Generated: 2026-01-19 | Author: Claude_
