<?php

namespace App\Services\Payment;

use App\Contracts\PaymentProviderInterface;
use App\Models\Order;
use Illuminate\Support\Str;

class FakePaymentProvider implements PaymentProviderInterface
{
    /**
     * Initialize a payment for the given order.
     * For fake provider, just return mock data.
     */
    public function initPayment(Order $order, array $options = []): array
    {
        $clientSecret = 'fake_pi_'.Str::random(24);
        $paymentIntentId = 'fake_pi_'.Str::random(12);

        // Store fake payment intent ID in order for tracking
        $order->update([
            'payment_intent_id' => $paymentIntentId,
            'payment_method' => $options['payment_method'] ?? 'fake_card',
        ]);

        return [
            'success' => true,
            'client_secret' => $clientSecret,
            'payment_intent_id' => $paymentIntentId,
            'requires_action' => false,
            'payment_method_types' => ['card'],
            'amount' => (int) ($order->total_amount * 100), // Convert to cents
            'currency' => 'eur',
        ];
    }

    /**
     * Confirm a payment after user authorization.
     * For fake provider, simulate success based on payment intent ID.
     */
    public function confirmPayment(Order $order, string $paymentIntentId, array $options = []): array
    {
        // Simulate different outcomes based on payment intent ID
        if (str_contains($paymentIntentId, 'fail')) {
            return [
                'success' => false,
                'error' => 'card_declined',
                'error_message' => 'Your card was declined.',
                'payment_intent_id' => $paymentIntentId,
            ];
        }

        if (str_contains($paymentIntentId, 'auth')) {
            return [
                'success' => false,
                'requires_action' => true,
                'client_secret' => 'fake_pi_'.Str::random(24),
                'payment_intent_id' => $paymentIntentId,
            ];
        }

        // Default to success
        $order->update([
            'payment_status' => 'paid',
            'status' => 'paid',
        ]);

        return [
            'success' => true,
            'payment_intent_id' => $paymentIntentId,
            'status' => 'succeeded',
            'amount_received' => (int) ($order->total_amount * 100),
            'currency' => 'eur',
            'paid_at' => now()->toISOString(),
        ];
    }

    /**
     * Cancel a payment if needed.
     */
    public function cancelPayment(Order $order, string $paymentIntentId): array
    {
        $order->update([
            'payment_status' => 'cancelled',
            'status' => 'cancelled',
        ]);

        return [
            'success' => true,
            'payment_intent_id' => $paymentIntentId,
            'status' => 'canceled',
            'canceled_at' => now()->toISOString(),
        ];
    }

    /**
     * Get payment status from provider.
     */
    public function getPaymentStatus(string $paymentIntentId): array
    {
        // Simulate status based on payment intent ID pattern
        if (str_contains($paymentIntentId, 'fail')) {
            return [
                'success' => true,
                'payment_intent_id' => $paymentIntentId,
                'status' => 'failed',
                'last_payment_error' => [
                    'code' => 'card_declined',
                    'message' => 'Your card was declined.',
                ],
            ];
        }

        if (str_contains($paymentIntentId, 'processing')) {
            return [
                'success' => true,
                'payment_intent_id' => $paymentIntentId,
                'status' => 'processing',
            ];
        }

        return [
            'success' => true,
            'payment_intent_id' => $paymentIntentId,
            'status' => 'succeeded',
            'amount_received' => 4550, // Mock amount in cents
            'currency' => 'eur',
        ];
    }

    /**
     * Process a refund for the given order.
     * For fake provider, simulate refund success.
     */
    public function refund(Order $order, ?int $amountCents = null, string $reason = 'requested_by_customer'): array
    {
        if (! $order->payment_intent_id) {
            return [
                'success' => false,
                'error' => 'no_payment_intent',
                'error_message' => 'Δεν βρέθηκε payment intent για αυτή την παραγγελία',
            ];
        }

        if ($order->payment_status !== 'paid') {
            return [
                'success' => false,
                'error' => 'order_not_paid',
                'error_message' => 'Η παραγγελία δεν έχει πληρωθεί ακόμη',
            ];
        }

        // Calculate refund amount (full refund if not specified)
        $refundAmount = $amountCents ?? (int) round($order->total_amount * 100);

        // Validate refund amount doesn't exceed paid amount
        $maxRefundable = (int) round($order->total_amount * 100) - ($order->refunded_amount_cents ?? 0);
        if ($refundAmount > $maxRefundable) {
            return [
                'success' => false,
                'error' => 'amount_exceeds_refundable',
                'error_message' => 'Το ποσό επιστροφής υπερβαίνει το διαθέσιμο ποσό',
                'max_refundable_cents' => $maxRefundable,
            ];
        }

        $fakeRefundId = 'fake_re_'.Str::random(12);

        // Update order with fake refund info
        $currentRefunded = $order->refunded_amount_cents ?? 0;
        $order->update([
            'refund_id' => $fakeRefundId,
            'refunded_amount_cents' => $currentRefunded + $refundAmount,
            'refunded_at' => now(),
        ]);

        return [
            'success' => true,
            'refund_id' => $fakeRefundId,
            'amount_cents' => $refundAmount,
            'amount_euros' => $refundAmount / 100,
            'currency' => 'eur',
            'status' => 'succeeded',
            'reason' => $reason,
            'created_at' => now()->toISOString(),
        ];
    }

    /**
     * Handle webhook notifications from payment provider.
     * For fake provider, just return success.
     */
    public function handleWebhook(array $payload, string $signature = ''): array
    {
        return [
            'success' => true,
            'event_type' => $payload['type'] ?? 'payment_intent.succeeded',
            'processed' => true,
            'message' => 'Fake webhook processed successfully',
        ];
    }
}
