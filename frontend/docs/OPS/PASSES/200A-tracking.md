# Pass 200A — Public Tracking

- API: GET /api/orders/public/[token] (safe fields only, no personal data)
- Page: /track/[token] (EL-first UI)
- Dev helper: /api/dev/order-token (blocked in production)
- Tests: public-token.spec.ts (full flow)
- LOC: ~180 (API + page + tests)
