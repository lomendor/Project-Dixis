<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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
     */
    private function handleCheckoutSessionCompleted($session): void
    {
        $orderId = $session->metadata->order_id ?? null;

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

        // Update order to paid
        $order->update([
            'payment_status' => 'paid',
            'payment_reference' => $session->id,
        ]);

        Log::info('Stripe checkout.session.completed order marked as paid', [
            'order_id' => $orderId,
            'session_id' => $session->id,
            'amount_total' => $session->amount_total,
        ]);
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
