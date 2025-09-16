<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Payment\PaymentProviderFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RefundController extends Controller
{
    /**
     * Create a new refund for an order.
     *
     * @param Request $request
     * @param int $orderId
     * @return JsonResponse
     */
    public function create(Request $request, int $orderId): JsonResponse
    {
        // Validate admin authorization (simplified for now)
        // In production, add proper admin middleware/policy

        $validator = Validator::make($request->all(), [
            'amount_cents' => 'nullable|integer|min:1',
            'reason' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'validation_failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $order = Order::findOrFail($orderId);

            $paymentProvider = PaymentProviderFactory::create();

            $result = $paymentProvider->refund(
                $order,
                $request->input('amount_cents'),
                $request->input('reason', 'requested_by_customer')
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Επιστροφή χρημάτων ξεκίνησε επιτυχώς',
                    'refund' => $result,
                ], 200);
            }

            return response()->json($result, 422);

        } catch (\Exception $e) {
            Log::error('Refund creation failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'refund_creation_failed',
                'message' => 'Αποτυχία δημιουργίας επιστροφής χρημάτων',
            ], 500);
        }
    }

    /**
     * Get refund status for an order.
     */
    public function show(int $orderId): JsonResponse
    {
        try {
            $order = Order::findOrFail($orderId);

            $refundInfo = [
                'order_id' => $order->id,
                'refund_id' => $order->refund_id,
                'refunded_amount_cents' => $order->refunded_amount_cents,
                'refunded_amount_euros' => $order->refunded_amount_cents ? $order->refunded_amount_cents / 100 : null,
                'refunded_at' => $order->refunded_at?->toISOString(),
                'is_refunded' => (bool) $order->refund_id,
                'total_amount_cents' => (int) round($order->total_amount * 100),
                'max_refundable_cents' => (int) round($order->total_amount * 100) - ($order->refunded_amount_cents ?? 0),
            ];

            return response()->json([
                'success' => true,
                'refund_info' => $refundInfo,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'refund_info_failed',
                'message' => 'Αποτυχία ανάκτησης πληροφοριών επιστροφής',
            ], 500);
        }
    }

    /**
     * List all orders eligible for refunds (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $orders = Order::where('payment_status', 'paid')
                ->with(['user', 'orderItems'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $ordersData = $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'user_email' => $order->user?->email,
                    'total_amount' => $order->total_amount,
                    'payment_status' => $order->payment_status,
                    'refund_id' => $order->refund_id,
                    'refunded_amount_cents' => $order->refunded_amount_cents,
                    'refunded_at' => $order->refunded_at?->toISOString(),
                    'is_refunded' => (bool) $order->refund_id,
                    'created_at' => $order->created_at->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'orders' => $ordersData,
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'total_pages' => $orders->lastPage(),
                    'total_orders' => $orders->total(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'orders_list_failed',
                'message' => 'Αποτυχία ανάκτησης λίστας παραγγελιών',
            ], 500);
        }
    }
}