<?php

namespace App\Contracts;

use App\Models\Order;

interface PaymentProviderInterface
{
    /**
     * Initialize a payment for the given order.
     *
     * @param  array  $options  Additional options (customer info, etc.)
     * @return array Payment initialization data (clientSecret, paymentId, etc.)
     */
    public function initPayment(Order $order, array $options = []): array;

    /**
     * Confirm a payment after user authorization.
     *
     * @param  array  $options  Additional confirmation data
     * @return array Payment confirmation result
     */
    public function confirmPayment(Order $order, string $paymentIntentId, array $options = []): array;

    /**
     * Cancel a payment if needed.
     *
     * @return array Cancellation result
     */
    public function cancelPayment(Order $order, string $paymentIntentId): array;

    /**
     * Get payment status from provider.
     *
     * @return array Payment status information
     */
    public function getPaymentStatus(string $paymentIntentId): array;

    /**
     * Handle webhook notifications from payment provider.
     *
     * @return array Processing result
     */
    public function handleWebhook(array $payload, string $signature = ''): array;

    /**
     * Process a refund for the given order.
     *
     * @param  int  $amountCents  Amount to refund in cents (null for full refund)
     * @param  string  $reason  Refund reason
     * @return array Refund result with refund_id
     */
    public function refund(Order $order, ?int $amountCents = null, string $reason = 'requested_by_customer'): array;
}
