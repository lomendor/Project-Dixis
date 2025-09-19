<?php

namespace App\Services\Courier;

use App\Contracts\CourierProviderInterface;
use App\Services\ShippingService;

class InternalCourierProvider implements CourierProviderInterface
{
    private ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Create a shipping label using internal PDF stub implementation
     */
    public function createLabel(int $orderId): array
    {
        $result = $this->shippingService->createLabel($orderId);

        // Add provider information to response
        $result['provider'] = 'internal';

        return $result;
    }

    /**
     * Get tracking information using internal implementation
     */
    public function getTracking(string $trackingCode): ?array
    {
        return $this->shippingService->getTrackingInfo($trackingCode);
    }

    /**
     * Get provider code
     */
    public function getProviderCode(): string
    {
        return 'internal';
    }

    /**
     * Internal provider is always healthy (no external dependencies)
     */
    public function isHealthy(): bool
    {
        return true;
    }
}