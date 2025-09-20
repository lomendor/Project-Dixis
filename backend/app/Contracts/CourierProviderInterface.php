<?php

namespace App\Contracts;

use App\Models\Order;

interface CourierProviderInterface
{
    /**
     * Create a shipping label for the given order
     */
    public function createLabel(int $orderId): array;

    /**
     * Get tracking information for the given tracking code
     */
    public function getTracking(string $trackingCode): ?array;

    /**
     * Get the provider name/code
     */
    public function getProviderCode(): string;

    /**
     * Check if the provider is available/healthy
     */
    public function isHealthy(): bool;
}