# Pass PERF-COLD-START-01: Cold Start Performance Baseline

**Created**: 2026-01-19
**Status**: COMPLETE (No Action Required)
**Type**: Performance / Verification

---

## Objective

Investigate the reported ~700ms cold start penalty mentioned in NEXT-7D.md and determine if OPcache warmup or other fixes are needed.

---

## Definition of Done

- [x] Baseline: Measure /, /products, /api/v1/products timings (10 samples each)
- [x] Identify if slowness is backend/API, HTML SSR, or client fetch
- [x] Document findings
- [x] Propose fix OR close as resolved if no issue found

---

## Baseline Methodology

Created `scripts/perf-baseline.sh` to collect:
- HTTP status code
- DNS lookup time
- TCP connect time
- TLS handshake time
- TTFB (Time to First Byte)
- Total request time

10 samples per URL, calculating min/median/max.

---

## Expected vs Actual

| Issue | Expected | Actual | Status |
|-------|----------|--------|--------|
| Cold start penalty | ~700ms | Not observed | RESOLVED |
| Products page slow | Yes | 175-196ms TTFB | FAST |
| API response | Unknown | 236-299ms TTFB | ACCEPTABLE |

---

## Root Cause Analysis

The ~700ms cold start was likely caused by:
1. **IPv6 fallback issue** - Fixed in Pass PERF-IPV4-PREFER-01 (reduced 9.5s to 80ms)
2. **No caching** - Fixed in Pass PERF-PRODUCTS-CACHE-01 (added s-maxage=60)

Current performance is healthy. No further action required.

---

_Pass: PERF-COLD-START-01 | Author: Claude_
