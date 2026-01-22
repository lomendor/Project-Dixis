# Summary: Pass UI-HEADER-NAV-CLARITY-01

**Date**: 2026-01-22
**Status**: MERGED
**Type**: UI Cleanup
**Commit**: `9014f00a`
**PR**: #2387

---

## TL;DR

Moved language switcher (EL/EN) from header to footer for stable, non-shifting mobile UI.

---

## Changes

| File | Change |
|------|--------|
| `Header.tsx` | Removed language switcher (desktop + mobile) |
| `Footer.tsx` | Added language switcher with testids |
| `header-nav.spec.ts` | Updated test to verify lang NOT in header |
| `locale.spec.ts` | Updated test to use footer testids |

### Header.tsx (-45 lines)

Removed:
- `useLocale` hook
- `locales` import
- `handleLocaleChange` function
- Desktop language switcher (`lang-el`, `lang-en` testids)
- Mobile language switcher (`mobile-lang-el`, `mobile-lang-en` testids)

### Footer.tsx (+27 lines)

Added:
- `'use client'` directive
- `useLocale`, `useTranslations` hooks
- `locales` import
- `handleLocaleChange` function
- Language switcher with testids: `footer-lang-el`, `footer-lang-en`

---

## Verification

| Check | Result |
|-------|--------|
| Build | PASS |
| TypeScript | PASS (no errors) |
| Diff | +45/-62 lines |

---

## Rationale

From `docs/NEXT-7D.md` backlog:
> **Language toggle position**: Remove from header; place in footer or settings page (toggle shifting position is undesirable on mobile)

---

## Risk

- **Risk**: LOW — purely presentational move
- **Rollback**: Revert commit

---

_Summary: UI-HEADER-NAV-CLARITY-01 | 2026-01-22_
