# Pass UX-NAV-ROLES-HEADER-01: Navigation Specification

**Date**: 2026-01-22T18:32:00Z
**Commit**: TBD (pending merge)
**Pass ID**: UX-NAV-ROLES-HEADER-01

---

## TL;DR

Created canonical NAVIGATION-V1.md spec documenting role-based header/navigation behavior. Added E2E tests for cart visibility per role.

---

## Files Created

### NEW: docs/PRODUCT/NAVIGATION-V1.md

Comprehensive navigation specification covering:
- **Guest**: Logo, Products, Producers, Cart, Login/Register
- **Consumer**: + Notification Bell, User Menu (My Orders, Logout)
- **Producer**: + Dashboard in menu, Cart HIDDEN
- **Admin**: + Admin Panel in menu, Cart visible

Documents what is NOT in header:
- Language Switcher (in Footer)
- Order Tracking (in Footer)

---

## Files Updated

### UPDATED: frontend/tests/e2e/header-nav.spec.ts

Added 3 new E2E tests for cart visibility per NAVIGATION-V1.md:

1. `cart icon is VISIBLE for guest` - verifies guest can see cart
2. `cart icon is HIDDEN for producer` - verifies producer cannot see cart
3. `cart icon is VISIBLE for admin` - verifies admin can see cart

Updated doc reference from `HEADER-NAV-V1.md` to `NAVIGATION-V1.md`.

---

## Code Analysis

### Header.tsx (NO CHANGES NEEDED)

The existing implementation already correctly handles:
- `showCart = !isProducer` - Cart hidden for producers
- Role detection via `useAuth()` hook
- Desktop and mobile menu role-specific links
- Proper data-testid attributes

---

## Evidence

### Navigation Spec Created
```
docs/PRODUCT/NAVIGATION-V1.md
├── User States Table (Guest, Consumer, Producer, Admin)
├── Section A) Guest
├── Section B) Consumer
├── Section C) Producer (Cart HIDDEN)
├── Section D) Admin
├── Elements NOT in Header
└── E2E Test Coverage
```

### E2E Tests Added
```typescript
// Guest
test('cart icon is VISIBLE for guest (per NAVIGATION-V1.md)', ...)

// Producer
test('cart icon is HIDDEN for producer (per NAVIGATION-V1.md)', ...)

// Admin
test('cart icon is VISIBLE for admin (per NAVIGATION-V1.md)', ...)
```

---

## Artifacts

- `docs/PRODUCT/NAVIGATION-V1.md` (NEW)
- `frontend/tests/e2e/header-nav.spec.ts` (UPDATED)
- `docs/AGENT/SUMMARY/Pass-UX-NAV-ROLES-HEADER-01.md` (this file)

---

**Pass Status: COMPLETE**
