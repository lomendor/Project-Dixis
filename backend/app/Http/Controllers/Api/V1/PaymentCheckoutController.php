<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Pass 51: Payment Checkout Controller
 *
 * Handles card payment initiation via Stripe Checkout Sessions.
 * Order must exist first (created via COD flow), then payment is initiated.
 */
class PaymentCheckoutController extends Controller
{
    /**
     * Create a Stripe Checkout Session for an existing order.
     *
     * POST /api/v1/public/payments/checkout
     *
     * Request: { order_id: int }
     * Response: { redirect_url: string, session_id: string }
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        // Check if card payments are enabled
        if (!config('payments.card_enabled', false)) {
            return response()->json([
                'error' => 'Card payments are not enabled',
                'code' => 'PAYMENTS_DISABLED',
            ], 503);
        }

        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::findOrFail($request->order_id);

        // Verify order belongs to authenticated user
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'error' => 'Order not found',
                'code' => 'ORDER_NOT_FOUND',
            ], 404);
        }

        // Verify order is in correct state for payment
        if ($order->payment_status !== 'unpaid' && $order->payment_status !== 'pending') {
            return response()->json([
                'error' => 'Order is not eligible for payment',
                'code' => 'INVALID_ORDER_STATE',
                'current_status' => $order->payment_status,
            ], 422);
        }

        // Check for Stripe configuration
        $stripeSecretKey = config('payments.stripe.secret_key');
        if (empty($stripeSecretKey)) {
            Log::error('Stripe secret key not configured');
            return response()->json([
                'error' => 'Payment provider not configured',
                'code' => 'PROVIDER_NOT_CONFIGURED',
            ], 503);
        }

        try {
            \Stripe\Stripe::setApiKey($stripeSecretKey);

            // Create line items from order
            $lineItems = [];
            foreach ($order->orderItems as $item) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => $item->product_name ?? 'Προϊόν #' . $item->product_id,
                        ],
                        'unit_amount' => (int) ($item->unit_price * 100), // Convert to cents
                    ],
                    'quantity' => $item->quantity,
                ];
            }

            // Add shipping as a line item if > 0
            if ($order->shipping_cost > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => 'Έξοδα αποστολής',
                        ],
                        'unit_amount' => (int) ($order->shipping_cost * 100),
                    ],
                    'quantity' => 1,
                ];
            }

            $successUrl = config('payments.stripe.success_url', config('app.frontend_url') . '/thank-you') . '?id=' . $order->id . '&session_id={CHECKOUT_SESSION_ID}';
            $cancelUrl = config('payments.stripe.cancel_url', config('app.frontend_url') . '/checkout') . '?cancelled=true&order_id=' . $order->id;

            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'order_id' => $order->id,
                    'dixis_env' => config('app.env'),
                ],
                'customer_email' => $order->user->email ?? null,
            ]);

            // Update order with payment session info
            $order->update([
                'payment_method' => 'card',
                'payment_provider' => 'stripe',
                'payment_reference' => $session->id,
                'payment_status' => 'pending',
            ]);

            Log::info('Stripe checkout session created', [
                'order_id' => $order->id,
                'session_id' => $session->id,
            ]);

            return response()->json([
                'redirect_url' => $session->url,
                'session_id' => $session->id,
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe API error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Payment provider error',
                'code' => 'STRIPE_ERROR',
            ], 503);
        }
    }
}
