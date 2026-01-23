# Navigation V1 — Unified Specification

**Created**: 2026-01-22
**Updated**: 2026-01-23 (NAV-ENTRYPOINTS-01)
**Status**: CANONICAL — Source of truth for all navigation behavior

> **Purpose**: Define exactly what appears in Header, Footer, and mobile navigation per user role. Stops "random UI" and inconsistent links.

---

## Quick Reference

| Component | Canonical Doc |
|-----------|--------------|
| Header (detailed) | `HEADER-NAV-V1.md` |
| Producer Dashboard | `PRODUCER-DASHBOARD-V1.md` |
| Admin Dashboard | `ADMIN-DASHBOARD-V1.md` |
| **This doc** | Unified navigation spec across all components |

---

## 1. Logo Behavior

| Rule | Description |
|------|-------------|
| **Always visible** | Logo appears in Header on all viewports, all states |
| **Always links to home** | `href="/"` — never changes |
| **Size** | Desktop: `h-12` (48px), Mobile: `h-9` (36px) |
| **Position** | Left-aligned, first element in header |
| **TestID** | `header-logo` |

**Non-negotiable**: Logo must NEVER be hidden, replaced, or link elsewhere.

---

## 2. Header Navigation by Role

### 2.1 Guest (Not Logged In)

| Element | Label (EL) | Route | Visible | TestID |
|---------|------------|-------|---------|--------|
| Logo | Dixis | `/` | ✅ | `header-logo` |
| Products | Προϊόντα | `/products` | ✅ | — |
| Producers | Παραγωγοί | `/producers` | ✅ | — |
| Cart | 🛒 | `/cart` | ✅ | `header-cart` |
| Login | Είσοδος | `/auth/login` | ✅ | `nav-login` |
| Register | Εγγραφή | `/auth/register` | ✅ | `nav-register` |

**NOT visible for Guest**:
- ❌ Language switcher (footer only)
- ❌ Notification bell (out of scope for V1)
- ❌ User dropdown
- ❌ Track Order in header (footer only)
- ❌ Dashboard links

---

### 2.2 Consumer (Logged-in Customer)

| Element | Label (EL) | Route | Visible | TestID |
|---------|------------|-------|---------|--------|
| Logo | Dixis | `/` | ✅ | `header-logo` |
| Products | Προϊόντα | `/products` | ✅ | — |
| Producers | Παραγωγοί | `/producers` | ✅ | — |
| Cart | 🛒 | `/cart` | ✅ | `header-cart` |
| User Dropdown | ▼ | — | ✅ | `header-user-menu` |

**User Dropdown Contents**:
| Item | Label (EL) | Route | TestID |
|------|------------|-------|--------|
| User Name | (display) | — | `user-menu-name` |
| My Orders | Οι Παραγγελίες μου | `/account/orders` | `user-menu-orders` |
| Logout | Αποσύνδεση | — | `user-menu-logout` |

**NOT visible for Consumer**:
- ❌ Language switcher (footer only)
- ❌ Notification bell (out of scope for V1)
- ❌ Login/Register buttons
- ❌ Dashboard link
- ❌ Admin link
- ❌ Track Order in header

---

### 2.3 Producer (Logged-in)

| Element | Label (EL) | Route | Visible | TestID |
|---------|------------|-------|---------|--------|
| Logo | Dixis | `/` | ✅ | `header-logo` |
| Products | Προϊόντα | `/products` | ✅ | — |
| Producers | Παραγωγοί | `/producers` | ✅ | — |
| Cart | 🛒 | `/cart` | ✅ | `header-cart` |
| User Dropdown | ▼ | — | ✅ | `header-user-menu` |

**User Dropdown Contents**:
| Item | Label (EL) | Route | TestID |
|------|------------|-------|--------|
| User Name | (display) | — | `user-menu-name` |
| Dashboard | Πίνακας Ελέγχου | `/producer/dashboard` | `user-menu-dashboard` |
| My Orders | Παραγγελίες | `/producer/orders` | `user-menu-producer-orders` |
| Logout | Αποσύνδεση | — | `user-menu-logout` |

**NOT visible for Producer**:
- ❌ Language switcher (footer only)
- ❌ Notification bell (out of scope for V1)
- ❌ Login/Register buttons
- ❌ Admin link
- ❌ Consumer "My Orders" (`/account/orders`)

**Note**: Cart IS visible for Producer (producers can also shop as customers).

