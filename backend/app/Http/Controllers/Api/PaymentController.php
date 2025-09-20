<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Payment\PaymentProviderFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Initialize payment for an order.
     */
    public function initPayment(Request $request, Order $order): JsonResponse
    {
        // Ensure user can only initialize payment for their own orders
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Validate that order can have payment initialized
        if ($order->payment_status === 'paid') {
            return response()->json([
                'message' => 'Order has already been paid',
                'payment_status' => 'paid',
            ], 400);
        }

        if ($order->status === 'cancelled') {
            return response()->json([
                'message' => 'Cannot initialize payment for cancelled order',
                'status' => 'cancelled',
            ], 400);
        }

        $request->validate([
            'customer' => 'array|nullable',
            'customer.email' => 'email|nullable',
            'customer.firstName' => 'string|nullable',
            'customer.lastName' => 'string|nullable',
            'return_url' => 'url|nullable',
        ]);

        try {
            $paymentProvider = PaymentProviderFactory::create();
            $result = $paymentProvider->initPayment($order, [
                'customer' => $request->input('customer', []),
                'return_url' => $request->input('return_url'),
            ]);

            if (! $result['success']) {
                return response()->json([
                    'message' => 'Failed to initialize payment',
                    'error' => $result['error'] ?? 'unknown_error',
                    'error_message' => $result['error_message'] ?? 'Payment initialization failed',
                ], 400);
            }

            return response()->json([
                'message' => 'Payment initialized successfully',
                'payment' => [
                    'client_secret' => $result['client_secret'],
                    'payment_intent_id' => $result['payment_intent_id'],
                    'requires_action' => $result['requires_action'] ?? false,
                    'payment_method_types' => $result['payment_method_types'] ?? ['card'],
                    'amount' => $result['amount'],
                    'currency' => $result['currency'],
                    'status' => $result['status'] ?? 'requires_payment_method',
                ],
                'order' => [
                    'id' => $order->id,
                    'total_amount' => number_format($order->total_amount, 2),
                    'payment_status' => $order->fresh()->payment_status,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Payment initialization failed', [
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Payment initialization failed',
                'error' => 'internal_server_error',
            ], 500);
        }
    }

    /**
     * Confirm payment for an order.
     */
    public function confirmPayment(Request $request, Order $order): JsonResponse
    {
        // Ensure user can only confirm payment for their own orders
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $paymentProvider = PaymentProviderFactory::create();
            $result = $paymentProvider->confirmPayment($order, $request->payment_intent_id);

            if (! $result['success']) {
                if ($result['requires_action'] ?? false) {
                    return response()->json([
                        'message' => 'Payment requires additional action',
                        'requires_action' => true,
                        'client_secret' => $result['client_secret'],
                        'payment_intent_id' => $result['payment_intent_id'],
                    ]);
                }

                return response()->json([
                    'message' => 'Payment confirmation failed',
                    'error' => $result['error'] ?? 'unknown_error',
                    'error_message' => $result['error_message'] ?? 'Payment failed',
                    'payment_intent_id' => $result['payment_intent_id'],
                ], 400);
            }

            return response()->json([
                'message' => 'Payment confirmed successfully',
                'payment' => [
                    'payment_intent_id' => $result['payment_intent_id'],
                    'status' => $result['status'],
                    'amount_received' => $result['amount_received'],
                    'currency' => $result['currency'],
                    'paid_at' => $result['paid_at'],
                ],
                'order' => [
                    'id' => $order->id,
                    'payment_status' => $order->fresh()->payment_status,
                    'status' => $order->fresh()->status,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Payment confirmation failed', [
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'payment_intent_id' => $request->payment_intent_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Payment confirmation failed',
                'error' => 'internal_server_error',
            ], 500);
        }
    }

    /**
     * Cancel payment for an order.
     */
    public function cancelPayment(Request $request, Order $order): JsonResponse
    {
        // Ensure user can only cancel payment for their own orders
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if (! $order->payment_intent_id) {
            return response()->json([
                'message' => 'No payment to cancel for this order',
            ], 400);
        }

        try {
            $paymentProvider = PaymentProviderFactory::create();
            $result = $paymentProvider->cancelPayment($order, $order->payment_intent_id);

            if (! $result['success']) {
                return response()->json([
                    'message' => 'Payment cancellation failed',
                    'error' => $result['error'] ?? 'unknown_error',
                    'error_message' => $result['error_message'] ?? 'Cancellation failed',
                ], 400);
            }

            return response()->json([
                'message' => 'Payment cancelled successfully',
                'payment' => [
                    'payment_intent_id' => $result['payment_intent_id'],
                    'status' => $result['status'],
                    'canceled_at' => $result['canceled_at'],
                ],
                'order' => [
                    'id' => $order->id,
                    'payment_status' => $order->fresh()->payment_status,
                    'status' => $order->fresh()->status,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Payment cancellation failed', [
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Payment cancellation failed',
                'error' => 'internal_server_error',
            ], 500);
        }
    }

    /**
     * Get payment status for an order.
     */
    public function getPaymentStatus(Request $request, Order $order): JsonResponse
    {
        // Ensure user can only check payment status for their own orders
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if (! $order->payment_intent_id) {
            return response()->json([
                'message' => 'No payment found for this order',
                'order' => [
                    'id' => $order->id,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                ],
            ]);
        }

        try {
            $paymentProvider = PaymentProviderFactory::create();
            $result = $paymentProvider->getPaymentStatus($order->payment_intent_id);

            if (! $result['success']) {
                return response()->json([
                    'message' => 'Failed to retrieve payment status',
                    'error' => $result['error'] ?? 'unknown_error',
                    'order' => [
                        'id' => $order->id,
                        'payment_status' => $order->payment_status,
                        'status' => $order->status,
                    ],
                ], 400);
            }

            return response()->json([
                'message' => 'Payment status retrieved successfully',
                'payment' => [
                    'payment_intent_id' => $result['payment_intent_id'],
                    'status' => $result['status'],
                    'amount_received' => $result['amount_received'] ?? null,
                    'currency' => $result['currency'] ?? null,
                    'last_payment_error' => $result['last_payment_error'] ?? null,
                ],
                'order' => [
                    'id' => $order->id,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status retrieval failed', [
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to retrieve payment status',
                'error' => 'internal_server_error',
            ], 500);
        }
    }

    /**
     * Get available payment methods.
     */
    public function getPaymentMethods(): JsonResponse
    {
        try {
            $activeProvider = PaymentProviderFactory::getActiveProvider();
            $availableProviders = PaymentProviderFactory::getAvailableProviders();
            $supportedMethods = PaymentProviderFactory::getSupportedPaymentMethods();

            return response()->json([
                'active_provider' => $activeProvider,
                'supported_payment_methods' => $supportedMethods,
                'available_providers' => $availableProviders,
                'stripe_public_key' => $activeProvider === 'stripe' ? config('services.stripe.public_key') : null,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get payment methods', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to retrieve payment methods',
                'error' => 'internal_server_error',
            ], 500);
        }
    }
}
