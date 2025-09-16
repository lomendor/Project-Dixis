<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analyticsService)
    {
    }

    /**
     * Get sales analytics data
     */
    public function sales(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'string|in:daily,monthly',
            'limit' => 'integer|min:1|max:365'
        ]);

        $period = $request->input('period', 'daily');
        $limit = $request->input('limit', 30);

        $analytics = $this->analyticsService->getSalesAnalytics($period, $limit);

        return response()->json([
            'success' => true,
            'analytics' => $analytics
        ]);
    }

    /**
     * Get orders analytics data
     */
    public function orders(): JsonResponse
    {
        $analytics = $this->analyticsService->getOrdersAnalytics();

        return response()->json([
            'success' => true,
            'analytics' => $analytics
        ]);
    }

    /**
     * Get products analytics data
     */
    public function products(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'integer|min:1|max:50'
        ]);

        $limit = $request->input('limit', 10);
        $analytics = $this->analyticsService->getProductsAnalytics($limit);

        return response()->json([
            'success' => true,
            'analytics' => $analytics
        ]);
    }

    /**
     * Get producers analytics data
     */
    public function producers(): JsonResponse
    {
        $analytics = $this->analyticsService->getProducersAnalytics();

        return response()->json([
            'success' => true,
            'analytics' => $analytics
        ]);
    }

    /**
     * Get dashboard summary with all key metrics
     */
    public function dashboard(): JsonResponse
    {
        $summary = $this->analyticsService->getDashboardSummary();

        return response()->json([
            'success' => true,
            'summary' => $summary
        ]);
    }
}
