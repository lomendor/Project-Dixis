# TL;DR — Pass EN-LANGUAGE-01 (English Language Support)

- **Context**: PRD-AUDIT-01 identified English language support as unblocked critical gap. Marketplace targets Greek users but needs EN for international visitors.

- **Goal**: Add EN fallback without breaking EL-first design. Language switcher visible, cookie persistence, at least 1 smoke test.

- **Key changes**:
  - `LocaleContext.tsx` — New context for locale state + cookie persistence
  - `messages/en.json` — Complete EN translations (154+ lines)
  - `messages/el.json` — Added missing auth/language sections
  - `Header.tsx` — Language switcher buttons (desktop + mobile)
  - `auth/login/page.tsx` — i18n integration
  - `ProductSearchInput.tsx` — i18n placeholder
  - `locale.spec.ts` — 3 E2E smoke tests

- **Tests**: 3/3 locale E2E tests pass (buttons visible, default Greek, cookie persistence)

- **Next**: Extend i18n coverage to remaining pages (checkout, orders, producer dashboard)
