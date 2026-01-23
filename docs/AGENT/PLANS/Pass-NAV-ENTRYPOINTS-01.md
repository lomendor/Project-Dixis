# Plan: Pass-NAV-ENTRYPOINTS-01

**Date**: 2026-01-23
**Status**: PLAN — Awaiting approval

---

## Goal

Define and implement minimal, consistent navigation entrypoints per role. Remove language switcher from Header (footer-only). Ensure every role has an obvious path to its dashboard.

---

## Current State

**Existing Spec**: `docs/PRODUCT/NAVIGATION-V1.md` — comprehensive but says language switcher in BOTH header + footer.

**Header.tsx** (current):
- ✅ Logo always visible (48px desktop, 36px mobile)
- ✅ Primary nav: Προϊόντα, Παραγωγοί
- ✅ Cart hidden for producers
- ✅ User dropdown with role-specific links
- ❌ Language switcher in header (desktop lines 83-99, mobile lines 222-239) — **REMOVE**

---

## Proposed Header Items per Role

### A) Guest (Not Logged In)

| Position | Element | Route |
|----------|---------|-------|
| Left | Logo | `/` |
| Center | Προϊόντα | `/products` |
| Center | Παραγωγοί | `/producers` |
| Right | Cart | `/cart` |
| Right | Σύνδεση | `/auth/login` |
| Right | Εγγραφή | `/auth/register` |

**NOT in header**: Language switcher, Notification bell, User dropdown

### B) Consumer (Logged-in Customer)

| Position | Element | Route |
|----------|---------|-------|
| Left | Logo | `/` |
| Center | Προϊόντα | `/products` |
| Center | Παραγωγοί | `/producers` |
| Right | Notification Bell | — |
| Right | Cart | `/cart` |
| Right | User Dropdown ▼ | — |

**User Dropdown**:
- Name + email (display)
- Οι Παραγγελίες μου → `/account/orders`
- Αποσύνδεση

### C) Producer (Logged-in)

| Position | Element | Route |
|----------|---------|-------|
| Left | Logo | `/` |
| Center | Προϊόντα | `/products` |
| Center | Παραγωγοί | `/producers` |
| Right | Notification Bell | — |
| Right | User Dropdown ▼ | — |

**User Dropdown**:
- Name + email (display)
- Πίνακας Ελέγχου → `/producer/dashboard`
- Παραγγελίες → `/producer/orders`
- Αποσύνδεση

**NOT in header**: Cart (producers don't shop)

### D) Admin (Logged-in)

| Position | Element | Route |
|----------|---------|-------|
| Left | Logo | `/` |
| Center | Προϊόντα | `/products` |
| Center | Παραγωγοί | `/producers` |
| Right | Notification Bell | — |
| Right | Cart | `/cart` |
| Right | User Dropdown ▼ | — |

**User Dropdown**:
- Name + email (display)
- Admin → `/admin`
- Αποσύνδεση

---

## Language Switcher Location

| Location | Status |
|----------|--------|
| Header (desktop) | ❌ **REMOVE** |
| Header (mobile) | ❌ **REMOVE** |
| Footer | ✅ **KEEP** (only location) |

---

## Implementation Changes

### Header.tsx Changes

1. **Remove desktop language switcher** (lines 82-99)
2. **Remove mobile language switcher** (lines 222-239)
3. **Remove unused imports** if `locales` no longer needed (keep `useLocale` if used elsewhere, but it's not after removal)

### Files to Change

| File | Change |
|------|--------|
| `Header.tsx` | Remove language switcher (~35 lines) |
| `NAVIGATION-V1.md` | Update spec: language switcher footer-only |
| `header-nav.spec.ts` | Update test: language NOT in header |

---

## Acceptance Criteria (Testable)

| AC | Description | Test Method |
|----|-------------|-------------|
| AC1 | Language switcher NOT visible in header (desktop) | E2E: `header [data-testid="lang-el"]` not visible |
| AC2 | Language switcher NOT visible in header (mobile) | E2E: `header [data-testid="mobile-lang-el"]` not visible |
| AC3 | Language switcher IS visible in footer | E2E: `footer-lang-el`, `footer-lang-en` visible |
| AC4 | Guest: Logo, Products, Producers, Cart, Login, Register visible | E2E |
| AC5 | Consumer: User dropdown with "My Orders" visible | E2E |
| AC6 | Producer: User dropdown with "Dashboard" visible, Cart hidden | E2E |
| AC7 | Admin: User dropdown with "Admin" visible, Cart visible | E2E |
| AC8 | Build passes | `npm run build` |
| AC9 | Typecheck passes | `npm run typecheck` |
| AC10 | E2E header-nav.spec.ts passes | Playwright |

---

## Non-Goals

- No UI redesign
- No business logic changes
- No shipping/multi-producer logic
- No new features

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Users can't change language | Footer always visible; language persists in localStorage |
| Breaking existing tests | Update E2E test to match new spec |

---

## Estimated Changes

| Metric | Value |
|--------|-------|
| Files changed | 3 (Header.tsx, NAVIGATION-V1.md, header-nav.spec.ts) |
| Lines removed | ~35 (Header.tsx) |
| Lines added | ~10 (test updates, spec updates) |
| Net change | ~-25 lines |

---

_Plan: Pass-NAV-ENTRYPOINTS-01 | 2026-01-23_
