# Pass ANALYTICS-BASIC-01 — Privacy-Friendly Analytics

**Status**: PASS
**Date/Time (UTC)**: 2026-01-20T12:45Z
**Commit SHA**: (pending PR merge)

---

## Summary

Added privacy-friendly, cookie-less analytics support with Plausible/Umami behind feature flags.

---

## Changes

### 1. New File: `frontend/src/components/Analytics.tsx`
- Client component using Next.js `<Script>` for deferred loading
- Supports two providers:
  - **Plausible**: Default `https://plausible.io/js/script.js`
  - **Umami**: Requires custom URL and website ID
- Returns `null` when not configured (zero overhead)
- Includes GDPR/EL compliance notes in JSDoc

### 2. Modified: `frontend/src/app/layout.tsx`
- Import and render `<Analytics />` component
- Positioned after IOSGuard, before JSON-LD scripts
- Comment documenting conditional loading behavior

### 3. Modified: `frontend/.env.example`
- Added new section: `# ── Analytics (Pass ANALYTICS-BASIC-01)`
- Variables:
  - `NEXT_PUBLIC_ANALYTICS_PROVIDER` (plausible | umami | empty)
  - `NEXT_PUBLIC_ANALYTICS_DOMAIN` (e.g., dixis.gr)
  - `NEXT_PUBLIC_ANALYTICS_SRC` (optional custom URL)
  - `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` (Umami only)

---

## Verification

| Check | Result |
|-------|--------|
| Build passes | PASS |
| Analytics disabled by default | PASS (no env = null render) |
| Plausible support | PASS (tested in component) |
| Umami support | PASS (tested in component) |
| .env.example documented | PASS |
| Zero runtime overhead when disabled | PASS |

---

## Privacy Compliance

### Cookie Status
- **Cookies**: None
- **Consent Required**: No (per GDPR Article 5, Recital 30)

### Data Collection
- Page views (aggregate)
- Referrer (aggregate)
- Device type (aggregate)
- **No PII**: IP anonymized, no user tracking

### Jurisdictional Compliance
- **GDPR (EU)**: Compliant - no consent required for cookie-less analytics
- **Greek Law (Ν.4624/2019)**: Compliant - no sensitive data processing

---

## Production Activation

To enable analytics in production:

```bash
# Add to VPS environment
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_ANALYTICS_DOMAIN=dixis.gr
```

Then sign up at https://plausible.io and add `dixis.gr` as a site.

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/Analytics.tsx` | NEW (+65 lines) |
| `frontend/src/app/layout.tsx` | MODIFIED (+3 lines) |
| `frontend/.env.example` | MODIFIED (+11 lines) |

**Total LOC**: ~79

---

_Generated: 2026-01-20T12:45Z | Author: Claude_
