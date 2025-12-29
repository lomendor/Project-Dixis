<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    /**
     * List all orders with filters and pagination (admin-only).
     * Pass 61: Admin Dashboard Polish
     *
     * Query params:
     * - status: pending|confirmed|processing|shipped|delivered|cancelled
     * - q: search query (order ID, customer email, customer name)
     * - from_date: ISO date string
     * - to_date: ISO date string
     * - page: int (default 1)
     * - per_page: int (default 20, max 100)
     * - sort: created_at (asc) or -created_at (desc, default)
     */
    public function index(Request $request)
    {
        // Admin check
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'q' => ['nullable', 'string', 'max:100'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', '-created_at'])],
        ]);

        $query = Order::with(['user', 'orderItems']);

        // Status filter
        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        // Search (order ID, customer email/name)
        if (!empty($validated['q'])) {
            $search = $validated['q'];
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('email', 'like', "%{$search}%")
                         ->orWhere('name', 'like', "%{$search}%");
                  });
            });
        }

        // Date range
        if (!empty($validated['from_date'])) {
            $query->whereDate('created_at', '>=', $validated['from_date']);
        }
        if (!empty($validated['to_date'])) {
            $query->whereDate('created_at', '<=', $validated['to_date']);
        }

        // Sorting
        $sort = $validated['sort'] ?? '-created_at';
        $query->orderBy('created_at', $sort === 'created_at' ? 'asc' : 'desc');

        // Pagination
        $perPage = min($validated['per_page'] ?? 20, 100);
        $paginated = $query->paginate($perPage);

        // Quick stats (counts per status)
        $stats = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'success' => true,
            'orders' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Update order status (admin-only).
     *
     * Request body:
     * {
     *   "status": "confirmed|processing|shipped|delivered|cancelled",
     *   "note": "..." (optional)
     * }
     */
    public function updateStatus(Request $request, Order $order, OrderEmailService $emailService)
    {
        Gate::authorize('update', $order);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        // Validate status transitions
        if (!$this->isValidTransition($oldStatus, $newStatus)) {
            return response()->json([
                'error' => "Invalid status transition from {$oldStatus} to {$newStatus}",
            ], 422);
        }

        $order->update([
            'status' => $newStatus,
        ]);

        // Optional: Log the status change with note
        // (Could extend with order_status_history table in future)
        \Log::info("Order status updated", [
            'order_id' => $order->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'admin_id' => $request->user()->id,
            'note' => $validated['note'] ?? null,
        ]);

        // Pass 54: Send status update email notification
        try {
            $emailService->sendOrderStatusNotification($order->fresh()->load('user'), $newStatus);
        } catch (\Exception $e) {
            \Log::error('Pass 54: Status email notification failed (status still updated)', [
                'order_id' => $order->id,
                'status' => $newStatus,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->fresh()->load(['orderItems.product', 'user']),
        ]);
    }

    /**
     * Validate status transitions.
     * Allows logical order state flow.
     */
    private function isValidTransition(string $from, string $to): bool
    {
        $allowedTransitions = [
            'pending' => ['confirmed', 'processing', 'cancelled'],
            'confirmed' => ['processing', 'shipped', 'cancelled'],
            'processing' => ['shipped', 'cancelled'],
            'shipped' => ['delivered'],
            'delivered' => [], // Final state (no transitions)
            'cancelled' => [], // Final state (no transitions)
        ];

        return in_array($to, $allowedTransitions[$from] ?? []);
    }
}
