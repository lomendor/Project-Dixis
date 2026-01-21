# Header Navigation V1 Rules

**Created:** 2026-01-21
**Updated:** 2026-01-21 (Pass UI-HEADER-NAV-02)
**Status:** Canonical source of truth for header/navbar behavior

---

## Core Principles

1. **Logo always visible** — The Dixis logo must appear in all states (guest + logged-in) and link to `/`
2. **No dev/test links** — Error pages like "Απαγορεύεται" or "Forbidden" must NEVER appear in navigation
3. **Predictable by role** — Menu items are determined by authentication state and user role
4. **EL-first with EN toggle** — Greek labels by default, language switcher available
5. **Mobile-first** — Hamburger menu on mobile with 48px touch targets
6. **No Track Order in top nav** — "Παρακολούθηση παραγγελίας" is NOT a top-level nav item (accessible via footer or direct URL)

---

## Navigation by Role

### Guest (Not Logged In)

| Item | Label (EL) | Label (EN) | Route | testid |
|------|------------|------------|-------|--------|
| Logo | Dixis | Dixis | `/` | `nav-logo` |
| Products | Προϊόντα | Products | `/products` | — |
| Producers | Παραγωγοί | Producers | `/producers` | — |
| Login | Είσοδος | Login | `/auth/login` | `nav-login` |
| Register | Εγγραφή | Sign Up | `/auth/register` | `nav-register` |
| Cart | Καλάθι | Cart | `/cart` | `nav-cart-guest` |
| Language | EL/EN | EL/EN | — | `lang-el`, `lang-en` |

**NOT visible to Guest:**
- Admin link (`nav-admin`)
- Producer Dashboard (`nav-producer-dashboard`)
- My Orders (`nav-my-orders`)
- Logout (`logout-btn`)

---

### Consumer (Logged In, No Special Role)

| Item | Label (EL) | Label (EN) | Route | testid |
|------|------------|------------|-------|--------|
| Logo | Dixis | Dixis | `/` | `nav-logo` |
| Products | Προϊόντα | Products | `/products` | — |
| Producers | Παραγωγοί | Producers | `/producers` | — |
| My Orders | Οι Παραγγελίες μου | My Orders | `/account/orders` | `nav-my-orders` |
| User Name | (display) | (display) | — | `nav-user-name` |
| Logout | Αποσύνδεση | Logout | — | `logout-btn` |
| Cart | Cart | Cart | `/cart` | `nav-cart` |
| Language | EL/EN | EL/EN | — | `lang-el`, `lang-en` |

**NOT visible to Consumer:**
- Login (`nav-login`)
- Register (`nav-register`)
- Admin link (`nav-admin`)
- Producer Dashboard (`nav-producer-dashboard`)

---

### Producer Role

| Item | Label (EL) | Label (EN) | Route | testid |
|------|------------|------------|-------|--------|
| Logo | Dixis | Dixis | `/` | `nav-logo` |
| Products | Προϊόντα | Products | `/products` | — |
| Producers | Παραγωγοί | Producers | `/producers` | — |
| Producer Dashboard | Πίνακας Ελέγχου | Dashboard | `/producer/dashboard` | `nav-producer-dashboard` |
| User Name | (display) | (display) | — | `nav-user-name` |
| Logout | Αποσύνδεση | Logout | — | `logout-btn` |
| Language | EL/EN | EL/EN | — | `lang-el`, `lang-en` |

**NOT visible to Producer:**
- Login (`nav-login`)
- Register (`nav-register`)
- Admin link (`nav-admin`)
- My Orders (`nav-my-orders`)
- Cart (shows message instead)

---

### Admin Role

| Item | Label (EL) | Label (EN) | Route | testid |
|------|------------|------------|-------|--------|
| Logo | Dixis | Dixis | `/` | `nav-logo` |
| Products | Προϊόντα | Products | `/products` | — |
| Producers | Παραγωγοί | Producers | `/producers` | — |
| Admin | Admin | Admin | `/admin` | `nav-admin` |
| User Name | (display) | (display) | — | `nav-user-name` |
| Logout | Αποσύνδεση | Logout | — | `logout-btn` |
| Cart | Cart | Cart | `/cart` | `nav-cart-admin` |
| Language | EL/EN | EL/EN | — | `lang-el`, `lang-en` |

**NOT visible to Admin:**
- Login (`nav-login`)
- Register (`nav-register`)
- Producer Dashboard (`nav-producer-dashboard`)
- My Orders (`nav-my-orders`)

---

## Mobile Navigation

Mobile uses a hamburger menu (`mobile-menu-button`) that expands to show:
- Same items as desktop
- 48px minimum touch targets
- Full-width tap areas
- Clear visual separation between sections

Mobile-specific testids:
- `mobile-menu-button` — Hamburger icon
- `mobile-menu` — Expanded menu container
- `mobile-nav-login` — Mobile login link
- `mobile-nav-register` — Mobile register link
- `mobile-nav-my-orders` — Mobile my orders link
- `mobile-nav-producer-dashboard` — Mobile producer dashboard link
- `mobile-nav-admin` — Mobile admin link
- `mobile-nav-user-name` — Mobile user name display
- `mobile-logout-btn` — Mobile logout button
- `mobile-lang-el`, `mobile-lang-en` — Mobile language switcher

---

## Items That Must NEVER Appear

- "Απαγορεύεται" / "Forbidden" — This is an error message, not a nav item
- "Παρακολούθηση παραγγελίας" / "Track Order" — Not a top-nav item (use footer or direct URL `/orders/lookup`)
- `/legal/terms` link with error label — Removed from nav
- Any route that returns 403/404 by design
- Debug/test links

---

## Implementation Notes

- Navigation items defined in `Header.tsx` via `navLinks` array
- Translations in `messages/el.json` and `messages/en.json`
- Role checks via `useAuth()` hook (`isProducer`, `isAdmin`, `isAuthenticated`)
- Cart component: `@/components/cart/CartIcon`
- Logo component: `@/components/brand/Logo`

---

## E2E Test Coverage

Tests in `frontend/tests/e2e/header-nav.spec.ts`:
- Guest: Logo visible, correct items, no admin/producer links
- Consumer: My Orders visible, no admin/producer links
- Producer: Producer Dashboard visible, no admin/my-orders links
- Admin: Admin link visible, no producer/my-orders links
- Mobile: Hamburger menu works, logo visible

---

_Document: HEADER-NAV-V1.md | Updated: 2026-01-21 (Pass UI-HEADER-NAV-02)_
