# Pass P0-PROD-SMOKE-404-01: Fix prod smoke 404 console error

**Created**: 2026-02-02
**Status**: IN_PROGRESS
**Priority**: P0

## Problem
Production smoke test `reload-and-css.smoke.spec.ts` fails due to a console 404 resource error on homepage.

## Root Cause
Homepage metadata referenced non-existent OG images:
- `og-products.jpg` → 404
- `twitter-products.jpg` → 404

## Solution
Updated `page.tsx` to use existing `/logo.png` for OG/Twitter images.

## DoD
- [x] Identify exact 404 URL (og-products.jpg, twitter-products.jpg)
- [x] Fix root cause (updated metadata to use logo.png)
- [x] Smoke remains strict for real errors
- [ ] CI green (required checks) + PR merged
- [x] STATE + SUMMARY updated
