# Pass ANALYTICS-BASIC-01 — Privacy-Friendly Analytics

**Status**: IN_PROGRESS
**Priority**: P2 (Post-V1 Iteration)
**Estimated LOC**: ~60

---

## Objective

Add basic, privacy-friendly analytics to track page views and user behavior without cookies or personal data collection.

---

## Requirements

1. **Privacy-First**: Cookie-less, GDPR-friendly, no consent banner required
2. **EL Compliance**: Compliant with Greek data protection laws (no PII)
3. **Feature Flag**: Analytics only loads when `NEXT_PUBLIC_ANALYTICS_PROVIDER` is set
4. **Minimal Footprint**: Single script tag injection, no client-side SDK
5. **Provider Support**: Plausible (recommended) or Umami

---

## Implementation

### 1. Analytics Component (`frontend/src/components/Analytics.tsx`)
- Client component with conditional script injection
- Supports Plausible and Umami providers
- Returns null when not configured (zero overhead)

### 2. Environment Variables (`.env.example`)
```bash
# Provider: plausible | umami (leave empty to disable)
NEXT_PUBLIC_ANALYTICS_PROVIDER=
# Your domain (e.g., dixis.gr)
NEXT_PUBLIC_ANALYTICS_DOMAIN=
# Optional: Custom script URL
NEXT_PUBLIC_ANALYTICS_SRC=
# Required for Umami only:
NEXT_PUBLIC_ANALYTICS_WEBSITE_ID=
```

### 3. Layout Integration (`frontend/src/app/layout.tsx`)
- Import and render `<Analytics />` in root layout
- Loads after IOSGuard, before JSON-LD scripts

---

## Production Setup

### Plausible (Recommended)

1. Sign up at https://plausible.io (EU-hosted option available)
2. Add site domain: `dixis.gr`
3. Set env vars on VPS:
   ```bash
   NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
   NEXT_PUBLIC_ANALYTICS_DOMAIN=dixis.gr
   ```

### Umami (Self-Hosted)

1. Deploy Umami instance (Vercel/Docker/etc.)
2. Create website in Umami dashboard
3. Set env vars on VPS:
   ```bash
   NEXT_PUBLIC_ANALYTICS_PROVIDER=umami
   NEXT_PUBLIC_ANALYTICS_DOMAIN=dixis.gr
   NEXT_PUBLIC_ANALYTICS_SRC=https://your-umami.com/script.js
   NEXT_PUBLIC_ANALYTICS_WEBSITE_ID=your-website-id
   ```

---

## Privacy Compliance Notes

### GDPR (EU)
- No cookies = No consent required (per CJEU C-673/17)
- No PII collected (IP anonymized by provider)
- EU-hosted options available (Plausible EU, self-hosted Umami)

### Greek Law (Ν.4624/2019)
- Compliant with Article 10 (no sensitive data processing)
- No cross-site tracking
- Aggregate-only analytics

---

## Acceptance Criteria

- [ ] Build passes with new component
- [ ] Analytics disabled by default (no env = no script)
- [ ] Plausible script loads when configured
- [ ] Umami script loads when configured
- [ ] Documentation in .env.example

---

## Files Changed

- `frontend/src/components/Analytics.tsx` (NEW)
- `frontend/src/app/layout.tsx` (MODIFIED)
- `frontend/.env.example` (MODIFIED)
- `docs/AGENT/TASKS/Pass-ANALYTICS-BASIC-01.md` (NEW)
- `docs/AGENT/SUMMARY/Pass-ANALYTICS-BASIC-01.md` (NEW)

---

_Created: 2026-01-20 | Author: Claude_
