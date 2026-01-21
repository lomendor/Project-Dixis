# TASK — Pass UI-A11Y-EL-01

## Goal

Fix Greek localization and accessibility issues across public UI surfaces.

## Scope

UI/a11y only. No business logic changes.

## Deliverables

### Price Formatting (el-GR locale)

- [x] `ProductCard.tsx` — Use `Intl.NumberFormat('el-GR')` for price display
- [x] `order/confirmation/[orderId]/page.tsx` — Use `fmtEUR.format()` for all prices

### Accessibility (Greek aria-labels)

- [x] `CartIcon.tsx` — Change `View cart with X items` → `Προβολή καλαθιού με X προϊόντα`
- [x] `Header.tsx` — Change `Close/Open menu` → `Κλείσιμο/Άνοιγμα μενού`

### Missing Translations

- [x] `messages/el.json` — Add `checkoutPage.cardPayment`, `securePayment`, `cancelPayment`

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/ProductCard.tsx` | Greek EUR formatting |
| `frontend/src/components/cart/CartIcon.tsx` | Greek aria-labels |
| `frontend/src/components/layout/Header.tsx` | Greek mobile menu aria-labels |
| `frontend/src/app/order/confirmation/[orderId]/page.tsx` | Greek EUR formatting |
| `frontend/messages/el.json` | Added missing checkout keys |

## DoD

- [x] All price displays use el-GR format (XX,XX €)
- [x] All aria-labels are in Greek
- [x] Missing translation keys added
- [x] `pnpm lint` passes
- [ ] PR created + CI green
- [ ] Merged

## Result

**PENDING** — Awaiting CI verification.
