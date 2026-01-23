# Plan: Pass-UI-SHELL-HEADER-FOOTER-01

**Date**: 2026-01-24
**Status**: COMPLETE

---

## Goal

Stabilize UI shell (Header/Footer) with clear, predictable navigation. EL-first, no random UI elements, no layout shifts.

## Non-goals

- No business logic changes
- No new pages/routes
- No backend changes
- No redesign — only cleanup

---

## Header IA Decisions

### Always Visible (All Users)
- Logo (links to /) — Desktop: 48px, Mobile: 36px
- "Προϊόντα" → /products
- "Παραγωγοί μας" → /producers

### Guest
- "Είσοδος" → /auth/login
- "Εγγραφή" → /auth/register
- Cart icon (visible)

### Consumer (authenticated, not producer, not admin)
- User dropdown with name
- "Οι Παραγγελίες μου" → /account/orders
- "Αποσύνδεση"
- Cart icon (visible)

### Producer
- User dropdown with name
- "Πίνακας Παραγωγού" → /producer/dashboard
- "Παραγγελίες Παραγωγού" → /producer/orders
- "Αποσύνδεση"
- Cart icon (visible — producers can also shop)

### Admin
- User dropdown with name
- "Διαχείριση (Admin)" → /admin
- "Αποσύνδεση"
- Cart icon (visible)

### REMOVED from Header
- Language switcher (EL/EN) — NOT in header
- Notification bell — already removed
- Any dividers not serving above items

---

## Footer IA Decisions

### Keep
- **Γρήγοροι Σύνδεσμοι**: Προϊόντα, Παραγωγοί (REMOVE "Παρακολούθηση Παραγγελίας")
- **Για Παραγωγούς**: Γίνε Παραγωγός, Σύνδεση Παραγωγού
- **Υποστήριξη**: Επικοινωνία, Όροι Χρήσης, Πολιτική Απορρήτου
- Language switcher (EL/EN) — fixed position, no layout shift

### REMOVED from Footer
- "Παρακολούθηση Παραγγελίας" link (from Quick Links)

---

## Acceptance Criteria

1. [x] Header shows ONLY expected items per role (guest/consumer/producer/admin)
2. [x] Language switcher NOT in header
3. [x] "Παρακολούθηση Παραγγελίας" NOT in footer
4. [x] Language switcher remains in footer (stable position)
5. [x] Logo visible and correctly sized (48px desktop, 36px mobile)
6. [x] No overlapping elements on mobile
7. [x] E2E tests verify all role visibility rules
8. [x] Lint/typecheck/build pass

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing tests | Run full E2E suite before/after |
| Translation keys missing | Verify el.json/en.json have all keys |
| Mobile layout issues | Test responsive manually + E2E |

---

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/components/layout/Header.tsx` | Already clean — verify no language switcher |
| `frontend/src/components/layout/Footer.tsx` | Remove "Παρακολούθηση Παραγγελίας" link |
| `frontend/tests/e2e/ui-shell-header-footer.spec.ts` | New E2E test file |

---

_Pass-UI-SHELL-HEADER-FOOTER-01 | 2026-01-24_
