# Plan: Pass UX-DASHBOARD-ENTRYPOINTS-01

**Date**: 2026-01-22
**Pass ID**: UX-DASHBOARD-ENTRYPOINTS-01
**Status**: PLANNING

---

## Goal

Ensure role-based dashboard entrypoints are clear and complete in user menu. Logo always links to Home.

---

## Current State Analysis

| Role | Current Menu Items | Status |
|------|-------------------|--------|
| Guest | Login, Register | OK |
| Consumer | "Οι παραγγελίες μου" (`/account/orders`) | OK |
| Producer | "Παραγωγοί" (`/producer/dashboard`) | MISSING: Orders link |
| Admin | "Admin" (`/admin`) | OK |
| Logo | Links to `/` | OK |

**Gap Found**: Producer only has dashboard link, but per PRD also needs quick access to "Παραγγελίες Παραγωγού" (`/producer/orders`).

---

## Non-Goals

- No "big" UI redesign
- No business logic / role changes
- No new pages / features
- No header layout changes (already done in UX-HEADER-CLEANUP-02)

---

## Acceptance Criteria

### A) Guest
- [x] Logo → `/` (clickable home) - VERIFIED
- [x] Login/Register visible - VERIFIED
- [x] No overlap on desktop/mobile - VERIFIED

### B) Logged-in Consumer
- [x] "Οι παραγγελίες μου" (`/account/orders`) in dropdown - VERIFIED
- [x] No producer/admin links visible - VERIFIED

### C) Producer
- [x] "Πίνακας Παραγωγού" (`/producer/dashboard`) - VERIFIED
- [ ] "Παραγγελίες Παραγωγού" (`/producer/orders`) - TO ADD
- [x] No consumer/admin links visible - VERIFIED

### D) Admin
- [x] "Admin" (`/admin`) in dropdown - VERIFIED
- [x] No producer links visible - VERIFIED

### E) Mobile
- [ ] No overlap / breaking on 375px viewport
- [ ] All role-specific items accessible in mobile menu

---

## Changes Required

### 1. Header.tsx (Desktop Dropdown)

Add second link for producers:
```tsx
{isProducer && (
  <>
    <Link href="/producer/dashboard" data-testid="user-menu-dashboard">
      Πίνακας Παραγωγού
    </Link>
    <Link href="/producer/orders" data-testid="user-menu-producer-orders">
      Παραγγελίες Παραγωγού
    </Link>
  </>
)}
```

### 2. Header.tsx (Mobile Menu)

Add second link for producers in mobile menu.

### 3. E2E Test Update

Add test for `user-menu-producer-orders` testid visibility for producer role.

---

## Evidence Required

- Screenshots: Desktop + Mobile for each role
- CI green
- SUMMARY + TASKS docs
- STATE.md update

---

## Files to Change

1. `frontend/src/components/layout/Header.tsx` - Add producer orders link
2. `frontend/tests/e2e/header-nav.spec.ts` - Add test for new link
3. `docs/PRODUCT/NAVIGATION-V1.md` - Update spec with new link
4. `docs/AGENT/SUMMARY/Pass-UX-DASHBOARD-ENTRYPOINTS-01.md` - Summary
5. `docs/OPS/STATE.md` - Update

---

_Plan: UX-DASHBOARD-ENTRYPOINTS-01 | 2026-01-22_
