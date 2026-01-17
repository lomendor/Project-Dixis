# Pass PROD-UNBLOCK-01: Production Auth & Products Verification

**Created**: 2026-01-17

## Objective

Investigate and resolve reported production issues:
- "products not visible"
- "register/login not working on dixis.gr"

## Scope

- Diagnostic only (no feature work)
- Verify products API working
- Verify auth endpoints working
- Document root cause

## Prerequisites

- SSH access via `dixis-prod` alias (Pass OPS-SSH-HYGIENE-01)
- Email configured (Pass OPS-EMAIL-UNBLOCK-01)

## Definition of Done

- [x] Products API returns data
- [x] Register endpoint creates users
- [x] Login endpoint authenticates users
- [x] AuthController uses correct Request class (`Illuminate\Http\Request`)
- [x] Server and repo files match
- [x] Evidence documented in STATE.md

## Verification Commands

```bash
# Products API
curl -s "https://dixis.gr/api/v1/public/products?per_page=2"

# Register (avoid ! in password due to shell escaping)
curl -s -X POST "https://dixis.gr/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"SecurePass123","password_confirmation":"SecurePass123","role":"consumer"}'

# Login
curl -s -X POST "https://dixis.gr/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Verify AuthController import
ssh dixis-prod 'sed -n "1,15p" /var/www/dixis/current/backend/app/Http/Controllers/Api/AuthController.php'
```

## Root Cause Analysis

**Products**: Were working all along. No issue found.

**Auth Endpoints**: Were working correctly. The perceived failure was caused by:
1. Local zsh shell escaping `!` character in passwords to `\!`
2. This made the JSON payload invalid (`"Password1\!"` instead of `"Password1!"`)
3. Server received malformed JSON, `json_decode` failed, `$request->all()` was empty
4. Resulted in "all fields required" validation error

**Evidence**: Testing with passwords without `!` (e.g., `SecurePass123`) succeeded immediately.

## Files Verified

| File | Server MD5 | Local MD5 | Match |
|------|------------|-----------|-------|
| AuthController.php | 165000b63d8b81a322481f4c5bfd3620 | 165000b63d8b81a322481f4c5bfd3620 | ✅ |
| routes/api.php | 95d5a8958c93058215fb1506c80af41b | 95d5a8958c93058215fb1506c80af41b | ✅ |

## Result

All production APIs are **fully operational**. No code changes required.