---

### 2.4 Admin (Logged-in)

| Element | Label (EL) | Route | Visible | TestID |
|---------|------------|-------|---------|--------|
| Logo | Dixis | `/` | ✅ | `header-logo` |
| Products | Προϊόντα | `/products` | ✅ | — |
| Producers | Παραγωγοί | `/producers` | ✅ | — |
| Cart | 🛒 | `/cart` | ✅ | `header-cart` |
| User Dropdown | ▼ | — | ✅ | `header-user-menu` |

**User Dropdown Contents**:
| Item | Label (EL) | Route | TestID |
|------|------------|-------|--------|
| User Name | (display) | — | `user-menu-name` |
| Admin Panel | Διαχείριση | `/admin` | `user-menu-admin` |
| Logout | Αποσύνδεση | — | `user-menu-logout` |

**NOT visible for Admin**:
- ❌ Language switcher (footer only)
- ❌ Notification bell (out of scope for V1)
- ❌ Login/Register buttons
- ❌ Producer Dashboard link
- ❌ Consumer "My Orders"

---

## 3. Footer Navigation (All Roles)

Footer is **identical for all roles** — no role-based visibility.

### 3.1 Footer Columns

| Column | Header (EL) | Links |
|--------|-------------|-------|
| **Brand** | — | Logo + tagline |
| **Γρήγοροι Σύνδεσμοι** | Quick Links | Προϊόντα (`/products`), Παραγωγοί (`/producers`), **Παρακολούθηση Παραγγελίας** (`/orders/lookup`) |
| **Για Παραγωγούς** | For Producers | Γίνε Παραγωγός (`/producers`), Σύνδεση Παραγωγού (`/producers/login`) |
| **Υποστήριξη** | Support | Επικοινωνία/Σχόλια (`/contact`), Όροι Χρήσης (`/legal/terms`), Πολιτική Απορρήτου (`/legal/privacy`) |

### 3.2 Footer Bottom Bar

| Element | Position | TestID | Notes |
|---------|----------|--------|-------|
| Copyright | Left | — | `© {year} Dixis` |
| Language Switcher | Right | `footer-language-switcher` | EL/EN buttons |
| Tagline | Right | — | "Made with Cyprus Green" |

---

## 4. Language Switcher Rules

| Rule | Description |
|------|-------------|
| **Header** | ❌ NOT in header (removed in NAV-ENTRYPOINTS-01) |
| **Footer position** | Bottom bar, right side |
| **Fixed position** | Must NOT shift/jump when clicked |
| **TestIDs** | Footer only: `footer-lang-el`, `footer-lang-en` |
| **Active state** | Highlighted button for current locale |

**Decision (NAV-ENTRYPOINTS-01)**: Language switcher appears ONLY in footer. Simpler header, footer always visible.

---

## 5. Cart Visibility Rules

| Role | Cart Visible | Reason |
|------|--------------|--------|
| Guest | ✅ Yes | Can add items before login |
| Consumer | ✅ Yes | Primary shopper |
| Producer | ✅ Yes | Producers can also shop as customers |
| Admin | ✅ Yes | May test checkout flow |

**Decision (NAV-ENTRYPOINTS-01)**: Cart visible for ALL roles.

---

## 6. Mobile Navigation

### 6.1 Always Visible (Mobile Header Bar)

| Element | Notes |
|---------|-------|
| Logo | `h-9` (36px), links to `/` |
| Cart | Visible for all roles |
| Hamburger Menu | `mobile-menu-button` |

**NOT in mobile header bar**:
- ❌ Language switcher (footer only)
- ❌ Notification bell (out of scope for V1)

### 6.2 Hamburger Menu Contents

**Guest**:
- Products, Producers
- Login button (`mobile-nav-login`)
- Register button (`mobile-nav-register`)

**Consumer**:
- Products, Producers
- My Orders (`mobile-nav-orders`)
- User section with name + Logout (`mobile-user-section`, `mobile-logout-btn`)

**Producer**:
- Products, Producers
- Dashboard (`mobile-nav-dashboard`)
- My Orders (producer) (`mobile-nav-producer-orders`)
- User section with name + Logout

**Admin**:
- Products, Producers
- Admin Panel (`mobile-nav-admin`)
- User section with name + Logout

### 6.3 Mobile TestIDs

| Element | TestID |
|---------|--------|
| Hamburger button | `mobile-menu-button` |
| Menu container | `mobile-menu` |
| User section | `mobile-user-section` |
| User name | `mobile-nav-user-name` |

