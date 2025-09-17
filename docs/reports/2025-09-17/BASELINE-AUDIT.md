TL;DR
- Shipping Engine v1 is wired correctly on main: routes, auth, and response shapes align with frontend Zod types.
- Quote, label, tracking, and order-shipment endpoints exist under `/api/v1/shipping/*` with sane throttling and authz.
- Frontend uses `/api/v1` endpoints, Zod schemas, debounced quotes, and testids; UX/perf notably improved.
- Service adds idempotent label creation and carrier mapping; unknown postal codes default to mainland.
- Remaining nits: tracking could use SWR caching/polling, temp order cleanup on failures, consolidate legacy shipping types, consider TS `strict`.

Backend
- Routes: backend/routes/api.php:16-32
  - Quote: `POST /api/v1/shipping/quote` → `ShippingController@getQuote` (throttle: 60/min)
  - Tracking: `GET /api/v1/shipping/tracking/{trackingCode}` (throttle: 60/min)
  - Labels: `POST /api/v1/shipping/labels/{order}` (auth:sanctum + throttle: 10/min)
  - Order shipment: `GET /api/v1/orders/{order}/shipment` (auth:sanctum)

- Controller: backend/app/Http/Controllers/Api/ShippingController.php:21
  - `getQuote` validates `items` and `postal_code`, creates a temporary order, calls service, returns validated payload.
  - `createLabel` uses `$this->authorize('admin-access')` (AuthServiceProvider defines this gate) and returns label data.
  - `getTracking` permits public lookup by code, restricts cross-user access to admins; returns basic tracking fields + events.
  - `getOrderShipment` requires `view` authorization on order and returns shipment summary.

- AuthZ: backend/app/Providers/AuthServiceProvider.php:23
  - Gate `admin-access` present. Used by `createLabel` and tracking cross-user protection.

- Service: backend/app/Services/ShippingService.php:108
  - `getZoneByPostalCode`: matches configured patterns; defaults to `GR_MAINLAND` for unknown (graceful handling).
  - `calculateShippingCost`: zone-tier pricing; returns cents and days.
  - `getQuote`: returns `{ cost_cents, cost_eur, zone_code, zone_name, carrier_code, estimated_delivery_days, breakdown }` with `_cents` fields and a default `carrier_code`.
  - Idempotency: `createLabel` first returns existing label if present; otherwise maps carrier key→short code and creates PDF stub.
  - `mapCarrierKeyToCode`: handles ELTA/ACS/SPEEDEX keys.

Configs
- backend/config/shipping/gr_zones.json: tiered pricing per zone and estimated days.
- backend/config/shipping/profiles.json: default + producer profiles; `carrier_settings` include default key and code mapping.

Frontend
- Schemas: frontend/src/lib/shippingSchemas.ts:1
  - Zod request/response schemas for quote, label create, and order shipment; union with error type.

- Components
  - ShippingQuote: frontend/src/components/shipping/ShippingQuote.tsx:1
    - Calls `/api/v1/shipping/quote`, validates with Zod, uses 300ms debounce, adds `data-testid` for states.
  - ShipmentTracking: frontend/src/components/shipping/ShipmentTracking.tsx:1
    - Calls `/api/v1/orders/{id}/shipment` or `/api/v1/shipping/tracking/{code}`, validates with Zod; could adopt SWR for caching/polling.
  - ShippingLabelManager: frontend/src/components/shipping/ShippingLabelManager.tsx:1
    - Calls `/api/v1/shipping/labels/{orderId}`, validates with Zod; extends data for UI.

- Cart Integration: frontend/src/app/cart/page.tsx:17
  - Renders `ShippingQuote`; on quote success, auto-selects method with price/days.

Tests
- Backend feature tests: backend/tests/Feature/Api/ShippingQuoteTest.php:1
  - Cover Athens/Thessaloniki/Islands, heavy packages, validation, and unknown ZIP fallback.
- Backend E2E-like feature tests: backend/tests/Feature/ShippingEngineV1Test.php:1
  - Exercise service calculations, API endpoints (`/api/v1/shipping/*`), and authorization for labels.
- Frontend tests continue to reference shipping quote via `useCheckout` and e2e helpers; with added testids, selectors are more robust.

Security & Access
- Label create protected by `auth:sanctum` + `admin-access`; tracking throttled; order-shipment behind auth.
- Public tracking by code acceptable if intended; cross-user access blocked unless admin.

Performance & UX
- Debounced shipping quote prevents request storms when typing ZIP and when cart mutates.
- Consider SWR/react-query for shipment tracking with conditional polling (e.g., every 10–20s when `status === 'in_transit'`, off otherwise).

Consistency & Hygiene
- Types: Zod schemas in `shippingSchemas.ts` provide a single source of truth for shipping types in the UI.
- Legacy: `frontend/src/lib/api.ts` still contains legacy `ShippingQuote` types (zip/city/weight/volume). Recommend deprecating or aligning to avoid confusion.
- TS Config: `frontend/tsconfig.json` has `strict: false` with `noImplicitAny: true`. Consider enabling `strict: true` post-schema adoption.

Small Improvements (Low-Risk)
- ShippingController@getQuote: backend/app/Http/Controllers/Api/ShippingController.php:38
  - On exception, temporary order isn’t deleted. Move cleanup into a `finally` block to avoid orphan temp records.
- ShippingService@getQuote: backend/app/Services/ShippingService.php:140
  - `carrier_code` currently falls back to 'ELTA'. Optionally use default carrier map for consistency with label creation.
- ShipmentTracking: Add SWR with `refreshInterval` only when in-transit; disable focus revalidate.
- Tests: Add explicit cases for bulky vs dense (volumetric vs actual) and multi-producer carts if intended by business rules.
