<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    /**
     * Update order status (admin-only).
     *
     * Request body:
     * {
     *   "status": "confirmed|processing|shipped|delivered|cancelled",
     *   "note": "..." (optional)
     * }
     */
    public function updateStatus(Request $request, Order $order)
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
