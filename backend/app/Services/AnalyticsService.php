<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Get sales analytics data (daily and monthly)
     */
    public function getSalesAnalytics(string $period = 'daily', int $limit = 30): array
    {
        $query = Order::where('payment_status', 'paid');

        if ($period === 'daily') {
            $startDate = now()->subDays($limit);
            $groupBy = 'DATE(created_at)';
            $selectDate = 'DATE(created_at) as date';
        } else {
            $startDate = now()->subMonths($limit);
            $groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
            $selectDate = 'DATE_FORMAT(created_at, "%Y-%m") as date';
        }

        $sales = $query->where('created_at', '>=', $startDate)
            ->selectRaw($selectDate)
            ->selectRaw('SUM(total_amount) as total_sales')
            ->selectRaw('COUNT(id) as order_count')
            ->selectRaw('AVG(total_amount) as average_order_value')
            ->groupByRaw($groupBy)
            ->orderBy('date')
            ->get();

        // Fill in missing dates with zero values
        $filledData = $this->fillMissingDates($sales, $period, $limit);

        return [
            'period' => $period,
            'data' => $filledData,
            'summary' => [
                'total_revenue' => $sales->sum('total_sales'),
                'total_orders' => $sales->sum('order_count'),
                'average_order_value' => $sales->avg('average_order_value') ?? 0,
                'period_growth' => $this->calculateGrowth($sales),
            ],
        ];
    }

    /**
     * Get orders analytics grouped by status
     */
    public function getOrdersAnalytics(): array
    {
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn ($item) => $item->count)
            ->toArray();

        $paymentStatus = Order::select('payment_status', DB::raw('COUNT(*) as count'))
            ->groupBy('payment_status')
            ->get()
            ->keyBy('payment_status')
            ->map(fn ($item) => $item->count)
            ->toArray();

        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'user_email' => $order->user?->email,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->toISOString(),
                ];
            });

        return [
            'by_status' => $ordersByStatus,
            'by_payment_status' => $paymentStatus,
            'recent_orders' => $recentOrders,
            'summary' => [
                'total_orders' => array_sum($ordersByStatus),
                'pending_orders' => $ordersByStatus['pending'] ?? 0,
                'completed_orders' => $ordersByStatus['delivered'] ?? 0,
                'cancelled_orders' => $ordersByStatus['cancelled'] ?? 0,
            ],
        ];
    }

    /**
     * Get top products analytics
     */
    public function getProductsAnalytics(int $limit = 10): array
    {
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.payment_status', 'paid')
            ->select(
                'products.id',
                'products.name',
                'products.price',
                DB::raw('SUM(order_items.quantity) as total_quantity_sold'),
                DB::raw('SUM(order_items.total_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as order_count')
            )
            ->groupBy('products.id', 'products.name', 'products.price')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $outOfStock = Product::where('stock', 0)->count();

        return [
            'top_products' => $topProducts->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'total_quantity_sold' => (int) $product->total_quantity_sold,
                    'total_revenue' => (float) $product->total_revenue,
                    'order_count' => (int) $product->order_count,
                ];
            }),
            'summary' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'out_of_stock' => $outOfStock,
                'best_seller_id' => $topProducts->first()?->id,
                'best_seller_name' => $topProducts->first()?->name,
            ],
        ];
    }

    /**
     * Get active producers analytics
     */
    public function getProducersAnalytics(): array
    {
        $activeProducers = Producer::whereHas('products', function ($query) {
            $query->where('is_active', true);
        })->count();

        $topProducers = DB::table('producers')
            ->join('products', 'producers.id', '=', 'products.producer_id')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->select(
                'producers.id',
                'producers.name',
                'producers.location',
                DB::raw('COUNT(DISTINCT products.id) as product_count'),
                DB::raw('SUM(order_items.total_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count')
            )
            ->groupBy('producers.id', 'producers.name', 'producers.location')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        return [
            'active_producers' => $activeProducers,
            'total_producers' => Producer::count(),
            'top_producers' => $topProducers->map(function ($producer) {
                return [
                    'id' => $producer->id,
                    'name' => $producer->name,
                    'location' => $producer->location,
                    'product_count' => (int) $producer->product_count,
                    'total_revenue' => (float) $producer->total_revenue,
                    'order_count' => (int) $producer->order_count,
                ];
            }),
        ];
    }

    /**
     * Get dashboard summary with key metrics
     */
    public function getDashboardSummary(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Today's metrics
        $todaySales = Order::where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $todayOrders = Order::whereDate('created_at', $today)->count();

        // This month's metrics
        $monthSales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $thisMonth)
            ->sum('total_amount');

        $monthOrders = Order::where('created_at', '>=', $thisMonth)->count();

        // Last month's metrics for comparison
        $lastMonthSales = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$lastMonth, $thisMonth])
            ->sum('total_amount');

        $lastMonthOrders = Order::whereBetween('created_at', [$lastMonth, $thisMonth])->count();

        // Calculate growth percentages
        $salesGrowth = $lastMonthSales > 0
            ? (($monthSales - $lastMonthSales) / $lastMonthSales) * 100
            : 0;

        $ordersGrowth = $lastMonthOrders > 0
            ? (($monthOrders - $lastMonthOrders) / $lastMonthOrders) * 100
            : 0;

        return [
            'today' => [
                'sales' => $todaySales,
                'orders' => $todayOrders,
                'average_order_value' => $todayOrders > 0 ? $todaySales / $todayOrders : 0,
            ],
            'month' => [
                'sales' => $monthSales,
                'orders' => $monthOrders,
                'average_order_value' => $monthOrders > 0 ? $monthSales / $monthOrders : 0,
                'sales_growth' => round($salesGrowth, 2),
                'orders_growth' => round($ordersGrowth, 2),
            ],
            'totals' => [
                'users' => User::count(),
                'producers' => Producer::count(),
                'products' => Product::where('is_active', true)->count(),
                'lifetime_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
            ],
        ];
    }

    /**
     * Fill missing dates in the data
     */
    private function fillMissingDates($data, string $period, int $limit): array
    {
        $result = [];
        $format = $period === 'daily' ? 'Y-m-d' : 'Y-m';

        for ($i = $limit - 1; $i >= 0; $i--) {
            $date = $period === 'daily'
                ? now()->subDays($i)->format($format)
                : now()->subMonths($i)->format($format);

            $found = $data->firstWhere('date', $date);

            $result[] = [
                'date' => $date,
                'total_sales' => $found ? (float) $found->total_sales : 0,
                'order_count' => $found ? (int) $found->order_count : 0,
                'average_order_value' => $found ? (float) $found->average_order_value : 0,
            ];
        }

        return $result;
    }

    /**
     * Calculate growth percentage
     */
    private function calculateGrowth($sales): float
    {
        if ($sales->count() < 2) {
            return 0;
        }

        $recent = $sales->slice(-7)->sum('total_sales');
        $previous = $sales->slice(-14, 7)->sum('total_sales');

        if ($previous == 0) {
            return $recent > 0 ? 100 : 0;
        }

        return round((($recent - $previous) / $previous) * 100, 2);
    }
}
