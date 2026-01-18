# Pass EN-LANGUAGE-01 — English Language Support

## Objective

Add multi-language support with Greek (default) and English fallback for core user-facing pages.

## Decisions

1. **i18n Approach**: Custom `LocaleContext` with cookie-based persistence (not next-intl route-based)
2. **Default Locale**: Greek (`el`) — respects existing EL-first design
3. **Fallback**: English (`en`) — available via language switcher or browser detection
4. **Storage**: `dixis_locale` cookie (30-day expiry)
5. **Detection Order**: Cookie → Browser language → Default (Greek)

## Implementation Steps

1. Complete EN translations in `messages/en.json`
2. Add missing keys to `messages/el.json` (auth, language sections)
3. Create `LocaleContext.tsx` with:
   - Cookie-based persistence
   - Browser language detection
   - `useTranslations()` hook for components
4. Update `layout.tsx` to wrap app with `LocaleProvider`
5. i18n integration for:
   - Login page (`auth/login/page.tsx`)
   - Products search (`ProductSearchInput.tsx`)
   - Header navigation + language switcher (`Header.tsx`)
6. Add E2E locale smoke tests

## Tests

| Test | Description |
|------|-------------|
| `locale.spec.ts` - buttons visible | Language switcher (EL/EN) visible in Header |
| `locale.spec.ts` - default Greek | Fresh session shows Greek content |
| `locale.spec.ts` - cookie respected | Setting `dixis_locale=en` cookie is persisted |

## Risks/Outstanding

- **SSR hydration**: Initial render is server-side (Greek), client hydrates with locale from cookie/browser
- **Incomplete coverage**: Only Login, Products, Header are i18n-ready; other pages still have hardcoded strings
- **Future work**: Full page coverage, URL-based routing (`/el/`, `/en/`) could be added later

## PR

- #2249 (feat: Pass EN-LANGUAGE-01 English language support with i18n)
