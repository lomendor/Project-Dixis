# Pass P0-PROD-OG-ASSETS-01: Add missing OG images to stop prod 404

**Created**: 2026-02-02
**Status**: IN_PROGRESS
**Priority**: P0

## Problem
Production homepage references:
- `/og-products.jpg`
- `/twitter-products.jpg`

When missing, browsers emit console 404 errors that fail `reload-and-css.smoke.spec.ts`.

## Solution
Add real JPEG assets to `frontend/public/` so even cached HTML cannot 404:
- `og-products.jpg` (1200x630)
- `twitter-products.jpg` (1200x600)

## DoD
- [ ] PR merged
- [ ] Deploy succeeds
- [ ] `curl -I https://dixis.gr/og-products.jpg` returns 200
- [ ] `curl -I https://dixis.gr/twitter-products.jpg` returns 200
- [ ] Prod smoke green
