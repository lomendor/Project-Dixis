<?php

namespace App\Services\Courier;

use App\Contracts\CourierProviderInterface;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class AcsCourierProvider implements CourierProviderInterface
{
    private string $apiBase;
    private ?string $apiKey;
    private ?string $clientId;
    private ?string $clientSecret;

    public function __construct()
    {
        $this->apiBase = config('services.acs.api_base', 'https://sandbox-api.acs.gr/v1');
        $this->apiKey = config('services.acs.api_key');
        $this->clientId = config('services.acs.client_id');
        $this->clientSecret = config('services.acs.client_secret');
    }

    /**
     * Create a shipping label using ACS API
     */
    public function createLabel(int $orderId): array
    {
        $order = Order::with(['orderItems.product', 'user'])->findOrFail($orderId);

        // Check for existing shipment (idempotency)
        $existingShipment = Shipment::where('order_id', $orderId)->first();
        if ($existingShipment && $existingShipment->label_url) {
            return $this->formatLabelResponse($existingShipment);
        }

        // Generate idempotency key for this request
        $idempotencyKey = hash('sha256', "order:{$orderId}");

        try {
            // Prepare shipment data for ACS API
            $shipmentData = $this->mapOrderToAcsRequest($order);
            // Don't include idempotency in payload - use header instead

            // Make actual ACS API call with retry mechanism
            $response = $this->executeWithRetry(function () use ($shipmentData, $idempotencyKey) {
                return $this->makeAcsApiCall('POST', '/shipments', $shipmentData, $idempotencyKey);
            }, 'createLabel', $orderId);

            // Map ACS response to internal format
            $labelData = $this->mapAcsLabelResponse($response);

            // Create shipment record
            $shipment = Shipment::firstOrCreate(
                ['order_id' => $orderId],
                [
                    'carrier_code' => 'ACS',
                    'tracking_code' => $labelData['tracking_code'],
                    'status' => 'labeled',
                    'label_url' => $labelData['label_url'],
                ]
            );

            Log::info('ACS label created (real API)', [
                'order_id' => $orderId,
                'tracking_code' => $labelData['tracking_code'],
                'provider' => 'acs',
            ]);

            return $this->formatLabelResponse($shipment);

        } catch (RequestException $e) {
            return $this->mapAcsError($e, $e->response?->status(), 'createLabel');
        }
    }

    /**
     * Get tracking information using ACS API
     */
    public function getTracking(string $trackingCode): ?array
    {
        $shipment = Shipment::where('tracking_code', $trackingCode)->first();

        if (!$shipment) {
            return null;
        }

        try {
            // Make actual ACS API call for tracking with retry mechanism
            $response = $this->executeWithRetry(function () use ($trackingCode) {
                return $this->makeAcsApiCall('GET', "/shipments/{$trackingCode}");
            }, 'getTracking', $shipment->order_id);

            // Map ACS tracking response to internal format
            $trackingData = $this->mapAcsTrackingResponse($response, $trackingCode);

            return [
                'tracking_code' => $trackingCode,
                'status' => $trackingData['status'],
                'carrier_code' => 'ACS',
                'carrier_name' => 'ACS Courier',
                'tracking_url' => "https://www.acscourier.net/track/{$trackingCode}",
                'order_id' => $shipment->order_id,
                'events' => $trackingData['events'],
                'estimated_delivery' => $trackingData['estimated_delivery'],
                'created_at' => $shipment->created_at,
                'updated_at' => $shipment->updated_at,
            ];

        } catch (RequestException $e) {
            // Return normalized error for consistent handling
            return $this->mapAcsError($e, $e->response?->status(), 'getTracking');
        }
    }

    /**
     * Get provider code
     */
    public function getProviderCode(): string
    {
        return 'acs';
    }

    /**
     * Check if ACS provider is healthy
     */
    public function isHealthy(): bool
    {
        // Check if required configuration is present
        if (empty($this->apiKey) || empty($this->clientId)) {
            return false;
        }

        try {
            // Ping ACS health endpoint with minimal request
            $response = Http::timeout(5)
                ->withHeaders($this->getAuthHeaders())
                ->get($this->apiBase . '/zones');

            return $response->successful();

        } catch (\Exception $e) {
            Log::debug('ACS health check failed', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Make authenticated HTTP call to ACS API
     */
    private function makeAcsApiCall(string $method, string $endpoint, array $data = [], ?string $idempotencyKey = null): array
    {
        $timeout = config('services.courier.timeout', 30);

        $headers = $this->getAuthHeaders();
        if (strtoupper($method) === 'POST' && $idempotencyKey) {
            $headers['Idempotency-Key'] = $idempotencyKey;
        }

        $httpClient = Http::timeout($timeout)
            ->withHeaders($headers);

        $url = $this->apiBase . $endpoint;

        $response = match (strtoupper($method)) {
            'GET' => $httpClient->get($url),
            'POST' => $httpClient->post($url, $data),
            'PUT' => $httpClient->put($url, $data),
            'DELETE' => $httpClient->delete($url),
            default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}"),
        };

        if ($response->failed()) {
            throw new RequestException($response);
        }

        return $response->json();
    }

    /**
     * Get authentication headers for ACS API
     */
    private function getAuthHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->apiKey,
            'X-Client-ID' => $this->clientId,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => 'Dixis-Marketplace/1.0',
        ];
    }

    /**
     * Map order data to ACS shipment request format
     */
    private function mapOrderToAcsRequest(Order $order): array
    {
        $shippingAddress = $order->shipping_address ?? [];

        return [
            'service_type' => 'standard',
            'reference' => "DIXIS-{$order->id}",
            'sender' => [
                'name' => 'Project Dixis Marketplace',
                'address' => 'Κεντρική Διεύθυνση',
                'city' => 'Athens',
                'postal_code' => '10551',
                'country' => 'GR',
                'phone' => '+30 210 1234567',
            ],
            'recipient' => [
                'name' => $order->user->name,
                'address' => $shippingAddress['street'] ?? 'N/A',
                'city' => $shippingAddress['city'] ?? 'Athens',
                'postal_code' => $shippingAddress['postal_code'] ?? '10001',
                'country' => 'GR',
                'phone' => $order->user->phone ?? '+30 210 0000000',
            ],
            'items' => $order->orderItems->map(fn($item) => [
                'description' => $item->product_name,
                'quantity' => $item->quantity,
                'weight' => ($item->product->weight_per_unit ?? 0.5) * $item->quantity,
                'value' => $item->total_price,
            ])->toArray(),
            'cash_on_delivery' => 0, // COD not supported yet
            'insurance_value' => $order->total > 100 ? $order->total : 0,
        ];
    }

    /**
     * Map ACS label response to internal format
     */
    private function mapAcsLabelResponse(array $acsResponse): array
    {
        return [
            'tracking_code' => $acsResponse['tracking_code'] ?? $acsResponse['awb_number'] ?? 'ACS-UNKNOWN',
            'label_url' => $acsResponse['label_pdf_url'] ?? $acsResponse['pdf_url'] ?? null,
            'carrier_code' => 'ACS',
            'status' => 'labeled',
            'estimated_delivery_days' => $acsResponse['estimated_delivery_days'] ?? 2,
            'acs_shipment_id' => $acsResponse['shipment_id'] ?? null,
        ];
    }

    /**
     * Map ACS tracking response to internal format
     */
    private function mapAcsTrackingResponse(array $acsResponse, string $trackingCode): array
    {
        // Map ACS status to internal status
        $statusMapping = [
            'pending' => 'pending',
            'picked_up' => 'shipped',
            'in_transit' => 'in_transit',
            'out_for_delivery' => 'out_for_delivery',
            'delivered' => 'delivered',
            'failed' => 'failed',
            'returned' => 'returned',
        ];

        $acsStatus = $acsResponse['status'] ?? 'pending';
        $internalStatus = $statusMapping[$acsStatus] ?? 'pending';

        return [
            'status' => $internalStatus,
            'estimated_delivery' => $acsResponse['estimated_delivery'] ?? now()->addDays(2)->toDateString(),
            'events' => $this->mapAcsEvents($acsResponse['events'] ?? []),
        ];
    }

    /**
     * Map ACS tracking events to internal format
     */
    private function mapAcsEvents(array $acsEvents): array
    {
        return collect($acsEvents)->map(function ($event) {
            return [
                'timestamp' => $event['datetime'] ?? $event['timestamp'] ?? now()->toISOString(),
                'status' => $event['status'] ?? 'unknown',
                'location' => $event['location'] ?? $event['facility'] ?? 'Unknown',
                'description' => $event['description'] ?? $event['message'] ?? 'Status update',
            ];
        })->toArray();
    }

    /**
     * Execute operation with retry mechanism
     */
    private function executeWithRetry(callable $operation, string $operationType, int $orderId): mixed
    {
        $maxRetries = config('services.courier.max_retries', 3);
        $attempts = 0;

        while ($attempts < $maxRetries) {
            try {
                return $operation();

            } catch (RequestException $e) {
                $attempts++;
                $statusCode = $e->response?->status();

                // Determine if retry is appropriate
                if (!$this->shouldRetry($statusCode, $attempts, $maxRetries)) {
                    throw $e;
                }

                // Calculate backoff delay (exponential backoff)
                $delay = min(pow(2, $attempts), 30); // Max 30 seconds

                Log::warning('ACS API call failed, retrying', [
                    'operation' => $operationType,
                    'order_id' => $orderId,
                    'attempt' => $attempts,
                    'status_code' => $statusCode,
                    'delay_seconds' => $delay,
                    'max_retries' => $maxRetries,
                ]);

                sleep($delay);
            }
        }

        throw new \Exception("ACS API operation failed after {$maxRetries} attempts");
    }

    /**
     * Determine if request should be retried based on response status
     */
    private function shouldRetry(?int $statusCode, int $currentAttempt, int $maxRetries): bool
    {
        if ($currentAttempt >= $maxRetries) {
            return false;
        }

        // Retry on server errors (5xx) and specific client errors
        return match ($statusCode) {
            500, 502, 503, 504 => true, // Server errors
            429 => true, // Rate limited
            408 => true, // Request timeout
            default => false, // Don't retry on other client errors (4xx)
        };
    }

    /**
     * Map ACS API errors to normalized format
     */
    private function mapAcsError(RequestException $e, ?int $statusCode, string $operation): array
    {
        $retryAfter = null;
        if ($statusCode === 429 && $e->response) {
            $retryAfter = $e->response->header('Retry-After');
        }

        $errorMap = match ($statusCode) {
            400, 422 => [
                'success' => false,
                'code' => 'BAD_REQUEST',
                'http' => 422,
                'message' => 'Invalid request data',
                'operation' => $operation,
            ],
            401 => [
                'success' => false,
                'code' => 'UNAUTHORIZED',
                'http' => 401,
                'message' => 'Authentication failed',
                'operation' => $operation,
            ],
            403 => [
                'success' => false,
                'code' => 'FORBIDDEN',
                'http' => 403,
                'message' => 'Access forbidden',
                'operation' => $operation,
            ],
            404 => [
                'success' => false,
                'code' => 'NOT_FOUND',
                'http' => 404,
                'message' => 'Resource not found',
                'operation' => $operation,
            ],
            429 => [
                'success' => false,
                'code' => 'RATE_LIMIT',
                'http' => 429,
                'message' => 'Rate limit exceeded',
                'operation' => $operation,
                'retryAfter' => $retryAfter,
            ],
            default => [
                'success' => false,
                'code' => 'PROVIDER_UNAVAILABLE',
                'http' => 503,
                'message' => 'Courier service temporarily unavailable',
                'operation' => $operation,
            ],
        };

        Log::warning('ACS API error mapped', [
            'operation' => $operation,
            'status_code' => $statusCode,
            'error_code' => $errorMap['code'],
        ]);

        return $errorMap;
    }

    /**
     * Format label response for consistent API
     */
    private function formatLabelResponse(Shipment $shipment): array
    {
        return [
            'tracking_code' => $shipment->tracking_code,
            'label_url' => $shipment->label_url,
            'carrier_code' => $shipment->carrier_code,
            'status' => $shipment->status,
            'provider' => 'acs',
        ];
    }
}