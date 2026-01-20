# Production Sanity Proof — 2026-01-20

**Date/Time (UTC)**: 2026-01-20T12:13Z
**Commit SHA**: `61e183d1`
**Context**: Post OPS-UPTIME-HOUSEKEEPING-01 (partial), verifying prod health before next pass

---

## Healthz Endpoint

```
GET https://dixis.gr/api/healthz
HTTP: 200
TTFB: 0.182s
```

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "payments": {
    "cod": "enabled",
    "card": {
      "flag": "enabled",
      "stripe_configured": true,
      "keys_present": {"secret": true, "public": true, "webhook": true}
    }
  },
  "email": {
    "flag": "enabled",
    "mailer": "resend",
    "configured": true,
    "from_configured": true
  },
  "timestamp": "2026-01-20T12:13:26.480725Z",
  "version": "12.38.1"
}
```

**Result**: PASS

---

## Products API

```
GET https://dixis.gr/api/v1/public/products
HTTP: 200
Size: 7361 bytes
Products: 6
```

**Result**: PASS (non-empty payload with 6 products)

---

## Performance Baseline

| Endpoint | Min TTFB | Median TTFB | Max TTFB |
|----------|----------|-------------|----------|
| `/` | 173ms | 178ms | 186ms |
| `/products` | 175ms | 181ms | 185ms |
| `/api/v1/public/products` | 224ms | 248ms | 272ms |

**All endpoints**: HTTP 200, TTFB < 300ms

**Result**: PASS

---

## Summary

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Healthz HTTP | 200 | 200 | PASS |
| Products HTTP | 200 | 200 | PASS |
| Products payload | non-empty | 6 products, 7361 bytes | PASS |
| TTFB median | <= 400ms | 178-248ms | PASS |

**Production Health**: VERIFIED HEALTHY

---

_Generated: 2026-01-20T12:13Z | Pass: OPS-UPTIME-HOUSEKEEPING-01 closeout_
