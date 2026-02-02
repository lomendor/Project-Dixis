# Pass P0-PROD-OG-ASSETS-01: Add missing OG images to stop prod 404

**Created**: 2026-02-02
**Status**: BLOCKED (GitHub Actions outage)
**Priority**: P0
**PR**: [#2594](https://github.com/lomendor/Project-Dixis/pull/2594)

## Problem
Production homepage references:
- `/og-products.jpg`
- `/twitter-products.jpg`

When missing, browsers emit console 404 errors that fail `reload-and-css.smoke.spec.ts`.

## Solution
Add real JPEG assets to `frontend/public/` so even cached HTML cannot 404:
- `og-products.jpg` (1200x630, 45KB)
- `twitter-products.jpg` (1200x600, 42KB)

Images generated from `assets/logo.png` with white background using PIL.

## Current Blocker
**GitHub Actions Major Outage** (2026-02-02 ~19:03 UTC)
- All hosted runners experiencing high wait times
- Jobs stuck in "queued" state for extended periods
- Self-hosted runners not affected
- Status: **Ongoing** as of 20:35 UTC
- See: https://www.githubstatus.com/

### Mitigation Attempts
- Re-ran all cancelled workflows multiple times
- All "failed" checks were actually cancelled (not real code failures)
- PR has auto-merge enabled - will merge automatically once CI passes

## DoD
- [ ] PR merged (blocked by CI outage)
- [ ] Deploy succeeds
- [ ] `curl -I https://dixis.gr/og-products.jpg` returns 200
- [ ] `curl -I https://dixis.gr/twitter-products.jpg` returns 200
- [ ] Prod smoke green
