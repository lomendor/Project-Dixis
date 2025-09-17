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
        $idempotencyKey = $this->generateIdempotencyKey($order);

        try {
            // Prepare shipment data for ACS API
            $shipmentData = $this->mapOrderToAcsRequest($order);
            $shipmentData['idempotency_key'] = $idempotencyKey;

            // Make actual ACS API call with retry mechanism
            $response = $this->executeWithRetry(function () use ($shipmentData) {
                return $this->makeAcsApiCall('POST', '/shipments', $shipmentData);
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
                'acs_reference' => $response['shipment_id'] ?? null,
                'idempotency_key' => $idempotencyKey,
            ]);

            return $this->formatLabelResponse($shipment);

        } catch (RequestException $e) {
            Log::error('ACS API request failed after retries', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
                'status_code' => $e->response?->status(),
                'idempotency_key' => $idempotencyKey,
            ]);

            throw new \Exception("ACS API error: " . $e->getMessage());
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
            // Make actual ACS API call for tracking
            $response = $this->makeAcsApiCall('GET', "/shipments/{$trackingCode}");

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
            Log::warning('ACS tracking API failed, using fallback', [
                'tracking_code' => $trackingCode,
                'error' => $e->getMessage(),
                'status_code' => $e->response?->status(),
            ]);

            // Return null to trigger fallback to internal tracking
            return null;
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
    private function makeAcsApiCall(string $method, string $endpoint, array $data = []): array
    {
        $timeout = config('services.courier.timeout', 30);

        $httpClient = Http::timeout($timeout)
            ->withHeaders($this->getAuthHeaders());

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
     * Generate idempotency key for API requests
     */
    private function generateIdempotencyKey(Order $order): string
    {
        // Create a unique key based on order data that won't change
        $keyData = [
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'total' => $order->total,
            'created_at' => $order->created_at->timestamp,
        ];

        return 'dixis_' . hash('sha256', json_encode($keyData));
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