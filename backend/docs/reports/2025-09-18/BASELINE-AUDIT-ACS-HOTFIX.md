TL;DR
- Idempotency-Key: Sent as HTTP header on POST /shipments (correct), body retains idempotency_key (OK if ACS ignores or accepts).
- Error mapping: Provider now normalizes 4xx/429/5xx to codes (BAD_REQUEST/UNAUTHORIZED/FORBIDDEN/NOT_FOUND/RATE_LIMIT/PROVIDER_UNAVAILABLE) with http field.
- Tracking: Uses executeWithRetry; transient errors handled better than before.
- Tests: Global Http::preventStrayRequests + Http::fake present; no live network calls in CI.
- Caveat: Controller returns success=true even when provider returns a normalized error array; recommend interpreting provider error map in controller responses.

Critical Findings (Top 5)
1) Header idempotency: Implemented. `AcsCourierProvider::makeAcsApiCall()` sets `Idempotency-Key` for POST (backend/app/Services/Courier/AcsCourierProvider.php:163).
2) Body idempotency_key: Still included; harmless if ACS ignores duplicates. Keep if spec requires it.
3) Normalized errors: `mapAcsError()` returns arrays with `success=false`, `code`, `http`, `message` (backend/app/Services/Courier/AcsCourierProvider.php:354–407). Provider returns these for label/tracking failures.
4) Controller handling: `ShippingController::createLabel()` assumes provider returns a label, wraps as success=true; it doesn’t detect provider error maps. Same for `getTracking()` (treats any non-null array as success). Suggest minimal guard.
5) Tests isolation: `backend/tests/TestCase.php` enforces `Http::preventStrayRequests()`, suites use `Http::fake()`; new unit tests assert idempotency header and error code mappings (e.g., BAD_REQUEST, RATE_LIMIT, PROVIDER_UNAVAILABLE).

Detailed Verification
- Factory default
  - config/services.php: courier.provider defaults to 'none' → Internal provider (CourierProviderFactory@make).

- Idempotency header
  - backend/app/Services/Courier/AcsCourierProvider.php:160–167
    - Adds `Idempotency-Key` header when method POST and key provided.
  - backend/tests/Unit/Courier/AcsContractTest.php:318–322
    - Asserts POST includes Idempotency-Key header.

- Normalized error mapping
  - backend/app/Services/Courier/AcsCourierProvider.php:354–407
    - Maps 400/422→BAD_REQUEST, 401→UNAUTHORIZED, 403→FORBIDDEN, 404→NOT_FOUND, 429→RATE_LIMIT (+Retry-After), else→PROVIDER_UNAVAILABLE.
  - On label failure: returns normalized array (line ~76). On tracking failure: returns normalized array (line ~115).

- Tracking retries
  - backend/app/Services/Courier/AcsCourierProvider.php:95–110
    - Wraps GET with executeWithRetry; previous single-shot fixed.

- Controller behavior
  - backend/app/Http/Controllers/Api/ShippingController.php
    - createLabel: returns success=true with provider result; does not distinguish provider error arrays.
    - getTracking: treats any truthy provider array as success data; may leak error map into success response.

- Tests & CI safety
  - backend/tests/TestCase.php: global `Http::preventStrayRequests()`.
  - Feature + unit suites use `Http::fake()` for ACS endpoints and new assertions for error codes.

Patch Suggestions (Unified diffs ≤120 lines; read-only guidance)

1) Treat provider error map as error (createLabel)
--- a/backend/app/Http/Controllers/Api/ShippingController.php
+++ b/backend/app/Http/Controllers/Api/ShippingController.php
@@
-            $label = $provider->createLabel($order->id);
+            $label = $provider->createLabel($order->id);
+            if (is_array($label) && ($label['success'] ?? null) === false) {
+                $http = $label['http'] ?? 502;
+                return response()->json([
+                    'success' => false,
+                    'code' => $label['code'] ?? 'PROVIDER_ERROR',
+                    'message' => __('Αποτυχία δημιουργίας ετικέτας'),
+                    'details' => $label,
+                ], $http);
+            }
@@
-            return response()->json([
-                'success' => true,
-                'data' => $label,
-            ]);
+            return response()->json(['success' => true, 'data' => $label]);

2) Treat provider error map as error (getTracking)
--- a/backend/app/Http/Controllers/Api/ShippingController.php
+++ b/backend/app/Http/Controllers/Api/ShippingController.php
@@
-            if ($providerTracking) {
+            if (is_array($providerTracking) && ($providerTracking['success'] ?? true) === false) {
+                $http = $providerTracking['http'] ?? 502;
+                return response()->json([
+                    'success' => false,
+                    'code' => $providerTracking['code'] ?? 'PROVIDER_ERROR',
+                    'message' => __('Αποτυχία ανάκτησης στοιχείων αποστολής'),
+                    'details' => $providerTracking,
+                ], $http);
+            } elseif ($providerTracking) {
                 // Use enhanced tracking data from provider
                 $trackingData = [
                     'tracking_code' => $providerTracking['tracking_code'],
                     'status' => $providerTracking['status'],
                     'carrier_code' => $providerTracking['carrier_code'],
                 ];

3) Optional: surface normalized error code in label catch
--- a/backend/app/Http/Controllers/Api/ShippingController.php
+++ b/backend/app/Http/Controllers/Api/ShippingController.php
@@
-        } catch (\Exception $e) {
+        } catch (\Illuminate\Http\Client\RequestException $e) {
+            $status = $e->response?->status();
+            $code = match ($status) {
+                400, 422 => 'BAD_REQUEST', 401 => 'UNAUTHORIZED', 403 => 'FORBIDDEN',
+                404 => 'NOT_FOUND', 429 => 'RATE_LIMIT', default => 'PROVIDER_UNAVAILABLE',
+            };
+            return response()->json(['success' => false, 'code' => $code, 'message' => __('Αποτυχία δημιουργίας ετικέτας')], $status ?? 503);
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

Checklist
- Default provider remains Internal unless `COURIER_PROVIDER=acs` and healthy (verified).
- POST idempotency key present as HTTP header (verified) and body key retained (OK if ACS accepts).
- Normalized mapping exists at provider layer; recommend controller guards to propagate proper HTTP + code.
- Global Http::preventStrayRequests + per-suite Http::fake in place; no live network in CI.
- Runbook/docs exist under `docs/shipping/COURIER-API-PHASE2.md` and related hotfix reports.

