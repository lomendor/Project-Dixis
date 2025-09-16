<?php

namespace App\Services\Payment;

use App\Contracts\PaymentProviderInterface;
use App\Models\Order;
use Stripe\StripeClient;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use Illuminate\Support\Facades\Log;

class StripePaymentProvider implements PaymentProviderInterface
{
    private StripeClient $stripe;
    private string $webhookSecret;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret_key'));
        $this->webhookSecret = config('services.stripe.webhook_secret');
    }

    /**
     * Initialize a payment for the given order.
     */
    public function initPayment(Order $order, array $options = []): array
    {
        try {
            $customerData = $options['customer'] ?? [];

            // Create or retrieve Stripe customer
            $customer = null;
            if (!empty($customerData['email'])) {
                $customer = $this->stripe->customers->create([
                    'email' => $customerData['email'],
                    'name' => ($customerData['firstName'] ?? '') . ' ' . ($customerData['lastName'] ?? ''),
                    'metadata' => [
                        'order_id' => $order->id,
                        'user_id' => $order->user_id,
                    ],
                ]);
            }

            // Create payment intent
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => (int) round($order->total_amount * 100), // Convert to cents
                'currency' => 'eur',
                'customer' => $customer?->id,
                'description' => "Order #{$order->id} - Project Dixis",
                'metadata' => [
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            // Store payment intent ID in order
            $order->update([
                'payment_intent_id' => $paymentIntent->id,
                'payment_method' => 'stripe',
            ]);

            return [
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'requires_action' => $paymentIntent->status === 'requires_action',
                'payment_method_types' => $paymentIntent->payment_method_types,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'status' => $paymentIntent->status,
            ];

        } catch (\Exception $e) {
            Log::error('Stripe payment initialization failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'payment_init_failed',
                'error_message' => 'Failed to initialize payment. Please try again.',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ];
        }
    }

    /**
     * Confirm a payment after user authorization.
     */
    public function confirmPayment(Order $order, string $paymentIntentId, array $options = []): array
    {
        try {
            // Retrieve payment intent to check status
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            if ($paymentIntent->status === 'succeeded') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'paid',
                ]);

                return [
                    'success' => true,
                    'payment_intent_id' => $paymentIntentId,
                    'status' => 'succeeded',
                    'amount_received' => $paymentIntent->amount_received,
                    'currency' => $paymentIntent->currency,
                    'paid_at' => date('c', $paymentIntent->created),
                ];
            }

            if ($paymentIntent->status === 'requires_action') {
                return [
                    'success' => false,
                    'requires_action' => true,
                    'client_secret' => $paymentIntent->client_secret,
                    'payment_intent_id' => $paymentIntentId,
                ];
            }

            if ($paymentIntent->status === 'requires_payment_method') {
                return [
                    'success' => false,
                    'error' => 'payment_failed',
                    'error_message' => $paymentIntent->last_payment_error?->message ?? 'Payment failed',
                    'payment_intent_id' => $paymentIntentId,
                ];
            }

            return [
                'success' => false,
                'error' => 'payment_processing',
                'error_message' => 'Payment is still processing',
                'payment_intent_id' => $paymentIntentId,
                'status' => $paymentIntent->status,
            ];

        } catch (\Exception $e) {
            Log::error('Stripe payment confirmation failed', [
                'order_id' => $order->id,
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'payment_confirmation_failed',
                'error_message' => 'Failed to confirm payment. Please try again.',
                'payment_intent_id' => $paymentIntentId,
            ];
        }
    }

    /**
     * Cancel a payment if needed.
     */
    public function cancelPayment(Order $order, string $paymentIntentId): array
    {
        try {
            $paymentIntent = $this->stripe->paymentIntents->cancel($paymentIntentId);

            $order->update([
                'payment_status' => 'cancelled',
                'status' => 'cancelled',
            ]);

            return [
                'success' => true,
                'payment_intent_id' => $paymentIntentId,
                'status' => 'canceled',
                'canceled_at' => date('c', $paymentIntent->canceled_at),
            ];

        } catch (\Exception $e) {
            Log::error('Stripe payment cancellation failed', [
                'order_id' => $order->id,
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'cancellation_failed',
                'error_message' => 'Failed to cancel payment.',
                'payment_intent_id' => $paymentIntentId,
            ];
        }
    }

    /**
     * Get payment status from provider.
     */
    public function getPaymentStatus(string $paymentIntentId): array
    {
        try {
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            return [
                'success' => true,
                'payment_intent_id' => $paymentIntentId,
                'status' => $paymentIntent->status,
                'amount_received' => $paymentIntent->amount_received,
                'currency' => $paymentIntent->currency,
                'last_payment_error' => $paymentIntent->last_payment_error,
                'created' => $paymentIntent->created,
            ];

        } catch (\Exception $e) {
            Log::error('Stripe payment status retrieval failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'status_retrieval_failed',
                'error_message' => 'Failed to retrieve payment status.',
                'payment_intent_id' => $paymentIntentId,
            ];
        }
    }

    /**
     * Handle webhook notifications from Stripe.
     */
    public function handleWebhook(array $payload, string $signature = ''): array
    {
        try {
            // Verify webhook signature
            $event = Webhook::constructEvent(
                json_encode($payload),
                $signature,
                $this->webhookSecret
            );

            Log::info('Stripe webhook received', [
                'type' => $event->type,
                'id' => $event->id,
            ]);

            // Handle different event types
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    return $this->handlePaymentSucceeded($event->data->object);

                case 'payment_intent.payment_failed':
                    return $this->handlePaymentFailed($event->data->object);

                case 'payment_intent.canceled':
                    return $this->handlePaymentCanceled($event->data->object);

                default:
                    Log::info('Unhandled Stripe webhook event', ['type' => $event->type]);
                    return [
                        'success' => true,
                        'event_type' => $event->type,
                        'processed' => false,
                        'message' => 'Event type not handled',
                    ];
            }

        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'invalid_signature',
                'error_message' => 'Webhook signature verification failed',
            ];

        } catch (\Exception $e) {
            Log::error('Stripe webhook processing failed', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'webhook_processing_failed',
                'error_message' => 'Failed to process webhook',
            ];
        }
    }

    /**
     * Handle successful payment webhook.
     */
    private function handlePaymentSucceeded($paymentIntent): array
    {
        $orderId = $paymentIntent->metadata->order_id ?? null;

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order && $order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'paid',
                ]);

                Log::info('Order payment confirmed via webhook', ['order_id' => $orderId]);
            }
        }

        return [
            'success' => true,
            'event_type' => 'payment_intent.succeeded',
            'processed' => true,
            'order_id' => $orderId,
        ];
    }

    /**
     * Handle failed payment webhook.
     */
    private function handlePaymentFailed($paymentIntent): array
    {
        $orderId = $paymentIntent->metadata->order_id ?? null;

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'payment_status' => 'failed',
                    'status' => 'cancelled',
                ]);

                Log::info('Order payment failed via webhook', ['order_id' => $orderId]);
            }
        }

        return [
            'success' => true,
            'event_type' => 'payment_intent.payment_failed',
            'processed' => true,
            'order_id' => $orderId,
        ];
    }

    /**
     * Handle canceled payment webhook.
     */
    private function handlePaymentCanceled($paymentIntent): array
    {
        $orderId = $paymentIntent->metadata->order_id ?? null;

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'payment_status' => 'cancelled',
                    'status' => 'cancelled',
                ]);

                Log::info('Order payment canceled via webhook', ['order_id' => $orderId]);
            }
        }

        return [
            'success' => true,
            'event_type' => 'payment_intent.canceled',
            'processed' => true,
            'order_id' => $orderId,
        ];
    }
}