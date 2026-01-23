# Task: Pass-UI-SHELL-HEADER-FOOTER-01

## What
Stabilize UI shell (Header/Footer) with clear, predictable navigation per role.

## Status
**COMPLETE** — PR Pending

## Changes Made

| File | Change |
|------|--------|
| `Footer.tsx` | Removed "Παρακολούθηση Παραγγελίας" link, added `data-testid` |
| `CartIcon.tsx` | Made cart visible for ALL roles (including producers) |
| `ui-shell-header-footer.spec.ts` | New E2E test file (6 tests) |

## Header IA (Verified)

| Role | Visible Items |
|------|---------------|
| Guest | Logo, Προϊόντα, Παραγωγοί, Cart, Login, Register |
| Consumer | Logo, Προϊόντα, Παραγωγοί, Cart, User dropdown (Οι Παραγγελίες μου, Logout) |
| Producer | Logo, Προϊόντα, Παραγωγοί, Cart, User dropdown (Πίνακας Παραγωγού, Παραγγελίες Παραγωγού, Logout) |
| Admin | Logo, Προϊόντα, Παραγωγοί, Cart, User dropdown (Διαχείριση Admin, Logout) |

## Footer IA (Verified)

- Γρήγοροι Σύνδεσμοι: Προϊόντα, Παραγωγοί (NO order tracking)
- Για Παραγωγούς: Γίνε Παραγωγός, Σύνδεση Παραγωγού
- Υποστήριξη: Επικοινωνία, Όροι, Απόρρητο
- Language switcher (EL/EN) — stable position

## E2E Tests

| Test | Status |
|------|--------|
| Guest header elements | ✅ Pass |
| Consumer header elements | ✅ Pass |
| Producer header elements | ✅ Pass |
| Admin header elements | ✅ Pass |
| Footer no order tracking | ✅ Pass |
| Footer language switcher | ✅ Pass |

---

_Pass-UI-SHELL-HEADER-FOOTER-01 | 2026-01-24_