---

## 7. Items NEVER in Header

| Item | Reason | Where Instead |
|------|--------|---------------|
| Παρακολούθηση Παραγγελίας | Clutters header | Footer → `/orders/lookup` |
| User name as top-level text | Confusing | Inside user dropdown only |
| "Απαγορεύεται" / "Forbidden" | Error text, not nav | Nowhere |
| Debug/test links | Dev-only | Remove entirely |
| Search bar | Products page handles this | `/products` has search |

---

## 8. Items NEVER in Footer

| Item | Reason |
|------|--------|
| Login/Logout buttons | Auth actions belong in header |
| Cart icon | Footer is for information, not actions |
| Role-specific dashboard links | Footer is universal |
| Notification bell | Header-only element |

---

## 9. Non-Goals (Out of Scope for V1)

This spec does **NOT** cover:

| Non-Goal | Rationale |
|----------|-----------|
| Full UI redesign | V1 scope frozen; cosmetic changes deferred |
| Mega-menus / dropdowns in primary nav | Not needed for current product count |
| Search bar in header | Products page has search; revisit in V2 |
| Breadcrumbs | Page-level concern, not global nav |
| Sidebar navigation | Dashboard-internal, covered by dashboard specs |
| Notification dropdown content | Separate spec if needed |
| Dark mode nav variants | Post-V1 enhancement |

---

## 10. Implementation Files

| Component | File |
|-----------|------|
| Header | `frontend/src/components/layout/Header.tsx` |
| Footer | `frontend/src/components/layout/Footer.tsx` |
| Logo | `frontend/src/components/brand/Logo.tsx` |
| Auth hooks | `frontend/src/hooks/useAuth.ts` |
| Translations | `frontend/messages/el.json`, `frontend/messages/en.json` |

### Key Implementation Logic

```typescript
// Cart visibility (Header.tsx)
const showCart = !isProducer;  // Cart hidden for producers

// Role detection hierarchy
const { user, logout, isAuthenticated, isProducer, isAdmin } = useAuth();
// 1. Check isAdmin first
// 2. Check isProducer second
// 3. Default to Consumer if authenticated but neither
```

---

## 11. E2E Test Coverage

| Test File | Coverage |
|-----------|----------|
| `header-nav.spec.ts` | Header links, user dropdown, role visibility |
| `dashboard-visibility-smoke.spec.ts` | Dashboard entry points |
| `auth-cart-flow.spec.ts` | Cart visibility by role |
| `logo-repro.spec.ts` | Logo always visible |

### Required Test Assertions

1. **Guest**: Logo visible, Login/Register visible, Cart visible, no dropdown
2. **Consumer**: Logo visible, My Orders in dropdown, Cart visible
3. **Producer**: Logo visible, Dashboard in dropdown, Cart HIDDEN
4. **Admin**: Logo visible, Admin in dropdown, Cart visible

---

## 12. Resolved Decisions

| Question | Decision | Pass |
|----------|----------|------|
| Track Order in header? | **NO** — footer only | UI-HEADER-NAV-CLARITY-01 |
| Language switcher location? | **Both** header + footer | Current impl |
| Producer sees cart? | **NO** — hidden | UI-HEADER-POLISH-01 |
| User name in header top-level? | **NO** — dropdown only | HEADER-NAV-V1 |

---

## 13. Follow-up Passes (If Needed)

| Pass ID | Trigger | Scope |
|---------|---------|-------|
| UI-NAV-ALIGN-01 | If Header.tsx doesn't match this spec | Align implementation |
| UI-FOOTER-CLEANUP-01 | If Footer.tsx links are wrong | Align implementation |
| UI-MOBILE-NAV-01 | If mobile menu is broken | Fix hamburger menu |

---

## Changelog

| Date | Change | Pass ID |
|------|--------|---------|
| 2026-01-22 | Initial spec | UX-NAV-ROLES-HEADER-01 |
| 2026-01-23 | Comprehensive update: footer spec, mobile rules, non-goals, resolved decisions | UI-NAV-SPEC-01 |
| 2026-01-23 | Remove language switcher from header (footer-only), remove notification bell (V1 scope), cart visible for all roles | NAV-ENTRYPOINTS-01 |

---

_Pass: UI-NAV-SPEC-01 | Updated: 2026-01-23 | Author: Agent_
