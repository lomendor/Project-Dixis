# Pass PERF-IPV4-PREFER-01 Summary

## One-liner
Fixed 9.5s backend latency by adding IPv4 preference to bypass broken IPv6 path to Neon DB.

## Changes

| Location | Change |
|----------|--------|
| VPS `/etc/gai.conf` | Added `precedence ::ffff:0:0/96  100` |

## Evidence

**Before:**
- `/api/health` TTFB: 9.27-9.33s
- `/api/v1/public/products` TTFB: 9.30-9.41s

**After:**
- `/api/health` TTFB: 71-80ms (130x faster)
- `/api/v1/public/products` TTFB: 121-188ms (65x faster)

## Root Cause

VPS attempted IPv6 connections to Neon DB first. IPv6 path was broken (9.2s timeout), then fell back to IPv4 (4ms). Fix: prefer IPv4 system-wide.

## Rollback

```bash
cp /etc/gai.conf.backup.perf-ipv4-20260118 /etc/gai.conf && systemctl reload php8.2-fpm
```
