# Pass: UI-NAV-HEADER-01

**Date (UTC):** 2026-01-21
**Commit:** 0d31b905
**PR:** [#2362](https://github.com/lomendor/Project-Dixis/pull/2362)
**CI Run:** [21208002402](https://github.com/lomendor/Project-Dixis/actions/runs/21208002402)
**Environment:** Frontend UI

---

## Summary

Fixed header/navbar to follow consistent IA rules:
- Logo always visible
- No dev/test links (removed "Απαγορεύεται")
- Predictable menu by auth state and role

---

## Changes Made

### Header Component

**Before:**
```typescript
const navLinks = [
  { href: '/products', label: t('nav.products') },
  { href: '/orders/lookup', label: t('checkout.orderId') },
  { href: '/producers', label: t('producers.title') },
  { href: '/legal/terms', label: t('errors.forbidden').split(' ')[0] || 'Terms' },
];
```

**After:**
```typescript
const navLinks = [
  { href: '/products', label: t('nav.products') },
  { href: '/orders/lookup', label: t('nav.trackOrder') },
  { href: '/producers', label: t('producers.title') },
];
```

### Translations Added

| Key | EL | EN |
|-----|----|----|
| `nav.trackOrder` | Παρακολούθηση παραγγελίας | Track Order |

---

## E2E Tests

New test file: `frontend/tests/e2e/header-nav.spec.ts`

| Test | Assertion |
|------|-----------|
| Guest: logo visible | `[data-testid="nav-logo"]` visible |
| Guest: correct items | Products, Track Order, Producers, Login, Register |
| Guest: no forbidden | "Απαγορεύεται" NOT visible |
| Logged-in: logo visible | Logo still visible after login |
| Logged-in: no login/register | Login/Register hidden |
| Logged-in: my orders | My Orders visible for consumers |
| Producer: dashboard link | Producer Dashboard visible |
| Admin: admin link | Admin link visible |

---

## Artifacts

- `docs/PRODUCT/HEADER-NAV-V1.md` — Canonical nav rules
- `frontend/tests/e2e/header-nav.spec.ts` — E2E tests
- PR: [#2362](https://github.com/lomendor/Project-Dixis/pull/2362)

---

_Pass: UI-NAV-HEADER-01 | Generated: 2026-01-21 | Author: Claude_
