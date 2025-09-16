<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Producer;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProducerAnalyticsService
{
    /**
     * Get sales analytics for a specific producer
     */
    public function getProducerSalesAnalytics(int $producerId, string $period = 'daily', int $limit = 30): array
    {
        // Validate period
        if (!in_array($period, ['daily', 'monthly'])) {
            throw new \InvalidArgumentException('Period must be daily or monthly');
        }

        // Get producer's product IDs
        $productIds = Product::where('producer_id', $producerId)->pluck('id');

        if ($productIds->isEmpty()) {
            return $this->getEmptyAnalytics($period, $limit);
        }

        // Build query based on period
        $query = OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order', function ($q) {
                $q->where('payment_status', 'paid');
            });

        if ($period === 'daily') {
            $startDate = now()->subDays($limit);
            $groupBy = 'DATE(orders.created_at)';
            $selectDate = 'DATE(orders.created_at) as date';
        } else {
            $startDate = now()->subMonths($limit);
            $groupBy = 'DATE_FORMAT(orders.created_at, "%Y-%m")';
            $selectDate = 'DATE_FORMAT(orders.created_at, "%Y-%m") as date';
        }

        $sales = $query->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', $startDate)
            ->selectRaw($selectDate)
            ->selectRaw('SUM(order_items.total_price) as total_sales')
            ->selectRaw('COUNT(DISTINCT orders.id) as order_count')
            ->selectRaw('AVG(order_items.total_price) as average_order_value')
            ->groupByRaw($groupBy)
            ->orderBy('date')
            ->get();

        $data = $this->fillMissingDates($sales, $period, $limit);

        return [
            'period' => $period,
            'data' => $data,
            'summary' => [
                'total_revenue' => $sales->sum('total_sales'),
                'total_orders' => $sales->sum('order_count'),
                'average_order_value' => $sales->avg('average_order_value') ?? 0,
                'period_growth' => $this->calculateGrowth($sales)
            ]
        ];
    }

    /**
     * Get orders analytics for a specific producer
     */
    public function getProducerOrdersAnalytics(int $producerId): array
    {
        // Get producer's product IDs
        $productIds = Product::where('producer_id', $producerId)->pluck('id');

        if ($productIds->isEmpty()) {
            return $this->getEmptyOrdersAnalytics();
        }

        // Base query for orders containing producer's products
        $baseQuery = Order::whereHas('orderItems', function ($q) use ($productIds) {
            $q->whereIn('product_id', $productIds);
        });

        // Order status distribution
        $byStatus = (clone $baseQuery)->groupBy('status')
            ->selectRaw('status, COUNT(*) as count')
            ->pluck('count', 'status')
            ->toArray();

        // Payment status distribution
        $byPaymentStatus = (clone $baseQuery)->groupBy('payment_status')
            ->selectRaw('payment_status, COUNT(*) as count')
            ->pluck('count', 'payment_status')
            ->toArray();

        // Recent orders (last 10)
        $recentOrders = (clone $baseQuery)->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'user_email' => $order->user->email ?? 'N/A',
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->toISOString()
                ];
            });

        return [
            'by_status' => $byStatus,
            'by_payment_status' => $byPaymentStatus,
            'recent_orders' => $recentOrders,
            'summary' => [
                'total_orders' => array_sum($byStatus),
                'pending_orders' => $byStatus['pending'] ?? 0,
                'completed_orders' => ($byStatus['delivered'] ?? 0) + ($byStatus['completed'] ?? 0),
                'cancelled_orders' => $byStatus['cancelled'] ?? 0
            ]
        ];
    }

    /**
     * Get products analytics for a specific producer
     */
    public function getProducerProductsAnalytics(int $producerId, int $limit = 10): array
    {
        // Get producer's products with sales data
        $topProducts = Product::where('producer_id', $producerId)
            ->with(['orderItems' => function ($q) {
                $q->whereHas('order', function ($orderQ) {
                    $orderQ->where('payment_status', 'paid');
                });
            }])
            ->get()
            ->map(function ($product) {
                $totalQuantitySold = $product->orderItems->sum('quantity');
                $totalRevenue = $product->orderItems->sum('total_price');
                $orderCount = $product->orderItems->groupBy('order_id')->count();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'total_quantity_sold' => $totalQuantitySold,
                    'total_revenue' => $totalRevenue,
                    'order_count' => $orderCount
                ];
            })
            ->filter(function ($product) {
                return $product['total_revenue'] > 0;
            })
            ->sortByDesc('total_revenue')
            ->take($limit)
            ->values();

        // Get product summary
        $allProducts = Product::where('producer_id', $producerId);
        $totalProducts = $allProducts->count();
        $activeProducts = $allProducts->where('is_active', true)->count();
        $outOfStock = $allProducts->where('stock', '<=', 0)->count();

        $bestSeller = $topProducts->first();

        return [
            'top_products' => $topProducts,
            'summary' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'out_of_stock' => $outOfStock,
                'best_seller_id' => $bestSeller['id'] ?? null,
                'best_seller_name' => $bestSeller['name'] ?? null
            ]
        ];
    }

    /**
     * Fill missing dates with zero values
     */
    private function fillMissingDates($sales, string $period, int $limit): array
    {
        $data = [];
        $salesByDate = $sales->keyBy('date');

        for ($i = $limit - 1; $i >= 0; $i--) {
            if ($period === 'daily') {
                $date = now()->subDays($i)->format('Y-m-d');
            } else {
                $date = now()->subMonths($i)->format('Y-m');
            }

            $dayData = $salesByDate->get($date);
            $data[] = [
                'date' => $date,
                'total_sales' => $dayData ? (float) $dayData->total_sales : 0,
                'order_count' => $dayData ? (int) $dayData->order_count : 0,
                'average_order_value' => $dayData ? (float) $dayData->average_order_value : 0
            ];
        }

        return $data;
    }

    /**
     * Calculate growth percentage
     */
    private function calculateGrowth($sales): float
    {
        if ($sales->count() < 2) {
            return 0;
        }

        $recent = $sales->slice(-2, 2);
        $previous = $recent->first()->total_sales ?? 0;
        $current = $recent->last()->total_sales ?? 0;

        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get empty analytics for producers with no products
     */
    private function getEmptyAnalytics(string $period, int $limit): array
    {
        $data = [];
        for ($i = $limit - 1; $i >= 0; $i--) {
            if ($period === 'daily') {
                $date = now()->subDays($i)->format('Y-m-d');
            } else {
                $date = now()->subMonths($i)->format('Y-m');
            }

            $data[] = [
                'date' => $date,
                'total_sales' => 0,
                'order_count' => 0,
                'average_order_value' => 0
            ];
        }

        return [
            'period' => $period,
            'data' => $data,
            'summary' => [
                'total_revenue' => 0,
                'total_orders' => 0,
                'average_order_value' => 0,
                'period_growth' => 0
            ]
        ];
    }

    /**
     * Get empty orders analytics
     */
    private function getEmptyOrdersAnalytics(): array
    {
        return [
            'by_status' => [],
            'by_payment_status' => [],
            'recent_orders' => [],
            'summary' => [
                'total_orders' => 0,
                'pending_orders' => 0,
                'completed_orders' => 0,
                'cancelled_orders' => 0
            ]
        ];
    }
}