# PRD-05 — Cart & Checkout
**Owner:** Frontend Lead · **Status:** Draft

## Ροές {#flows}
- Add to cart → Edit quantities → Shipping selection → Payment

## Απαιτήσεις {#requirements}
- State consistency, αποφυγή hydration bugs
- StorageState για E2E σταθερότητα
- Clear shipping options (link με PRD-03)

## KPIs {#kpis}
- Cart→Checkout conversion, Error rate, Abandonment %

## Acceptance (MVP) {#acceptance}
- [E2E] Σε νέο profile, checkout ολοκληρώνεται με σταθερό `storageState`, χωρίς React hydration warnings.
- [UI] Αλλαγή μεθόδου αποστολής δεν ρίχνει full rerender του καλαθιού.
- [Perf] TTFB checkout API ≤ 400ms p95, First Interaction ≤ 150ms p95 σε mid-range mobile.
- [A11y] Βασική πλοήγηση με πληκτρολόγιο, aria-labels σε form controls.
- [i18n] Υποστηρίζεται el/En για όλα τα labels checkout.

## Test Matrix (excerpt) {#tests}
| ID | Path | Kind | Mocking | Pass/Fail |
|----|------|------|---------|-----------|
| CO-E2E-001 | New user → add item → select shipping → pay (mock) | Playwright | Stripe mocked |  |
| CO-UI-002 | Change shipping method updates totals only | Component | N/A |  |
| CO-ERR-003 | Network 500 on /rates → graceful retry w/ toast | Integration | MSW |  |

## NFRs {#nfr}
- Observability: trace id per order; events `checkout_started`, `shipping_selected`, `payment_attempted`, `order_placed`.
- Error handling: typed errors + user-safe messages (ADR-002).
