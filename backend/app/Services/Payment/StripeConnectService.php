<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Producer;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

/**
 * Pass STRIPE-CONNECT-01: Stripe Connect Express service.
 *
 * Manages connected accounts for producers, transfers after payment,
 * and Express Dashboard access. Uses "Separate Charges & Transfers" model:
 * customer pays Dixis → webhook creates Transfer to producer's connected account.
 */
class StripeConnectService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('payments.stripe.secret_key'));
    }

    /**
     * Check if Stripe Connect is enabled via feature flag.
     */
    public static function isEnabled(): bool
    {
        return (bool) config('payments.stripe_connect.enabled', false);
    }

    /**
     * Create a Stripe Express connected account for a producer.
     * Returns the Stripe account ID (acct_xxx).
     */
    public function createConnectedAccount(Producer $producer): string
    {
        $account = $this->stripe->accounts->create([
            'type' => 'express',
            'country' => 'GR',
            'email' => $producer->email,
            'capabilities' => [
                'card_payments' => ['requested' => true],
                'transfers' => ['requested' => true],
            ],
            'business_type' => 'individual',
            'business_profile' => [
                'name' => $producer->business_name ?? $producer->name,
                'url' => $producer->website ?? config('app.url') . '/producers/' . $producer->slug,
                'mcc' => '5411', // Grocery stores, supermarkets
            ],
            'settings' => [
                'payouts' => [
                    'schedule' => [
                        'interval' => 'manual', // Platform controls payouts
                    ],
                ],
            ],
            'metadata' => [
                'producer_id' => $producer->id,
                'dixis_env' => config('app.env'),
            ],
        ]);

        $producer->update([
            'stripe_connect_id' => $account->id,
            'stripe_connect_status' => 'pending',
        ]);

        Log::info('Stripe Connect account created', [
            'producer_id' => $producer->id,
            'account_id' => $account->id,
        ]);

        return $account->id;
    }

    /**
     * Create an Account Link for Stripe-hosted onboarding.
     * Returns the URL to redirect the producer to.
     */
    public function createAccountLink(Producer $producer, string $type = 'account_onboarding'): string
    {
        if (!$producer->stripe_connect_id) {
            throw new \RuntimeException('Producer has no Stripe Connect account');
        }

        $frontendUrl = config('app.frontend_url', 'https://dixis.gr');

        $accountLink = $this->stripe->accountLinks->create([
            'account' => $producer->stripe_connect_id,
            'refresh_url' => $frontendUrl . '/producer/settings?stripe=refresh',
            'return_url' => $frontendUrl . '/producer/settings?stripe=complete',
            'type' => $type,
        ]);

        return $accountLink->url;
    }

    /**
     * Get the current status of a connected account.
     */
    public function getAccountStatus(string $accountId): array
    {
        $account = $this->stripe->accounts->retrieve($accountId);

        return [
            'charges_enabled' => $account->charges_enabled,
            'payouts_enabled' => $account->payouts_enabled,
            'details_submitted' => $account->details_submitted,
            'requirements' => [
                'currently_due' => $account->requirements->currently_due ?? [],
                'eventually_due' => $account->requirements->eventually_due ?? [],
                'past_due' => $account->requirements->past_due ?? [],
                'disabled_reason' => $account->requirements->disabled_reason ?? null,
            ],
        ];
    }

    /**
     * Create a Transfer from platform to a connected account.
     *
     * Called in the webhook after payment succeeds. The transfer amount
     * is the order total minus the commission (application fee equivalent).
     */
    public function createTransfer(
        Order $order,
        int $amountCents,
        string $connectedAccountId,
        string $transferGroup
    ): \Stripe\Transfer {
        $transfer = $this->stripe->transfers->create([
            'amount' => $amountCents,
            'currency' => 'eur',
            'destination' => $connectedAccountId,
            'transfer_group' => $transferGroup,
            'metadata' => [
                'order_id' => $order->id,
                'dixis_env' => config('app.env'),
            ],
        ]);

        $order->update([
            'stripe_transfer_id' => $transfer->id,
            'stripe_transfer_status' => $transfer->status ?? 'pending',
        ]);

        Log::info('Stripe Transfer created', [
            'order_id' => $order->id,
            'transfer_id' => $transfer->id,
            'amount_cents' => $amountCents,
            'destination' => $connectedAccountId,
            'transfer_group' => $transferGroup,
        ]);

        return $transfer;
    }

    /**
     * Create a login link for the Express Dashboard.
     * Producer can view their balance, payouts, and transaction history.
     */
    public function createLoginLink(string $accountId): string
    {
        $loginLink = $this->stripe->accounts->createLoginLink($accountId);

        return $loginLink->url;
    }

    /**
     * Sync producer's Stripe Connect status from account data.
     * Called from the account.updated webhook.
     */
    public function syncProducerStatus(Producer $producer, array $accountData): void
    {
        $chargesEnabled = $accountData['charges_enabled'] ?? false;
        $payoutsEnabled = $accountData['payouts_enabled'] ?? false;
        $detailsSubmitted = $accountData['details_submitted'] ?? false;

        // Determine status
        $status = 'pending';
        if ($chargesEnabled && $payoutsEnabled) {
            $status = 'active';
        } elseif ($detailsSubmitted) {
            $status = 'restricted';
        }

        $producer->update([
            'stripe_connect_status' => $status,
            'stripe_charges_enabled' => $chargesEnabled,
            'stripe_payouts_enabled' => $payoutsEnabled,
        ]);

        Log::info('Stripe Connect status synced', [
            'producer_id' => $producer->id,
            'status' => $status,
            'charges_enabled' => $chargesEnabled,
            'payouts_enabled' => $payoutsEnabled,
        ]);
    }

    /**
     * Check if a producer is fully connected and can receive transfers.
     */
    public function isProducerConnected(Producer $producer): bool
    {
        return self::isEnabled()
            && !empty($producer->stripe_connect_id)
            && $producer->stripe_charges_enabled;
    }
}
