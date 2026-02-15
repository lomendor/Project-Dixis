<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * GET /v1/public/products/{productId}/reviews
     * Public: list approved reviews for a product
     */
    public function index(int $productId)
    {
        $product = Product::findOrFail($productId);

        $reviews = Review::where('product_id', $product->id)
            ->approved()
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->paginate(20);

        // Aggregate stats
        $stats = Review::where('product_id', $product->id)
            ->approved()
            ->selectRaw('COUNT(*) as count, AVG(rating) as avg_rating')
            ->first();

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'total' => (int) $stats->count,
                'avg_rating' => $stats->avg_rating ? round((float) $stats->avg_rating, 1) : null,
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
            ],
        ]);
    }

    /**
     * POST /v1/products/{productId}/reviews
     * Auth: create a review (one per user per product)
     */
    public function store(Request $request, int $productId)
    {
        $user = $request->user();
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:150',
            'comment' => 'nullable|string|max:2000',
            'order_id' => 'nullable|integer|exists:orders,id',
        ]);

        // Check if user already reviewed this product
        $existing = Review::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already reviewed this product.',
            ], 422);
        }

        // Check verified purchase: user has a completed order with this product
        $isVerified = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.user_id', $user->id)
            ->where('order_items.product_id', $product->id)
            ->whereIn('orders.status', ['completed', 'delivered'])
            ->exists();

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $validated['order_id'] ?? null,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'] ?? null,
            'is_verified_purchase' => $isVerified,
            'is_approved' => true, // Auto-approve for V1; admin moderation can come later
        ]);

        $review->load('user:id,name');

        return response()->json([
            'data' => new ReviewResource($review),
            'message' => 'Review submitted successfully.',
        ], 201);
    }

    /**
     * GET /v1/public/products/{productId}/reviews/summary
     * Public: quick summary (count + avg) without loading full reviews
     */
    public function summary(int $productId)
    {
        $product = Product::findOrFail($productId);

        $stats = Review::where('product_id', $product->id)
            ->approved()
            ->selectRaw('COUNT(*) as count, AVG(rating) as avg_rating')
            ->first();

        // Rating distribution
        $distribution = Review::where('product_id', $product->id)
            ->approved()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        return response()->json([
            'data' => [
                'total' => (int) $stats->count,
                'avg_rating' => $stats->avg_rating ? round((float) $stats->avg_rating, 1) : null,
                'distribution' => [
                    5 => $distribution[5] ?? 0,
                    4 => $distribution[4] ?? 0,
                    3 => $distribution[3] ?? 0,
                    2 => $distribution[2] ?? 0,
                    1 => $distribution[1] ?? 0,
                ],
            ],
        ]);
    }
}
