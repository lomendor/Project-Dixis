# Proof: Production Auth Rate Limiting (2026-01-19)

**Date**: 2026-01-19 18:35 UTC
**Commit**: `02cba28c` (main)
**Environment**: Production (https://dixis.gr)
**Status**: PASS

---

## Summary

Verified that auth rate limiting (Pass SEC-AUTH-RL-02) is active in production.

---

## Login Endpoint: `/api/v1/auth/login`

**Limit**: 10 requests per minute per IP+email

### Test Results

```
1 401
2 401
3 401
4 401
5 401
6 401
7 401
8 401
9 401
10 401
11 429  <-- HIT_429_AT=11
```

### Response Headers (Request 11)

```
x-ratelimit-limit: 10
x-ratelimit-remaining: 0
retry-after: 57
x-ratelimit-reset: 1768847639
```

**Result**: PASS - 429 returned after 10 attempts

---

## Register Endpoint: `/api/v1/auth/register`

**Limit**: 5 requests per minute per IP

### Test Results

```
1 422
2 422
3 422
4 422
5 422
6 429  <-- HIT_429_AT=6
```

### Response Headers (Request 6)

```
x-ratelimit-limit: 5
x-ratelimit-remaining: 0
retry-after: 60
x-ratelimit-reset: 1768847654
```

**Result**: PASS - 429 returned after 5 attempts

---

## Conclusion

**PASS** - Both auth endpoints correctly enforce rate limits in production:

| Endpoint | Limit | 429 Triggered At | Headers Present |
|----------|-------|------------------|-----------------|
| `/api/v1/auth/login` | 10/min | Request 11 | Yes |
| `/api/v1/auth/register` | 5/min | Request 6 | Yes |

P2 security gap from V1-VERIFY-TRIO-01 is now fully resolved.

---

_Proof: PROD-AUTH-RL | Generated: 2026-01-19 18:35 UTC | Author: Claude_
