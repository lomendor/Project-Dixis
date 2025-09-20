<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Services\ProducerAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProducerAnalyticsController extends Controller
{
    public function __construct(
        private ProducerAnalyticsService $producerAnalyticsService
    ) {}

    /**
     * Get sales analytics for the authenticated producer
     */
    public function sales(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'string|in:daily,monthly',
            'limit' => 'integer|min:1|max:365',
        ]);

        // Get producer ID from authenticated user
        $user = $request->user();
        if (! $user->producer) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with a producer',
            ], 403);
        }

        $period = $request->input('period', 'daily');
        $limit = $request->input('limit', 30);

        try {
            $analytics = $this->producerAnalyticsService->getProducerSalesAnalytics(
                $user->producer->id,
                $period,
                $limit
            );

            return response()->json([
                'success' => true,
                'analytics' => $analytics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve sales analytics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get orders analytics for the authenticated producer
     */
    public function orders(Request $request): JsonResponse
    {
        // Get producer ID from authenticated user
        $user = $request->user();
        if (! $user->producer) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with a producer',
            ], 403);
        }

        try {
            $analytics = $this->producerAnalyticsService->getProducerOrdersAnalytics($user->producer->id);

            return response()->json([
                'success' => true,
                'analytics' => $analytics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders analytics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get products analytics for the authenticated producer
     */
    public function products(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'integer|min:1|max:50',
        ]);

        // Get producer ID from authenticated user
        $user = $request->user();
        if (! $user->producer) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with a producer',
            ], 403);
        }

        $limit = $request->input('limit', 10);

        try {
            $analytics = $this->producerAnalyticsService->getProducerProductsAnalytics(
                $user->producer->id,
                $limit
            );

            return response()->json([
                'success' => true,
                'analytics' => $analytics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products analytics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
