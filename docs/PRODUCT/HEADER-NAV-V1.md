# Header Navigation V1 Rules

**Created:** 2026-01-21
**Updated:** 2026-01-21 (Pass UI-HEADER-NAV-04)
**Status:** Canonical source of truth for header/navbar behavior

---

## Core Layout Principles

1. **Logo always visible** — Dixis logo (h-9, ~36px) must appear in all states and link to `/`
2. **Minimal primary nav** — Max 2-3 links in the header (Products, Producers)
3. **No Track Order** — "Παρακολούθηση παραγγελίας" is NOT in header (footer or `/orders/lookup`)
4. **No username as nav item** — User name appears ONLY inside user dropdown, not as top-level text
5. **User dropdown for actions** — Logout, My Orders, Dashboard links go in dropdown
6. **Clean icon utilities** — Language switcher, notifications (auth only), cart

### Desktop Layout (≥md / 768px)

```
[Logo]  [Products] [Producers]                    [EL|EN] [🔔?] [🛒] [User ▼]
  ↑         ↑                                        ↑      ↑     ↑     ↑
  h-9    primary nav                            lang  bell  cart  dropdown
```

### Mobile Layout (<md)

```
[Logo]                                          [EL|EN] [🔔?] [🛒] [☰]
```
- Hamburger opens: Products, Producers, role-specific links, user section with logout

---

## Navigation by State

### A) Guest (Not Logged In)

**Primary Nav:**
| Item | Label (EL) | Label (EN) | Route | testid |
|------|------------|------------|-------|--------|
| Logo | Dixis | Dixis | `/` | `header-logo` |
| Products | Προϊόντα | Products | `/products` | — |
| Producers | Παραγωγοί | Producers | `/producers` | — |

**Utility Icons:**
| Item | testid |
|------|--------|
| Language Toggle | `lang-el`, `lang-en` |
| Cart | `header-cart` |

**Auth Buttons (right side):**
| Item | Label (EL) | Route | testid |
|------|------------|-------|--------|
| Login | Είσοδος | `/auth/login` | `nav-login` |
| Register | Εγγραφή | `/auth/register` | `nav-register` |

**NOT visible:**
- User dropdown
- Notification bell
- My Orders
- Admin/Producer Dashboard
- Logout

---

### B) Logged-in Consumer

**Primary Nav:** Same as Guest (Products, Producers)

**Utility Icons:**
| Item | testid |
|------|--------|
| Language Toggle | `lang-el`, `lang-en` |
| Notification Bell | `notification-bell` |
| Cart | `header-cart` |

**User Dropdown** (`header-user-menu`):
| Item | Label (EL) | Route | testid |
|------|------------|-------|--------|
| User Name | (display) | — | `user-menu-name` |
| My Orders | Οι Παραγγελίες μου | `/account/orders` | `user-menu-orders` |
| Logout | Αποσύνδεση | — | `user-menu-logout` |

**NOT visible (top level):**
- Login/Register buttons
- User name as standalone text
- Admin/Producer Dashboard links

---

### C) Logged-in Producer

**Primary Nav:** Same as Guest (Products, Producers)

**Utility Icons:**
| Item | testid |
|------|--------|
| Language Toggle | `lang-el`, `lang-en` |
| Notification Bell | `notification-bell` |

**User Dropdown** (`header-user-menu`):
| Item | Label (EL) | Route | testid |
|------|------------|-------|--------|
| User Name | (display) | — | `user-menu-name` |
| Dashboard | Πίνακας Ελέγχου | `/producer/dashboard` | `user-menu-dashboard` |
| Logout | Αποσύνδεση | — | `user-menu-logout` |

**NOT visible:**
- Cart (producers don't shop)
- My Orders
- Login/Register

---

### D) Logged-in Admin

**Primary Nav:** Same as Guest (Products, Producers)

**Utility Icons:**
| Item | testid |
|------|--------|
| Language Toggle | `lang-el`, `lang-en` |
| Notification Bell | `notification-bell` |
| Cart | `header-cart` |

**User Dropdown** (`header-user-menu`):
| Item | Label (EL) | Route | testid |
|------|------------|-------|--------|
| User Name | (display) | — | `user-menu-name` |
| Admin Panel | Admin | `/admin` | `user-menu-admin` |
| Logout | Αποσύνδεση | — | `user-menu-logout` |

**NOT visible:**
- My Orders
- Producer Dashboard
- Login/Register

---

## Mobile Navigation

**Visible always:** Logo, language toggle, notification bell (if auth), cart (if applicable), hamburger

**Hamburger Menu Contents:**
- Primary nav links (Products, Producers)
- Role-specific links (My Orders / Dashboard / Admin)
- User section with name + logout button
- Guest: Login and Register buttons

**Mobile-specific testids:**
- `mobile-menu-button` — Hamburger icon
- `mobile-menu` — Expanded container
- `mobile-nav-login`, `mobile-nav-register` — Guest auth
- `mobile-nav-orders`, `mobile-nav-dashboard`, `mobile-nav-admin` — Role links
- `mobile-user-section` — User info + logout

---

## Items NEVER in Header

- "Απαγορεύεται" / "Forbidden"
- "Παρακολούθηση παραγγελίας" / "Track Order"
- Debug/test links
- User name as standalone nav text (must be in dropdown only)

---

## Implementation Notes

- Navigation defined in `Header.tsx`
- Logo: `h-9` (36px), `flex-shrink-0`, links to `/`
- User dropdown: click to toggle, contains name + role links + logout
- Translations in `messages/el.json` and `messages/en.json`
- Role checks via `useAuth()` hook

---

## E2E Test Coverage

Tests in `frontend/tests/e2e/header-nav.spec.ts`:
- Guest: logo visible, primary nav, no Track Order
- Consumer: user dropdown works, My Orders in dropdown
- Producer: Dashboard in dropdown, no cart
- Admin: Admin link in dropdown
- Mobile: hamburger works, logo visible, user section correct

Tests in `frontend/tests/e2e/logo-repro.spec.ts`:
- Logo visible all states (guest, auth, mobile)

---

_Document: HEADER-NAV-V1.md | Updated: 2026-01-21 (Pass UI-HEADER-NAV-04)_
