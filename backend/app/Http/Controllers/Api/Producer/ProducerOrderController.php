<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProducerOrderController extends Controller
{
    /**
     * Valid order status transitions
     */
    private array $validTransitions = [
        'pending' => ['processing'],
        'confirmed' => ['processing'],
        'processing' => ['shipped'],
        'shipped' => ['delivered'],
        'delivered' => [], // terminal state
    ];

    /**
     * List all orders containing the producer's products.
     * Supports filtering by status.
     *
     * GET /api/v1/producer/orders?status=pending
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'nullable|string|in:pending,confirmed,processing,shipped,delivered',
        ]);

        // Get producer ID from authenticated user
        $user = $request->user();
        if (!$user || !$user->producer) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with a producer',
            ], 403);
        }

        $producerId = $user->producer->id;

        // Build query with producer scoping
        $query = Order::forProducer($producerId)
            ->with(['user', 'orderItems' => function ($q) use ($producerId) {
                // Only load order items for this producer
                $q->where('producer_id', $producerId);
            }])
            ->orderBy('created_at', 'desc');

        // Apply status filter if provided
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $orders = $query->get();

        // Calculate status counts for filters
        $statusCounts = Order::forProducer($producerId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'success' => true,
            'orders' => $orders,
            'meta' => [
                'total' => Order::forProducer($producerId)->count(),
                'pending' => $statusCounts['pending'] ?? 0,
                'confirmed' => $statusCounts['confirmed'] ?? 0,
                'processing' => $statusCounts['processing'] ?? 0,
                'shipped' => $statusCounts['shipped'] ?? 0,
                'delivered' => $statusCounts['delivered'] ?? 0,
            ],
        ]);
    }

    /**
     * Get a single order's details (scoped to producer).
     *
     * GET /api/v1/producer/orders/{id}
     */
    public function show(Request $request, $id): JsonResponse
    {
        // Get producer ID from authenticated user
        $user = $request->user();
        if (!$user || !$user->producer) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with a producer',
            ], 403);
        }

        $producerId = $user->producer->id;

        // Find order scoped to producer
        $order = Order::forProducer($producerId)
            ->with(['user', 'orderItems' => function ($q) use ($producerId) {
                $q->where('producer_id', $producerId);
            }])
            ->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or does not contain your products',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }

    /**
     * Update an order's status with transition validation.
     *
     * PATCH /api/v1/producer/orders/{id}/status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:processing,shipped,delivered',
        ]);

        // Get producer ID from authenticated user
        $user = $request->user();
        if (!$user || !$user->producer) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with a producer',
            ], 403);
        }

        $producerId = $user->producer->id;

        // Find order scoped to producer
        $order = Order::forProducer($producerId)->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or does not contain your products',
            ], 404);
        }

        $newStatus = $request->input('status');
        $currentStatus = $order->status;

        // Validate status transition
        if (!$this->validateTransition($currentStatus, $newStatus)) {
            return response()->json([
                'success' => false,
                'message' => "Invalid status transition from '{$currentStatus}' to '{$newStatus}'",
                'valid_transitions' => $this->validTransitions[$currentStatus] ?? [],
            ], 422);
        }

        // Update order status
        $order->status = $newStatus;
        $order->save();

        // Load relationships for response
        $order->load(['user', 'orderItems' => function ($q) use ($producerId) {
            $q->where('producer_id', $producerId);
        }]);

        return response()->json([
            'success' => true,
            'message' => "Order status updated to '{$newStatus}'",
            'order' => $order,
        ]);
    }

    /**
     * Export producer orders to CSV.
     *
     * GET /api/v1/producer/orders/export
     */
    public function export(Request $request): StreamedResponse
    {
        // Get producer ID from authenticated user
        $user = $request->user();
        if (!$user || !$user->producer) {
            abort(403, 'User is not associated with a producer');
        }

        $producerId = $user->producer->id;

        // Fetch orders for the last 30 days by default
        $orders = Order::forProducer($producerId)
            ->with(['user', 'orderItems' => function ($q) use ($producerId) {
                $q->where('producer_id', $producerId);
            }])
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'orders-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");

            // Header row
            fputcsv($file, [
                'order_id',
                'created_at',
                'status',
                'customer_name',
                'customer_email',
                'items_summary',
                'subtotal',
                'shipping',
                'total',
                'payment_method',
                'shipping_method',
            ]);

            // Data rows
            foreach ($orders as $order) {
                // Build items summary (producer's items only)
                $itemsSummary = $order->orderItems->map(function ($item) {
                    $name = $item->product_name ?? 'Unknown';
                    $qty = $item->quantity ?? 0;
                    return "{$name} x{$qty}";
                })->implode('; ');

                // Calculate producer's subtotal from their items
                $producerSubtotal = $order->orderItems->sum(function ($item) {
                    return floatval($item->total_price ?? 0);
                });

                fputcsv($file, [
                    $order->id,
                    $order->created_at->format('Y-m-d H:i'),
                    $order->status ?? 'unknown',
                    $order->user->name ?? '',
                    $order->user->email ?? '',
                    $itemsSummary,
                    number_format($producerSubtotal, 2, '.', ''),
                    number_format(floatval($order->shipping_cost ?? 0), 2, '.', ''),
                    number_format(floatval($order->total ?? 0), 2, '.', ''),
                    $order->payment_method ?? '',
                    $order->shipping_method ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Validate if a status transition is allowed.
     *
     * @param string $current
     * @param string $new
     * @return bool
     */
    private function validateTransition(string $current, string $new): bool
    {
        return in_array($new, $this->validTransitions[$current] ?? []);
    }
}
