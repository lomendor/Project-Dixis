TL;DR
- Default provider remains safe: `COURIER_PROVIDER=none` selects Internal; ACS is opt‑in via env.
- AcsCourierProvider uses Laravel Http with timeouts and manual retries for label creation; tracking currently single‑shot.
- Idempotency key is computed and sent in the request body; not sent as `Idempotency-Key` header.
- Error mapping is coarse; exceptions surface as 500 without normalized codes (e.g., BAD_REQUEST, RATE_LIMIT, PROVIDER_UNAVAILABLE).
- Tests block live HTTP (Http::fake + Http::preventStrayRequests); runbook/docs for ACS are present under `docs/shipping`.

Critical Findings (Top 5)
1) Factory default: Verified `services.courier.provider` defaults to `'none'` → Internal provider (safe by default).
2) Idempotency header: Not included; only `idempotency_key` in JSON. Many providers rely on the `Idempotency-Key` header for dedupe.
3) Tracking retry: `getTracking` performs a single HTTP call; transient failures degrade to fallback immediately.
4) Error mapping: Label errors (4xx/5xx) rethrown as generic 500; response lacks normalized error codes (e.g., RATE_LIMIT for 429).
5) Test isolation: Strong — global `Http::preventStrayRequests()` in backend/tests/TestCase.php and per‑suite `Http::fake()`; keep this pattern for any new tests.

Detailed Items
- CourierProviderFactory (backend/app/Services/Courier/CourierProviderFactory.php:23)
  - Reads `config('services.courier.provider','none')`; `none`/unhealthy provider → Internal; `acs` + healthy → ACS. Good.

- AcsCourierProvider (backend/app/Services/Courier/AcsCourierProvider.php)
  - Timeouts: `Http::timeout($timeout)` obeys `services.courier.timeout` (default 30s). Good.
  - Retries: `executeWithRetry` wraps label creation (POST /shipments) with exponential backoff; retriable on 5xx/429/408.
  - Tracking: `getTracking` calls once (`makeAcsApiCall('GET', ...)`) and returns null on failure to trigger fallback — consider applying the same retry helper.
  - Idempotency: `generateIdempotencyKey($order)`; added to body as `idempotency_key`, not to header.
  - Error handling: Catches `RequestException` in label creation and rewrites to generic `\Exception`, causing 500 in controller; no normalized internal codes.
  - Auth headers: `Authorization: Bearer`, `X-Client-ID`, JSON content/accept; no `Idempotency-Key` when POSTing.

- Controller (backend/app/Http/Controllers/Api/ShippingController.php)
  - Wired to factory for label + tracking; preserves fallback to internal shipment data.
  - Authorization: `admin-access` gate for label creation; tracking cross‑user guard present.
  - Error mapping: Any provider failure returns 500 with Greek message; consider mapping specific statuses to normalized codes.

- Tests
  - Unit: backend/tests/Unit/Courier/AcsContractTest.php uses `Http::fake(...)`; TestCase enforces `Http::preventStrayRequests()`.
  - Feature: backend/tests/Feature/Http/Controllers/Api/ShippingProviderIntegrationTest.php fakes ACS endpoints; label auth and tracking flows covered.

- Runbook/Docs
  - docs/shipping/COURIER-API-PHASE2.md documents envs, authentication, status mapping, fixtures, and deployment steps; multiple reports under docs/reports detail wire‑up and test strategy.

Patch Suggestions (Unified Diffs ≤120 lines; safe/read‑only guidance)

1) Add `Idempotency-Key` header for POST /shipments and reuse retry for tracking
--- a/backend/app/Services/Courier/AcsCourierProvider.php
+++ b/backend/app/Services/Courier/AcsCourierProvider.php
@@
-            $response = $this->executeWithRetry(function () use ($shipmentData) {
-                return $this->makeAcsApiCall('POST', '/shipments', $shipmentData);
-            }, 'createLabel', $orderId);
+            $response = $this->executeWithRetry(function () use ($shipmentData, $idempotencyKey) {
+                return $this->makeAcsApiCall('POST', '/shipments', $shipmentData, $idempotencyKey);
+            }, 'createLabel', $orderId);
@@
-            $response = $this->makeAcsApiCall('GET', "/shipments/{$trackingCode}");
+            $response = $this->executeWithRetry(function () use ($trackingCode) {
+                return $this->makeAcsApiCall('GET', "/shipments/{$trackingCode}");
+            }, 'getTracking', (int) ($shipment->order_id ?? 0));
@@
-    private function makeAcsApiCall(string $method, string $endpoint, array $data = []): array
+    private function makeAcsApiCall(string $method, string $endpoint, array $data = [], ?string $idempotencyKey = null): array
     {
         $timeout = config('services.courier.timeout', 30);
 
-        $httpClient = Http::timeout($timeout)
-            ->withHeaders($this->getAuthHeaders());
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

2) Normalize provider errors in controller (basic mapping)
--- a/backend/app/Http/Controllers/Api/ShippingController.php
+++ b/backend/app/Http/Controllers/Api/ShippingController.php
@@
-        } catch (\Exception $e) {
+        } catch (\Illuminate\Http\Client\RequestException $e) {
+            $status = $e->response?->status();
+            $code = match ($status) {
+                400, 422 => 'BAD_REQUEST',
+                408 => 'TIMEOUT',
+                429 => 'RATE_LIMIT',
+                401, 403 => 'PROVIDER_AUTH',
+                500, 502, 503, 504 => 'PROVIDER_UNAVAILABLE',
+                default => 'PROVIDER_ERROR',
+            };
+            return response()->json([
+                'success' => false,
+                'code' => $code,
+                'message' => 'Αποτυχία δημιουργίας ετικέτας',
+            ], $status ?? 502);
+        } catch (\Exception $e) {
             Log::error('Label creation error', [
                 'order_id' => $order->id,
                 'message' => $e->getMessage(),
             ]);
 
             return response()->json([
                 'success' => false,
                 'message' => 'Αποτυχία δημιουργίας ετικέτας',
             ], 500);
         }
 
Sandbox / Runbook Checklist
- Feature flag: `COURIER_PROVIDER=none` by default (config/services.php), Internal provider selected unless `acs` and healthy.
- Idempotency: Compute key per order; add `Idempotency-Key` header for POST; retain JSON `idempotency_key` if ACS expects it.
- Retries: Keep label retries; add tracking retries for transient faults.
- Error mapping: Map 4xx/5xx to normalized codes in controller; include HTTP status passthrough when safe.
- CI: Global `Http::preventStrayRequests()` (backend/tests/TestCase.php) + per‑suite `Http::fake()` for all ACS endpoints.
- Runbook: docs/shipping/COURIER-API-PHASE2.md provides env setup, status mappings, and sandbox steps.
