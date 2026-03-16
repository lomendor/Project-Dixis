<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutSession;
use App\Models\Commission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderEmailService;
use App\Services\Payment\StripeConnectService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Pass 51: Stripe Webhook Controller
 *
 * Handles Stripe webhook events for payment status updates.
 * Validates webhook signature and updates order payment_status.
 *
 * IDEMPOTENT: Same webhook can be received multiple times safely.
 */
class StripeWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhook.
     *
     * POST /api/v1/webhooks/stripe
     */
    public function handle(Request $request): Response
    {
        $webhookSecret = config('payments.stripe.webhook_secret');

        // If no webhook secret configured, reject all webhooks
        if (empty($webhookSecret)) {
            Log::warning('Stripe webhook received but no webhook secret configured');
            return response('Webhook secret not configured', 503);
        }

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        if (empty($sigHeader)) {
            Log::warning('Stripe webhook missing signature header');
            return response('Missing signature', 400);
        }

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );
        } catch (\UnexpectedValueException $e) {
            Log::warning('Stripe webhook invalid payload', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        Log::info('Stripe webhook received', [
            'type' => $event->type,
            'id' => $event->id,
        ]);

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'checkout.session.expired':
                $this->handleCheckoutSessionExpired($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;

            default:
                Log::info('Stripe webhook unhandled event type', ['type' => $event->type]);
        }

        return response('OK', 200);
    }

    /**
     * Handle successful checkout session completion.
     * IDEMPOTENT: If order already paid, does nothing.
     *
     * Pass MP-PAYMENT-EMAIL-TRUTH-01: Handle both single orders and multi-producer checkout sessions.
     */
    private function handleCheckoutSessionCompleted($session): void
    {
        // B2B PIVOT: Handle subscription payments (metadata.type = 'b2b_subscription')
        $type = $session->metadata->type ?? null;
        if ($type === 'b2b_subscription') {
            $this->handleSubscriptionPayment($session);
            return;
        }

        $orderId = $session->metadata->order_id ?? null;
        $checkoutSessionId = $session->metadata->checkout_session_id ?? null;

        // Multi-producer: Handle via CheckoutSession
        if ($checkoutSessionId) {
            $this->handleMultiProducerPaymentSuccess($checkoutSessionId, $session);
            return;
        }

        // Single-producer: Handle via Order
        if (!$orderId) {
            Log::warning('Stripe checkout.session.completed missing order_id in metadata', [
                'session_id' => $session->id,
            ]);
            return;
        }

        $order = Order::find($orderId);

        if (!$order) {
            Log::warning('Stripe checkout.session.completed order not found', [
                'order_id' => $orderId,
                'session_id' => $session->id,
            ]);
            return;
        }

        // IDEMPOTENT: Skip if already paid
        if ($order->payment_status === 'paid') {
            Log::info('Stripe checkout.session.completed order already paid (idempotent)', [
                'order_id' => $orderId,
            ]);
            return;
        }

        // Multi-producer fallback: if this is a child order, update ALL siblings
        if ($order->is_child_order && $order->checkout_session_id) {
            $this->handleMultiProducerPaymentSuccess($order->checkout_session_id, $session);
            return;
        }

        // Single order: update to paid + confirmed
        $order->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'payment_reference' => $session->id,
        ]);

        Log::info('Stripe checkout.session.completed order marked as paid+confirmed', [
            'order_id' => $orderId,
            'session_id' => $session->id,
            'amount_total' => $session->amount_total,
        ]);

        // Pass STRIPE-CONNECT-01: Create transfer to producer's connected account
        $this->createTransfersForOrders([$order], 'order_' . $order->id);

        // Pass MP-PAYMENT-EMAIL-TRUTH-01: Send email after payment success
        $this->sendPaymentConfirmationEmails([$order]);
    }

    /**
     * Handle multi-producer payment success.
     * Updates CheckoutSession and all child orders, then sends emails.
     *
     * Pass MP-PAYMENT-EMAIL-TRUTH-01: Ensures emails only sent after payment confirmation.
     * Pass CHECKOUT-TOKEN-FIX-01: Wrapped in DB::transaction to prevent partial paid state.
     */
    private function handleMultiProducerPaymentSuccess(int $checkoutSessionId, $stripeSession): void
    {
        $checkoutSession = CheckoutSession::with('orders')->find($checkoutSessionId);

        if (!$checkoutSession) {
            Log::warning('Stripe webhook: CheckoutSession not found', [
                'checkout_session_id' => $checkoutSessionId,
                'stripe_session_id' => $stripeSession->id,
            ]);
            return;
        }

        // IDEMPOTENT: Skip if already paid
        if ($checkoutSession->status === CheckoutSession::STATUS_PAID) {
            Log::info('Stripe webhook: CheckoutSession already paid (idempotent)', [
                'checkout_session_id' => $checkoutSessionId,
            ]);
            return;
        }

        // Atomic: update session + all child orders in a single transaction
        DB::transaction(function () use ($checkoutSession, $stripeSession) {
            // Update CheckoutSession status
            $checkoutSession->update([
                'status' => CheckoutSession::STATUS_PAID,
                'stripe_payment_intent_id' => $stripeSession->payment_intent ?? $stripeSession->id,
            ]);

            // Update all child orders to paid + confirmed
            foreach ($checkoutSession->orders as $order) {
                if ($order->payment_status !== 'paid') {
                    $order->update([
                        'payment_status' => 'paid',
                        'status' => 'confirmed',
                        'payment_reference' => $stripeSession->id,
                    ]);
                }
            }
        });

        $orders = $checkoutSession->orders;

        Log::info('Stripe webhook: Multi-producer checkout marked as paid', [
            'checkout_session_id' => $checkoutSessionId,
            'order_count' => $orders->count(),
            'stripe_session_id' => $stripeSession->id,
            'amount_total' => $stripeSession->amount_total,
        ]);

        // Pass STRIPE-CONNECT-01: Create transfers to each producer's connected account
        $this->createTransfersForOrders($orders->all(), 'checkout_' . $checkoutSessionId);

        // Send emails for all orders (outside transaction — email failure shouldn't roll back payment)
        $this->sendPaymentConfirmationEmails($orders->all());
    }

    /**
     * Create Stripe Connect transfers for orders after payment.
     *
     * Pass STRIPE-CONNECT-01: For each order, find the producer, check if they have
     * an active Connect account, calculate transfer amount (total - commission),
     * and create a Transfer. Skips if Connect is disabled or producer not connected.
     */
    private function createTransfersForOrders(array $orders, string $transferGroup): void
    {
        if (!StripeConnectService::isEnabled()) {
            return;
        }

        $connectService = app(StripeConnectService::class);

        foreach ($orders as $order) {
            try {
                // S0-09: Skip transfer for Direct Charge orders (funds already on producer's account)
                if ($order->payment_intent_id) {
                    try {
                        $stripe = new \Stripe\StripeClient(config('payments.stripe.secret_key'));
                        $pi = $stripe->paymentIntents->retrieve($order->payment_intent_id);
                        if (!empty($pi->metadata['charge_model']) && $pi->metadata['charge_model'] === 'direct') {
                            Log::info('S0-09: Skipping transfer for Direct Charge order', [
                                'order_id' => $order->id,
                            ]);
                            continue;
                        }
                    } catch (\Exception $e) {
                        // If we can't retrieve the PI, fall through to SCT logic
                    }
                }

                // Skip if transfer already created (idempotent)
                if (!empty($order->stripe_transfer_id)) {
                    continue;
                }

                // Find producer from order items
                $producerId = OrderItem::where('order_id', $order->id)
                    ->whereNotNull('producer_id')
                    ->value('producer_id');

                if (!$producerId) {
                    continue;
                }

                $producer = \App\Models\Producer::find($producerId);
                if (!$producer || !$connectService->isProducerConnected($producer)) {
                    Log::info('Stripe Connect: skipping transfer (producer not connected)', [
                        'order_id' => $order->id,
                        'producer_id' => $producerId,
                    ]);
                    continue;
                }

                // Calculate transfer amount: order total minus commission
                $orderTotalCents = (int) round((float) $order->total * 100);
                $commission = Commission::where('order_id', $order->id)->first();
                $commissionCents = $commission
                    ? (int) round((float) $commission->platform_fee * 100)
                    : 0;
                $transferAmountCents = $orderTotalCents - $commissionCents;

                if ($transferAmountCents <= 0) {
                    Log::warning('Stripe Connect: transfer amount is zero or negative', [
                        'order_id' => $order->id,
                        'order_total_cents' => $orderTotalCents,
                        'commission_cents' => $commissionCents,
                    ]);
                    continue;
                }

                $connectService->createTransfer(
                    $order,
                    $transferAmountCents,
                    $producer->stripe_connect_id,
                    $transferGroup
                );
            } catch (\Exception $e) {
                // Log but don't fail — payment was already successful
                Log::error('Stripe Connect transfer failed', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Send payment confirmation emails for orders.
     *
     * Pass MP-PAYMENT-EMAIL-TRUTH-01: Centralized email sending after payment confirmation.
     */
    private function sendPaymentConfirmationEmails(array $orders): void
    {
        try {
            $emailService = app(OrderEmailService::class);

            foreach ($orders as $order) {
                $emailService->sendOrderPlacedNotifications($order->fresh());
            }

            Log::info('Payment confirmation emails sent', [
                'order_count' => count($orders),
                'order_ids' => array_map(fn ($o) => $o->id, $orders),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send payment confirmation emails', [
                'order_count' => count($orders),
                'error' => $e->getMessage(),
            ]);
            // Don't fail the webhook - payment was successful
        }
    }

    /**
     * B2B PIVOT: Handle subscription payment via Stripe Checkout.
     * IDEMPOTENT: SubscriptionService skips if already active.
     */
    private function handleSubscriptionPayment($session): void
    {
        $paymentIntentId = $session->payment_intent ?? null;

        try {
            app(SubscriptionService::class)->activateFromWebhook(
                $session->id,
                $paymentIntentId
            );

            Log::info('B2B subscription activated via webhook', [
                'stripe_session_id' => $session->id,
                'business_id' => $session->metadata->business_id ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('B2B subscription activation failed', [
                'stripe_session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle expired checkout session.
     * IDEMPOTENT: If order already processed, does nothing.
     */
    private function handleCheckoutSessionExpired($session): void
    {
        $orderId = $session->metadata->order_id ?? null;

        if (!$orderId) {
            return;
        }

        $order = Order::find($orderId);

        if (!$order) {
            return;
        }

        // Only update if still pending
        if ($order->payment_status === 'pending') {
            $order->update([
                'payment_status' => 'failed',
            ]);

            Log::info('Stripe checkout.session.expired order marked as failed', [
                'order_id' => $orderId,
            ]);
        }
    }

    /**
     * Handle payment failure.
     * IDEMPOTENT: Only updates if not already in terminal state.
     */
    private function handlePaymentFailed($paymentIntent): void
    {
        // Payment intent doesn't have order_id directly, need to look up by payment_reference
        $order = Order::where('payment_reference', $paymentIntent->id)
            ->orWhere('payment_intent_id', $paymentIntent->id)
            ->first();

        if (!$order) {
            Log::info('Stripe payment_intent.payment_failed no matching order', [
                'payment_intent_id' => $paymentIntent->id,
            ]);
            return;
        }

        // Only update if still pending
        if ($order->payment_status === 'pending') {
            $order->update([
                'payment_status' => 'failed',
            ]);

            Log::info('Stripe payment_intent.payment_failed order marked as failed', [
                'order_id' => $order->id,
            ]);
        }
    }
}
