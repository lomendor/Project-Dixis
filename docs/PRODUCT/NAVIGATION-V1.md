# Navigation Specification V1

**Document**: Navigation and Header Specification for Dixis V1
**Created**: 2026-01-22
**Pass ID**: UX-NAV-ROLES-HEADER-01

---

## Overview

This document defines the **canonical navigation structure** for Dixis V1 marketplace.
The header and navigation elements vary based on user authentication state and role.

---

## User States

| State | Description | Detection |
|-------|-------------|-----------|
| **Guest** | Not authenticated | `isAuthenticated === false` |
| **Consumer** | Authenticated user without producer/admin role | `isAuthenticated && !isProducer && !isAdmin` |
| **Producer** | Authenticated user with producer role | `isAuthenticated && isProducer === true` |
| **Admin** | Authenticated user with admin role | `isAuthenticated && isAdmin === true` |

---

## A) Guest (Not Logged In)

### Header Elements

| Element | Location | Target | data-testid |
|---------|----------|--------|-------------|
| Logo | Left | `/` | `header-logo` |
| Products | Primary Nav | `/products` | - |
| Producers | Primary Nav | `/producers` | - |
| Cart Icon | Right | Opens cart drawer | `header-cart` |
| Login | Right | `/auth/login` | `nav-login` |
| Register (CTA) | Right | `/auth/register` | `nav-register` |

### Mobile Menu (Guest)

| Element | Target | data-testid |
|---------|--------|-------------|
| Products | `/products` | - |
| Producers | `/producers` | - |
| Login | `/auth/login` | `mobile-nav-login` |
| Register (CTA) | `/auth/register` | `mobile-nav-register` |

---

## B) Consumer (Logged-In User)

### Header Elements

| Element | Location | Target | data-testid |
|---------|----------|--------|-------------|
| Logo | Left | `/` | `header-logo` |
| Products | Primary Nav | `/products` | - |
| Producers | Primary Nav | `/producers` | - |
| Notification Bell | Right | Opens notifications | - |
| Cart Icon | Right | Opens cart drawer | `header-cart` |
| User Menu | Right (dropdown) | See below | `header-user-menu` |

### User Menu Dropdown (Consumer)

| Element | Target | data-testid |
|---------|--------|-------------|
| User Name/Email | Display only | `user-menu-name` |
| My Orders | `/account/orders` | `user-menu-orders` |
| Logout | Logout action | `user-menu-logout` |

### Mobile Menu (Consumer)

| Element | Target | data-testid |
|---------|--------|-------------|
| Products | `/products` | - |
| Producers | `/producers` | - |
| My Orders | `/account/orders` | `mobile-nav-orders` |
| User Name + Logout | Display + action | `mobile-user-section`, `mobile-logout-btn` |

---

## C) Producer

### Header Elements

| Element | Location | Target | data-testid |
|---------|----------|--------|-------------|
| Logo | Left | `/` | `header-logo` |
| Products | Primary Nav | `/products` | - |
| Producers | Primary Nav | `/producers` | - |
| Notification Bell | Right | Opens notifications | - |
| Cart Icon | **HIDDEN** | N/A | N/A |
| User Menu | Right (dropdown) | See below | `header-user-menu` |

### User Menu Dropdown (Producer)

| Element | Target | data-testid |
|---------|--------|-------------|
| User Name/Email | Display only | `user-menu-name` |
| Producer Dashboard | `/producer/dashboard` | `user-menu-dashboard` |
| Producer Orders | `/producer/orders` | `user-menu-producer-orders` |
| Logout | Logout action | `user-menu-logout` |

### Mobile Menu (Producer)

| Element | Target | data-testid |
|---------|--------|-------------|
| Products | `/products` | - |
| Producers | `/producers` | - |
| Producer Dashboard | `/producer/dashboard` | `mobile-nav-dashboard` |
| Producer Orders | `/producer/orders` | `mobile-nav-producer-orders` |
| User Name + Logout | Display + action | `mobile-user-section`, `mobile-logout-btn` |

---

## D) Admin

### Header Elements

| Element | Location | Target | data-testid |
|---------|----------|--------|-------------|
| Logo | Left | `/` | `header-logo` |
| Products | Primary Nav | `/products` | - |
| Producers | Primary Nav | `/producers` | - |
| Notification Bell | Right | Opens notifications | - |
| Cart Icon | Right | Opens cart drawer | `header-cart` |
| User Menu | Right (dropdown) | See below | `header-user-menu` |

### User Menu Dropdown (Admin)

| Element | Target | data-testid |
|---------|--------|-------------|
| User Name/Email | Display only | `user-menu-name` |
| Admin Panel | `/admin` | `user-menu-admin` |
| Logout | Logout action | `user-menu-logout` |

### Mobile Menu (Admin)

| Element | Target | data-testid |
|---------|--------|-------------|
| Products | `/products` | - |
| Producers | `/producers` | - |
| Admin Panel | `/admin` | `mobile-nav-admin` |
| User Name + Logout | Display + action | `mobile-user-section`, `mobile-logout-btn` |

---

## Elements NOT in Header

The following elements are intentionally **NOT** in the header:

| Element | Location | Rationale |
|---------|----------|-----------|
| Language Switcher | Footer | Pass UI-HEADER-NAV-CLARITY-01 moved to footer |
| Order Tracking Link | Footer | Guest order lookup via `/orders/lookup` |
| Search Bar | N/A | Products page has search |

---

## Implementation Reference

**File**: `frontend/src/components/layout/Header.tsx`

### Key Hooks

```typescript
const { user, logout, isAuthenticated, isProducer, isAdmin } = useAuth();
```

### Cart Visibility Logic

```typescript
const showCart = !isProducer;  // Cart hidden for producers
```

### Role Detection Hierarchy

1. Check `isAdmin` first
2. Check `isProducer` second
3. Default to Consumer if authenticated but neither

---

## E2E Test Coverage

| Test File | Coverage |
|-----------|----------|
| `header.spec.ts` | Logo, navigation links, auth buttons |
| `auth.spec.ts` | Login/logout flows, role-based menu items |
| `mobile-navigation.spec.ts` | Mobile menu, touch interactions |

### Required Test Assertions

1. **Guest**: Logo visible, Login/Register visible, Cart visible
2. **Consumer**: Logo visible, My Orders in menu, Cart visible
3. **Producer**: Logo visible, Dashboard in menu, Cart HIDDEN
4. **Admin**: Logo visible, Admin in menu, Cart visible

---

## Changelog

| Date | Change | Pass ID |
|------|--------|---------|
| 2026-01-22 | Initial spec documenting current implementation | UX-NAV-ROLES-HEADER-01 |

---

_Navigation Specification V1 | Dixis Marketplace_
