# PLAN — Pass UI-A11Y-EL-01

**Created:** 2026-01-21
**Author:** Claude (Release Lead)
**Status:** DRAFT

---

## Goal

Fix Greek localization and accessibility issues across public UI surfaces.

**Focus:**
1. EUR currency formatting (el-GR locale: `12,50 €` not `12.50€`)
2. Greek aria-labels for screen readers
3. Missing translation keys

---

## Non-Goals

- No business logic changes
- No new features
- No admin-only surfaces (lower priority)
- No database changes

---

## Acceptance Criteria

- [ ] All product prices display as `XX,XX €` (Greek format)
- [ ] CartIcon aria-label is Greek (`Προβολή καλαθιού με X προϊόντα`)
- [ ] Header mobile menu aria-labels are Greek
- [ ] Checkout Stripe flow translation keys exist in el.json
- [ ] E2E test passes with price format validation
- [ ] No regressions in existing E2E tests

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Price format breaks cart calculations | HIGH | Formatting is display-only; `priceCents` (integer) used for math |
| Breaking Playwright tests | MEDIUM | Update selectors/assertions that expect old format |
| Missing translation keys cause runtime errors | LOW | Use fallback mechanism in `t()` function |

---

## Constraints

1. **EL-first**: Greek is primary language; EN is secondary
2. **a11y**: All interactive elements must have accessible names
3. **Mobile-first**: Changes must work on 375px viewport
4. **No failing baseline**: Must pass all existing E2E tests

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/ProductCard.tsx` | Use `Intl.NumberFormat` for price |
| `src/components/cart/CartIcon.tsx` | Greek aria-labels |
| `src/components/layout/Header.tsx` | Greek mobile menu aria-labels |
| `src/app/order/confirmation/[orderId]/page.tsx` | Use `fmtEUR()` helper |
| `messages/el.json` | Add missing checkout keys |
| `tests/e2e/products.spec.ts` (if exists) | Update price format expectations |

---

## DoD (Definition of Done)

- [ ] All files updated per spec
- [ ] `pnpm lint` passes
- [ ] E2E tests pass locally (if runnable)
- [ ] PR created with clear diff
- [ ] CI green (all required checks)
- [ ] Merged to main

---

## Evidence (placeholders)

- PR: TBD
- Commit: TBD
- CI Run: TBD
- Summary: `docs/AGENT/SUMMARY/Pass-UI-A11Y-EL-01.md`

---

_Plan: UI-A11Y-EL-01 | Created: 2026-01-21_
