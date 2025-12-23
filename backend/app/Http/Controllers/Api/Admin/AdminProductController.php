<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AdminProductController extends Controller
{
    /**
     * List pending products for moderation.
     * Admin-only endpoint.
     */
    public function pending(Request $request)
    {
        Gate::authorize('moderate', Product::class);

        $products = Product::where('approval_status', 'pending')
            ->with(['producer', 'categories', 'images'])
            ->orderBy('created_at', 'asc')
            ->paginate($request->input('per_page', 10));

        return response()->json($products);
    }

    /**
     * Moderate a product (approve or reject).
     * Admin-only endpoint.
     *
     * Request body:
     * {
     *   "action": "approve|reject",
     *   "reason": "..." (required if action=reject)
     * }
     */
    public function moderate(Request $request, Product $product)
    {
        Gate::authorize('moderate', Product::class);

        $validated = $request->validate([
            'action' => ['required', Rule::in(['approve', 'reject'])],
            'reason' => ['required_if:action,reject', 'nullable', 'string', 'min:10'],
        ]);

        $action = $validated['action'];
        $reason = $validated['reason'] ?? null;

        if ($action === 'approve') {
            $product->update([
                'approval_status' => 'approved',
                'rejection_reason' => null,
                'moderated_by' => $request->user()->id,
                'moderated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Product approved successfully',
                'product' => $product->load(['producer', 'categories', 'images']),
            ]);
        }

        if ($action === 'reject') {
            $product->update([
                'approval_status' => 'rejected',
                'rejection_reason' => $reason,
                'moderated_by' => $request->user()->id,
                'moderated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Product rejected successfully',
                'product' => $product->load(['producer', 'categories', 'images']),
            ]);
        }

        return response()->json(['error' => 'Invalid action'], 400);
    }
}
