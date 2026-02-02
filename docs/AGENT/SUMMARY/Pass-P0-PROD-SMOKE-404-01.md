# Pass P0-PROD-SMOKE-404-01 Summary

**Status**: IN_PROGRESS
**Date**: 2026-02-02
**PR**: TBD

## Problem

Production smoke test `reload-and-css.smoke.spec.ts` failed with:
```
Error: Console errors on /: Failed to load resource: the server responded with a status of 404 (Not Found)
```

## Root Cause Analysis

The homepage metadata in `frontend/src/app/page.tsx` referenced non-existent OG images:

| Meta Tag | Referenced URL | Status |
|----------|----------------|--------|
| `og:image` | `https://dixis.gr/og-products.jpg` | 404 |
| `twitter:image` | `https://dixis.gr/twitter-products.jpg` | 404 |

The smoke test captures console errors (excluding `net::` and `ERR_` prefixes) and fails
when any are present. The 404 resource load generates a console error message that gets captured.

## Investigation Steps

1. Examined CI logs showing "Failed to load resource: 404"
2. Inspected production HTML with `curl https://dixis.gr/`
3. Found `og:image` and `twitter:image` meta tags pointing to missing files
4. Verified 404 status: `curl -sI https://dixis.gr/og-products.jpg`
5. Confirmed `/logo.png` exists as alternative

## Fix

Updated `frontend/src/app/page.tsx` to use existing `/logo.png` for social media images:

```diff
-        url: `${siteUrl}/og-products.jpg`,
-        width: 1200,
-        height: 630,
+        url: `${siteUrl}/logo.png`,
+        width: 400,
+        height: 400,
...
-    images: [`${siteUrl}/twitter-products.jpg`],
+    images: [`${siteUrl}/logo.png`],
```

This is a minimal fix that:
- Eliminates 404 console errors
- Uses an existing asset (logo.png)
- Maintains valid OG/Twitter metadata
- Can be improved later with dedicated social images

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/app/page.tsx` | Updated OG/Twitter image URLs to use logo.png |
| `docs/OPS/STATE.md` | Added pass entry |
| `docs/AGENT/TASKS/Pass-P0-PROD-SMOKE-404-01.md` | Task specification |
| `docs/AGENT/SUMMARY/Pass-P0-PROD-SMOKE-404-01.md` | This summary |

## Future Improvement

Create dedicated OG images (1200x630) for better social media sharing appearance:
- `public/og-products.jpg` - Main homepage share image
- `public/twitter-products.jpg` - Twitter-specific card image

## Related

- `reload-and-css.smoke.spec.ts` - The affected smoke test
- Production URL: https://dixis.gr
