<?php

namespace App\Services\Courier;

use App\Contracts\CourierProviderInterface;
use App\Services\ShippingService;
use Illuminate\Support\Facades\Log;

class CourierProviderFactory
{
    private ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Create appropriate courier provider based on configuration
     */
    public function make(): CourierProviderInterface
    {
        $providerType = config('services.courier.provider', 'none');

        $provider = $this->createProvider($providerType);

        // Fallback to internal provider if external provider is unhealthy
        if (!$provider->isHealthy()) {
            Log::warning("Courier provider '{$providerType}' is unhealthy, falling back to internal", [
                'requested_provider' => $providerType,
                'fallback_provider' => 'internal',
            ]);

            return new InternalCourierProvider($this->shippingService);
        }

        Log::info("Using courier provider: {$provider->getProviderCode()}");

        return $provider;
    }

    /**
     * Create provider instance based on type
     */
    private function createProvider(?string $providerType): CourierProviderInterface
    {
        return match ($providerType) {
            'acs' => new AcsCourierProvider(),
            'elta' => throw new \Exception('ELTA provider not implemented yet'),
            'speedex' => throw new \Exception('Speedex provider not implemented yet'),
            default => new InternalCourierProvider($this->shippingService),
        };
    }

    /**
     * Get all available provider types
     */
    public function getAvailableProviders(): array
    {
        return [
            'none' => 'Internal PDF Provider',
            'internal' => 'Internal PDF Provider',
            'acs' => 'ACS Courier',
            // 'elta' => 'ELTA Courier', // Coming in future phases
            // 'speedex' => 'Speedex Courier', // Coming in future phases
        ];
    }

    /**
     * Check health of all configured providers
     */
    public function healthCheck(): array
    {
        $results = [];

        $availableProviders = ['internal', 'acs'];

        foreach ($availableProviders as $providerType) {
            try {
                $provider = $this->createProvider($providerType);
                $results[$providerType] = [
                    'healthy' => $provider->isHealthy(),
                    'provider_code' => $provider->getProviderCode(),
                ];
            } catch (\Exception $e) {
                $results[$providerType] = [
                    'healthy' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}