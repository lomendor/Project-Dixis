TL;DR
- PR #186 adds a clean courier provider abstraction with an ACS provider (mocked), factory, env+service config, and solid unit tests.
- No public API changes yet; ShippingController still uses ShippingService directly (factory not wired in).
- Security looks safe (no external calls yet); config toggles and envs present for future sandbox integration.
- Recommend: wire controller to factory, preserve idempotency, add integration tests, and prepare HTTP client with retries/timeouts.

Critical Findings (Top 5)
- Integration gap: ShippingController::createLabel/getTracking do not use the new provider factory (backend/app/Http/Controllers/Api/ShippingController.php:61, 86).
- ACS provider is mocked; label_url points to storage path but no PDF is generated there by provider—ensure UX expectations or generate stub consistently.
- Config present (`services.courier`/`services.acs`) but not consumed outside factory; risk of drift if not wired soon.
- Health/fallback logic exists (factory) but circuit breaker/retry settings in config are not enforced yet by any HTTP client.
- Tests cover provider/factory contracts well; missing end-to-end tests proving controller uses provider selection (after wiring).

Detailed Findings

Backend: New Abstractions
- backend/app/Contracts/CourierProviderInterface.php:1
  - Defines createLabel(int $orderId): array, getTracking(string $trackingCode): ?array, getProviderCode(): string, isHealthy(): bool.

- backend/app/Services/Courier/InternalCourierProvider.php:1
  - Wraps existing ShippingService methods; adds `provider: 'internal'` to label response; always healthy.

- backend/app/Services/Courier/AcsCourierProvider.php:1
  - Reads ACS config; mocked implementations for label creation and tracking with consistent response shapes.
  - Idempotency: returns existing shipment if label_url exists (via Shipment lookup).
  - Tracking returns events, estimated_delivery, and ACS tracking_url.

- backend/app/Services/Courier/CourierProviderFactory.php:1
  - Selects provider based on `services.courier.provider` (none|internal|acs).
  - Health-check: falls back to Internal if selected provider unhealthy; exposes `getAvailableProviders()` and `healthCheck()`.

Backend: Controller/Routes
- backend/routes/api.php:14-32
  - Shipping routes already exist (quote/tracking/labels) with throttles and auth where applicable.

- backend/app/Http/Controllers/Api/ShippingController.php:61, 86
  - Still calls `$this->shippingService->createLabel(...)` and direct `Shipment::where(...` for tracking.
  - Suggest injecting and using CourierProviderFactory:
    - createLabel: `$provider = $factory->make(); return $provider->createLabel($order->id);`
    - getTracking: `$provider = $factory->make(); $data = $provider->getTracking($trackingCode);`
  - Keep existing authz/throttling; preserve idempotent semantics from providers.

Backend: Config/Env
- backend/config/services.php:73-107; backend/.env.example:68-
  - Adds `courier` section with provider/circuit_breaker/max_retries/timeout; ACS sandbox configuration keys with defaults.
  - Good forward design; ensure timeouts/retries are actually used in HTTP client in future phases.

Tests & Fixtures
- backend/tests/Unit/Courier/AcsContractTest.php:1
  - Validates provider code, health logic, label creation structure (tracking code pattern, label_url, idempotency), tracking structure, and fixtures format.

- backend/tests/Unit/Courier/CourierProviderFactoryTest.php:1
  - Validates provider selection, fallback to internal when ACS unhealthy, throws for unimplemented providers, available providers list, and health check summary.

- Fixtures: backend/tests/Fixtures/acs/*.json
  - label_created_response.json, tracking_response.json, error_response.json match expected shapes; useful for real client contract later.

Security & Access
- No live network calls yet; low risk. Label endpoint remains protected by `auth:sanctum` + `admin-access` (routes on main).
- Tracking remains public by code, with cross-user checks (admin only) in controller.
- When wiring to ACS, add request signing/headers handling, sanitize/log minimal data, and return only required fields.

Performance & UX
- No behavioral change until factory is used. When live:
  - Honor `services.courier.timeout` and `max_retries` with exponential backoff.
  - Cache short-lived tracking responses if polling.
  - Keep label creation idempotent via database constraint + early return.

Consistency & Types
- Response shape from providers matches existing UI expectations (`tracking_code`, `label_url`, `carrier_code`, `status`, plus tracking fields).
- Consider centralizing label/tracking DTOs to avoid divergence between internal/ACS providers.

Recommendations (Next Patch)
- Inject `CourierProviderFactory` into `ShippingController`; use it in `createLabel` and `getTracking`.
- Ensure Internal provider’s output aligns 1:1 with ACS provider fields (e.g., include `provider` consistently; add `estimated_delivery_days` if helpful).
- Prepare an HTTP client wrapper (Guzzle) with:
  - base_uri from `services.acs.api_base`
  - timeouts, retries (respect `services.courier.*`), and structured error mapping.
- Add feature tests proving controller uses selected provider (set `services.courier.provider=acs` vs `none`).
- Update docs/ops: how to switch providers via env; add health-check endpoint or admin screen to display `CourierProviderFactory->healthCheck()`.
