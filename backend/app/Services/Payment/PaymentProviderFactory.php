<?php

namespace App\Services\Payment;

use App\Contracts\PaymentProviderInterface;
use InvalidArgumentException;

class PaymentProviderFactory
{
    /**
     * Create a payment provider instance based on configuration.
     */
    public static function create(?string $provider = null): PaymentProviderInterface
    {
        $provider = $provider ?? config('services.payment.provider', 'fake');

        return match ($provider) {
            'fake' => new FakePaymentProvider,
            'stripe' => new StripePaymentProvider,
            'viva' => throw new InvalidArgumentException('Viva Payments provider not yet implemented'),
            default => throw new InvalidArgumentException("Unsupported payment provider: {$provider}"),
        };
    }

    /**
     * Get available payment providers.
     */
    public static function getAvailableProviders(): array
    {
        return [
            'fake' => [
                'name' => 'Fake Payment Provider',
                'description' => 'For development and testing',
                'enabled' => true,
            ],
            'stripe' => [
                'name' => 'Stripe',
                'description' => 'Credit card payments via Stripe',
                'enabled' => ! empty(config('services.stripe.secret_key')),
            ],
            'viva' => [
                'name' => 'Viva Payments',
                'description' => 'Greek payment processor',
                'enabled' => false,
            ],
        ];
    }

    /**
     * Check if a payment provider is properly configured.
     */
    public static function isProviderConfigured(string $provider): bool
    {
        return match ($provider) {
            'fake' => true, // Always available
            'stripe' => ! empty(config('services.stripe.secret_key')) && ! empty(config('services.stripe.public_key')),
            'viva' => ! empty(config('services.viva.merchant_id')) && ! empty(config('services.viva.api_key')),
            default => false,
        };
    }

    /**
     * Get the current active provider name.
     */
    public static function getActiveProvider(): string
    {
        return config('services.payment.provider', 'fake');
    }

    /**
     * Get payment method types supported by the current provider.
     */
    public static function getSupportedPaymentMethods(?string $provider = null): array
    {
        $provider = $provider ?? self::getActiveProvider();

        return match ($provider) {
            'fake' => ['card', 'bank_transfer', 'cash_on_delivery'],
            'stripe' => ['card', 'digital_wallet'],
            'viva' => ['card', 'bank_transfer', 'digital_wallet'],
            default => ['card'],
        };
    }
}
