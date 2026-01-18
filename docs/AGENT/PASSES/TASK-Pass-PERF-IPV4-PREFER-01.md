# Pass PERF-IPV4-PREFER-01: Fix 9.5s Backend Latency via IPv4 Preference

**Status**: CLOSED
**Created**: 2026-01-18
**Closed**: 2026-01-18

## Problem

All backend API requests were taking **9.2-9.5 seconds** TTFB, even simple health checks. This made the products page and all API endpoints extremely slow.

### Root Cause

The VPS (Hostinger, Frankfurt) was attempting IPv6 connections first to Neon DB (AWS eu-central-1). While Neon published AAAA records for IPv6, the actual IPv6 path between Hostinger and AWS was broken/filtered. The TCP connect attempt would hang for ~9.2s before timing out and falling back to IPv4.

**Evidence:**
```
IPv4 TCP connect: 4-5ms
IPv6 TCP connect: 9,223ms (timeout)
```

### Investigation Path

1. Measured TTFB from VPS itself: 9.27s (not a network hop issue)
2. Tested direct PHP DB connection: 9.57s (confirmed DB connection is bottleneck)
3. Tested raw TCP connect times: IPv4 = 4ms, IPv6 = 9.2s timeout
4. Confirmed VPS has IPv6 enabled with route to AWS, but packets don't reach destination

## Solution

Added IPv4 preference to `/etc/gai.conf` on the production VPS:

```bash
# /etc/gai.conf
precedence ::ffff:0:0/96  100
```

This tells the system to prefer IPv4-mapped addresses (i.e., use IPv4) when resolving hostnames, avoiding the broken IPv6 path.

## Changes

| Location | Change |
|----------|--------|
| VPS `/etc/gai.conf` | Added `precedence ::ffff:0:0/96  100` |
| VPS PHP-FPM | Reloaded to pick up new address resolution settings |

## Verification

**Before (from VPS):**
```
/api/health TTFB: 9.27-9.33s
/api/v1/public/products TTFB: 9.30-9.41s
```

**After (from VPS):**
```
/api/health TTFB: 71-80ms (~130x faster)
/api/v1/public/products TTFB: 121-188ms (~65x faster)
```

**External (laptop to VPS):**
```
/api/health TTFB: 199-244ms (previously 9.5s)
```

## Rollback

If issues occur:
```bash
ssh root@VPS 'cp /etc/gai.conf.backup.perf-ipv4-20260118 /etc/gai.conf && systemctl reload php8.2-fpm'
```

## Related

- Performance audit that identified this issue
- Neon DB serverless architecture (initially suspected cold start, ruled out)

## Lessons Learned

1. IPv6 timeouts can cause severe latency even when IPv4 works fine
2. `gai.conf` changes require service restart/reload to take effect
3. Always test from the server itself to isolate network vs application issues
4. Raw socket tests (TCP connect timing) are essential for network debugging
