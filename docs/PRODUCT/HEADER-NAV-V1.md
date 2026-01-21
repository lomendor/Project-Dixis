# Header Navigation V1 Rules

**Created:** 2026-01-21
**Status:** Canonical source of truth for header/navbar behavior

---

## Core Principles

1. **Logo always visible** — The Dixis logo must appear in all states (guest + logged-in) and link to `/`
2. **No dev/test links** — Error pages like "Απαγορεύεται" or "Forbidden" must NEVER appear in navigation
3. **Predictable by role** — Menu items are determined by authentication state and user role
4. **EL-first with EN toggle** — Greek labels by default, language switcher available

---

## Guest Navigation (Desktop)

| Item | Label (EL) | Label (EN) | Route | Position |
|------|------------|------------|-------|----------|
| Logo | Dixis | Dixis | `/` | Left |
| Products | Προϊόντα | Products | `/products` | Nav |
| Order Tracking | Παρακολούθηση παραγγελίας | Track Order | `/orders/lookup` | Nav |
| Producers | Παραγωγοί μας | Our Producers | `/producers` | Nav |
| Login | Είσοδος | Login | `/auth/login` | Nav |
| Register | Εγγραφή | Sign Up | `/auth/register` | Nav |
| Language Toggle | EL/EN | EL/EN | — | Nav |
| Cart | (icon) | (icon) | — | Right |

---

## Logged-in Consumer Navigation (Desktop)

| Item | Label (EL) | Label (EN) | Route | Position |
|------|------------|------------|-------|----------|
| Logo | Dixis | Dixis | `/` | Left |
| Products | Προϊόντα | Products | `/products` | Nav |
| Order Tracking | Παρακολούθηση παραγγελίας | Track Order | `/orders/lookup` | Nav |
| Producers | Παραγωγοί μας | Our Producers | `/producers` | Nav |
| My Orders | Οι Παραγγελίες μου | My Orders | `/account/orders` | Nav |
| User Name | (display) | (display) | — | Nav |
| Logout | Αποσύνδεση | Logout | — | Nav |
| Language Toggle | EL/EN | EL/EN | — | Nav |
| Cart | (icon) | (icon) | — | Right |

---

## Role-Based Extras

### Producer Role

When `user.role === 'producer'`:

| Item | Label (EL) | Label (EN) | Route |
|------|------------|------------|-------|
| Producer Dashboard | Πίνακας Παραγωγού | Producer Dashboard | `/producer/dashboard` |

### Admin Role

When `user.role === 'admin'`:

| Item | Label (EL) | Label (EN) | Route |
|------|------------|------------|-------|
| Admin | Admin | Admin | `/admin` |

---

## Visibility Rules

| Condition | Items Shown |
|-----------|-------------|
| Guest | Login, Register, Order Tracking |
| Authenticated | My Orders, User Name, Logout |
| Role: producer | + Producer Dashboard |
| Role: admin | + Admin |

---

## Items That Must NEVER Appear

- "Απαγορεύεται" / "Forbidden" — This is an error message, not a nav item
- `/legal/terms` link with error label — Removed from nav
- Any route that returns 403/404 by design

---

## Mobile Navigation

Same items as desktop, rendered in mobile menu with:
- 48px minimum touch targets
- Full-width tap areas
- Clear visual separation between sections

---

## Implementation Notes

- Navigation items defined in `Header.tsx` via `navLinks` array
- Translations in `messages/el.json` and `messages/en.json`
- Role checks via `useAuth()` hook (`isProducer`, `isAdmin`)
- Logo component: `@/components/brand/Logo`

---

_Document: HEADER-NAV-V1.md | Created: 2026-01-21_
