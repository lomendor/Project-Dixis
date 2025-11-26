<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProducerOrderController extends Controller
{
    /**
     * Valid order status transitions
     */
    private array $validTransitions = [
        'pending' => ['processing'],
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
            'status' => 'nullable|string|in:pending,processing,shipped,delivered',
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
