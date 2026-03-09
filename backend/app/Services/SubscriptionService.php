<?php

namespace App\Services;

use App\Models\Business;
use App\Models\DixisSetting;
use App\Models\Subscription;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

/**
 * B2B PIVOT: Business subscription lifecycle.
 * Active sub → 0% commission. No sub → 7% commission.
 */
class SubscriptionService
{
    private const DEFAULT_PRICE_CENTS = 12000; // €120/year

    public function getPriceCents(): int
    {
        $setting = DixisSetting::where('key', 'subscription.price_cents')->first();
        return $setting ? (int) $setting->value : self::DEFAULT_PRICE_CENTS;
    }

    public function hasActiveSubscription(Business $business): bool
    {
        return $business->subscriptions()->active()->exists();
    }

    /** @return array{checkout_url: string, subscription_id: int} */
    public function createCheckout(Business $business): array
    {
        Stripe::setApiKey(config('payments.stripe.secret_key'));
        $priceCents = $this->getPriceCents();

        $subscription = Subscription::create([
            'business_id' => $business->id,
            'status' => Subscription::STATUS_PENDING,
            'amount_cents' => $priceCents,
        ]);

        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'unit_amount' => $priceCents,
                    'product_data' => [
                        'name' => 'Dixis B2B Συνδρομή (Ετήσια)',
                        'description' => 'Ετήσια συνδρομή — 0% προμήθεια στις παραγγελίες B2B',
                    ],
                ],
                'quantity' => 1,
            ]],
            'metadata' => [
                'type' => 'b2b_subscription',
                'subscription_id' => $subscription->id,
                'business_id' => $business->id,
            ],
            'success_url' => config('app.frontend_url', 'https://dixis.gr') . '/business/subscription?status=success',
            'cancel_url' => config('app.frontend_url', 'https://dixis.gr') . '/business/subscription?status=cancelled',
        ]);

        $subscription->update(['stripe_checkout_session_id' => $session->id]);

        return ['checkout_url' => $session->url, 'subscription_id' => $subscription->id];
    }

    /** Activate subscription after Stripe payment. Idempotent. */
    public function activateFromWebhook(string $sessionId, ?string $paymentIntentId = null): void
    {
        $subscription = Subscription::where('stripe_checkout_session_id', $sessionId)->first();
        if (! $subscription || $subscription->status === Subscription::STATUS_ACTIVE) {
            return;
        }

        $now = now();
        $subscription->update([
            'status' => Subscription::STATUS_ACTIVE,
            'stripe_payment_intent_id' => $paymentIntentId,
            'starts_at' => $now,
            'expires_at' => $now->copy()->addYear(),
        ]);
    }
}
