TL;DR
- Shipping v1.1 on main refines zone detection and pricing via new rate tables and remote-area handling; API shapes remain aligned with frontend Zod types.
- Routes/authz unchanged: quote public + throttled, labels admin + throttled, tracking by code public with cross-user guard.
- Label creation remains idempotent; default carrier mapping preserved; tracking enrichment now delegated via provider factory when configured.
- Frontend continues using /api/v1 endpoints and schemas; tests emphasize data-testid selectors.
- Minor nits: normalize cents fields in breakdown for consistency; consider retry/backoff for provider tracking; add preventStrayRequests in all HTTP tests.

Backend
- Routes (backend/routes/api.php:96-110)
  - POST /api/v1/shipping/quote → ShippingController@getQuote (throttle: 60/min)
  - GET /api/v1/shipping/tracking/{trackingCode} (throttle: 60/min)
  - POST /api/v1/shipping/labels/{order} (auth:sanctum + throttle: 10/min)
  - GET /api/v1/orders/{order}/shipment (auth:sanctum)

- ShippingService (backend/app/Services/ShippingService.php)
  - Config: adds `config/shipping/rates.gr.json` and `remote_postal_codes.json`; `loadConfiguration` now loads zones, profiles, rateTables, remotePostalCodes.
  - Zone detection: `getZoneByPostalCode` checks explicit `remote_postal_codes` first (allowing zone override), then pattern mapping from `rateTables.postal_code_mapping`, defaulting to `GR_MAINLAND`.
  - Pricing: `calculateShippingCost` uses `rateTables.tables[INTERNAL_STANDARD][zone]` with refined tiers, `island_multiplier`, and `remote_surcharge`. Returns `cost_cents`, `cost_eur`, `zone_code`, `zone_name`, `estimated_delivery_days`, and a `breakdown` including base_rate, extra_weight_kg, extra_cost, island_multiplier, remote_surcharge, billable_weight_kg.
  - Quote shape: `getQuote` returns `zone_code`, `zone_name`, `carrier_code` (default fallback), `estimated_delivery_days`, and detailed `breakdown` with actual/volumetric weights, postal_code, profile_applied.
  - Labels: idempotency preserved; existing shipment short-circuits; carrier mapping normalized; PDF stub content improved (structured address fields).
  - Tracking: `getTrackingInfo` returns normalized shape with optional carrier `tracking_url`.

- ShippingController (backend/app/Http/Controllers/Api/ShippingController.php)
  - Uses `CourierProviderFactory` for label creation and tracking enrichment; falls back to internal shipment data if provider returns null.
  - Access controls: label creation requires `admin-access` gate; tracking rejects cross-user access unless admin.

- Courier Abstraction
  - Factory selects provider by `services.courier.provider` (default none→Internal). ACS provider supports HTTP calls with timeout and retries for labels; tracking retry under consideration.

Frontend
- Components and hooks use `/api/v1` endpoints and Zod schemas (from prior integrations). Debounced shipping quote in cart persists; `data-testid` usage emphasized across UI.
- Legacy `frontend/src/lib/api.ts` contains earlier `ShippingQuote` shape (zip/city/weight/volume) for compatibility; primary flow uses v1 shipping endpoints.

Tests
- Feature tests cover shipping quote, label authorization, tracking endpoints, and provider selection fallbacks.
- ACS provider unit/integration tests use `Http::fake` and fixtures; suggest adding `Http::preventStrayRequests()` in test setup for defense-in-depth.

Security & Access
- Labels behind `auth:sanctum` + `admin-access`; quotes public but throttled; tracking throttled with cross-user checks.
- No secrets committed; ACS/API credentials pulled from env; `.env.example` holds placeholders.

Performance & UX
- Rate tables allow more granular pricing without extra API calls; volumetric divisor configurable.
- Consider adding retry/backoff for provider `getTracking` calls (currently one-shot in some branches) to smooth transient failures.

Nits / Opportunities
- Breakdown fields: consider including cents variants (`base_cost_cents`, `weight_adjustment_cents`, etc.) for full symmetry with frontend schemas (currently derived only from totals in some places).
- Tests: enforce `Http::preventStrayRequests()` in provider-related suites; add tests for remote-area surcharges and island multipliers edge cases.

