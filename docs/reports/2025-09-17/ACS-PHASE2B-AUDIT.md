TL;DR
- ACS Phase 2B introduces a real HTTP client in `AcsCourierProvider` with timeouts and manual retries; idempotency is computed but not sent as a request header.
- Feature flag defaults are safe (`COURIER_PROVIDER=none`), and factory wiring in `ShippingController` is in place; Internal provider remains the default.
- Tests use `Http::fake` and fixtures to avoid live calls; consider adding `Http::preventStrayRequests()` for extra safety.
- Error handling for label creation collapses all ACS failures to a 500; propose basic mapping (429/408 → 429; 4xx → 422; 5xx → 503) and propagate normalized messages.
- Tracking API call lacks retry/backoff; wrap with the same retry helper used for labels.

Critical Findings (Top 5)
- Missing idempotency header: `Idempotency-Key` not sent; only `idempotency_key` field in JSON body (backend/app/Services/Courier/AcsCourierProvider.php:46, 170).
- Tracking call has no retry: `getTracking` makes a single call; transient errors return null immediately (backend/app/Services/Courier/AcsCourierProvider.php:100-129).
- Coarse error mapping: label `RequestException` is rethrown as generic 500; normalize 4xx/5xx (backend/app/Services/Courier/AcsCourierProvider.php:77-86) and controller response.
- Test hardening: `Http::fake` is present but no `Http::preventStrayRequests()`—stray network calls could slip in new tests (backend/tests/...).
- Logging: includes `idempotency_key` in info/error logs; acceptable, but consider redaction in multi-tenant or shared logs.

Detailed Items
- HTTP client
  - Timeouts: `Http::timeout($timeout)` uses `services.courier.timeout` (default 30s). Good.
  - Retries: Manual `executeWithRetry` with exponential backoff used only on createLabel. It retries on 5xx, 429, 408; stops on other 4xx. Good baseline.
  - Idempotency: Key is computed and added to JSON body; many providers require `Idempotency-Key` header. Suggest adding the header for POST shipments.
  - Error normalization: Throwing generic `\Exception` bubbles to controller 500; consider mapping:
    - 400/422 → 422 Unprocessable Entity with ACS error message
    - 401/403 → 502/503 with generic message (misconfig)
    - 429 → 429 Too Many Requests
    - 5xx → 503 Service Unavailable

- Feature flag & factory
  - Default remains `none` in `.env.example` and `services.php`, so Internal provider is used by default. Good.
  - Controller is wired to `CourierProviderFactory` for both label and tracking; falls back when provider unhealthy.

- Tests & CI safety
  - Unit and feature tests set `Http::fake()` with fixtures; good isolation. Add `Http::preventStrayRequests()` to fail if any unmocked domain is called.
  - Fixtures: `tests/Fixtures/acs/*.json` validated by tests.

- Secrets
  - No hardcoded API keys; config reads env vars; `.env.example` provides placeholders. Good.

Patch Suggestions (Unified Diffs ≤120 lines)

1) Add Idempotency-Key header for POST label calls and reuse retry for tracking
--- a/backend/app/Services/Courier/AcsCourierProvider.php
+++ b/backend/app/Services/Courier/AcsCourierProvider.php
@@
         try {
             // Prepare shipment data for ACS API
             $shipmentData = $this->mapOrderToAcsRequest($order);
             $shipmentData['idempotency_key'] = $idempotencyKey;
@@
-            $response = $this->executeWithRetry(function () use ($shipmentData) {
-                return $this->makeAcsApiCall('POST', '/shipments', $shipmentData);
-            }, 'createLabel', $orderId);
+            $response = $this->executeWithRetry(function () use ($shipmentData, $idempotencyKey) {
+                return $this->makeAcsApiCall('POST', '/shipments', $shipmentData, $idempotencyKey);
+            }, 'createLabel', $orderId);
@@
-            // Make actual ACS API call for tracking
-            $response = $this->makeAcsApiCall('GET', "/shipments/{$trackingCode}");
+            // Make ACS API call for tracking with retry/backoff
+            $response = $this->executeWithRetry(function () use ($trackingCode) {
+                return $this->makeAcsApiCall('GET', "/shipments/{$trackingCode}");
+            }, 'getTracking', (int) ($shipment->order_id ?? 0));
@@
-    private function makeAcsApiCall(string $method, string $endpoint, array $data = []): array
+    private function makeAcsApiCall(string $method, string $endpoint, array $data = [], ?string $idempotencyKey = null): array
     {
         $timeout = config('services.courier.timeout', 30);
-
-        $httpClient = Http::timeout($timeout)
-            ->withHeaders($this->getAuthHeaders());
+
+        $headers = $this->getAuthHeaders();
+        if (strtoupper($method) === 'POST' && $idempotencyKey) {
+            $headers['Idempotency-Key'] = $idempotencyKey;
+        }
+        $httpClient = Http::timeout($timeout)->withHeaders($headers);
@@
         if ($response->failed()) {
             throw new RequestException($response);
         }

         return $response->json();
     }

2) Harden tests to prevent stray network calls
--- a/backend/tests/Feature/Http/Controllers/Api/ShippingProviderIntegrationTest.php
+++ b/backend/tests/Feature/Http/Controllers/Api/ShippingProviderIntegrationTest.php
@@
     protected function setUp(): void
     {
         parent::setUp();
+        Http::preventStrayRequests();
@@
         // Mock ACS API responses for integration tests
         Http::fake([
             'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),

--- a/backend/tests/Unit/Courier/AcsContractTest.php
+++ b/backend/tests/Unit/Courier/AcsContractTest.php
@@
     protected function setUp(): void
     {
         parent::setUp();
+        Http::preventStrayRequests();
@@
         $this->provider = new AcsCourierProvider();
@@
+        Http::fake([
+            'sandbox-api.acs.gr/v1/*' => Http::response(['ok' => true], 200),
+        ]);

Sandbox Checklist
- COURIER_PROVIDER default: Confirm `.env.example` has `COURIER_PROVIDER=none` and `config/services.php` default `'none'` (verified).
- Provider selection: With `COURIER_PROVIDER=none`, factory returns Internal; with `acs` and missing creds, factory falls back to Internal (verified by tests).
- CI isolation: Ensure every test suite that exercises HTTP adds `Http::preventStrayRequests()` and `Http::fake()` for domains used.
- No live calls: Grep ensure no direct `curl`/Guzzle outside Http facade; tighten by adding preventStrayRequests in base TestCase if desired.
- Error mapping: Consider mapping 429/408 to 429, 4xx to 422, 5xx to 503 in controller based on caught `RequestException->response()->status()`.
- Secrets: No hardcoded API keys; only env-based; keep `.env.example` placeholders—avoid real secrets in fixtures/logs.
