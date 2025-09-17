<?php

namespace App\Services\Courier;

use App\Contracts\CourierProviderInterface;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Support\Facades\Log;

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
     * Create a shipping label using ACS API (mocked for now)
     */
    public function createLabel(int $orderId): array
    {
        $order = Order::with(['orderItems.product', 'user'])->findOrFail($orderId);

        // Check for existing shipment
        $existingShipment = Shipment::where('order_id', $orderId)->first();
        if ($existingShipment && $existingShipment->label_url) {
            return $this->formatLabelResponse($existingShipment);
        }

        // TODO: In real implementation, make actual ACS API call
        // For now, return mocked response based on fixture
        $mockResponse = $this->getMockLabelResponse($order);

        // Create shipment record
        $shipment = Shipment::firstOrCreate(
            ['order_id' => $orderId],
            [
                'carrier_code' => 'ACS',
                'tracking_code' => $mockResponse['tracking_code'],
                'status' => 'labeled',
                'label_url' => $mockResponse['label_url'],
            ]
        );

        Log::info('ACS label created (mocked)', [
            'order_id' => $orderId,
            'tracking_code' => $mockResponse['tracking_code'],
            'provider' => 'acs',
        ]);

        return $this->formatLabelResponse($shipment);
    }

    /**
     * Get tracking information using ACS API (mocked for now)
     */
    public function getTracking(string $trackingCode): ?array
    {
        $shipment = Shipment::where('tracking_code', $trackingCode)->first();

        if (!$shipment) {
            return null;
        }

        // TODO: In real implementation, make actual ACS API call
        // For now, return mocked response based on fixture
        $mockResponse = $this->getMockTrackingResponse($trackingCode);

        return [
            'tracking_code' => $trackingCode,
            'status' => $mockResponse['status'],
            'carrier_code' => 'ACS',
            'carrier_name' => 'ACS Courier',
            'tracking_url' => "https://www.acscourier.net/track/{$trackingCode}",
            'order_id' => $shipment->order_id,
            'events' => $mockResponse['events'],
            'estimated_delivery' => $mockResponse['estimated_delivery'],
            'created_at' => $shipment->created_at,
            'updated_at' => $shipment->updated_at,
        ];
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
        // TODO: In real implementation, ping ACS health endpoint
        // For now, check if configuration is present
        return !empty($this->apiKey) && !empty($this->clientId);
    }

    /**
     * Get mocked label response (temporary implementation)
     */
    private function getMockLabelResponse(Order $order): array
    {
        // Generate ACS-style tracking code
        $trackingCode = 'ACS' . str_pad(mt_rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);

        return [
            'tracking_code' => $trackingCode,
            'label_url' => "storage/shipping/labels/acs_label_{$order->id}_{$trackingCode}.pdf",
            'carrier_code' => 'ACS',
            'status' => 'labeled',
            'estimated_delivery_days' => 2,
        ];
    }

    /**
     * Get mocked tracking response (temporary implementation)
     */
    private function getMockTrackingResponse(string $trackingCode): array
    {
        return [
            'status' => 'in_transit',
            'estimated_delivery' => now()->addDays(2)->toDateString(),
            'events' => [
                [
                    'timestamp' => now()->subHours(6)->toISOString(),
                    'status' => 'picked_up',
                    'location' => 'Athens Sorting Center',
                    'description' => 'Package picked up from sender',
                ],
                [
                    'timestamp' => now()->subHours(2)->toISOString(),
                    'status' => 'in_transit',
                    'location' => 'Athens Hub',
                    'description' => 'Package in transit to destination',
                ],
            ],
        ];
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