<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ProducerController extends Controller
{
    /**
     * Toggle product active status for the authenticated producer
     */
    public function toggleProduct(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        
        // Ensure user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Ensure user has a producer profile
        if (!$user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }
        
        // Ensure product belongs to this producer
        if ($product->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        
        // Toggle the active status
        $product->is_active = !$product->is_active;
        $product->save();
        
        return response()->json([
            'id' => $product->id,
            'is_active' => $product->is_active,
            'message' => 'Product status updated successfully'
        ]);
    }
    
    /**
     * Update product price for the authenticated producer
     */
    public function updatePrice(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        
        // Ensure user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Ensure user has a producer profile
        if (!$user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }
        
        // Ensure product belongs to this producer
        if ($product->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        
        // Validate price
        $validated = $request->validate([
            'price' => 'required|numeric|min:0.01|max:999999.99'
        ]);
        
        $oldPrice = $product->price;
        $product->price = $validated['price'];
        $product->save();
        
        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'old_price' => number_format((float) $oldPrice, 2),
            'new_price' => number_format((float) $product->price, 2),
            'unit' => $product->unit,
            'message' => 'Product price updated successfully'
        ]);
    }
    
    /**
     * Update product stock for the authenticated producer
     */
    public function updateStock(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        
        // Ensure user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Ensure user has a producer profile
        if (!$user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }
        
        // Ensure product belongs to this producer
        if ($product->producer_id !== $user->producer->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        
        // Validate stock
        $validated = $request->validate([
            'stock' => 'required|integer|min:0|max:999999'
        ]);
        
        $oldStock = $product->stock;
        $product->stock = $validated['stock'];
        $product->save();
        
        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'old_stock' => (int) $oldStock,
            'new_stock' => (int) $product->stock,
            'unit' => $product->unit,
            'is_in_stock' => $product->stock > 0,
            'message' => 'Product stock updated successfully'
        ]);
    }
    
    /**
     * Get KPI data for producer dashboard
     */
    public function kpi(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Ensure user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Ensure user has a producer profile
        if (!$user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }
        
        $producer = $user->producer;
        
        // Get real KPI data from database
        $totalProducts = $producer->products()->count();
        $activeProducts = $producer->products()->where('is_active', true)->count();
        
        // Calculate orders and revenue from order_items via products
        $totalOrders = \DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.producer_id', $producer->id)
            ->distinct('order_items.order_id')
            ->count('order_items.order_id');
            
        $revenue = \DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.producer_id', $producer->id)
            ->sum('order_items.total_price') ?? 0;
        
        // Get unread messages count
        $unreadMessages = \App\Models\Message::where('producer_id', $producer->id)
            ->where('is_read', false)
            ->count();
        
        return response()->json([
            'total_products' => $totalProducts,
            'active_products' => $activeProducts,
            'total_orders' => $totalOrders,
            'revenue' => (float) $revenue,
            'unread_messages' => $unreadMessages,
        ]);
    }
    
    /**
     * Get top-selling products for producer dashboard
     */
    public function topProducts(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Ensure user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Ensure user has a producer profile
        if (!$user->producer) {
            return response()->json(['message' => 'Producer profile not found'], 403);
        }
        
        $producer = $user->producer;
        
        // Validate limit parameter
        $limit = $request->query('limit', 10);
        $limit = max(1, min(50, (int) $limit)); // Between 1 and 50
        
        // Get top-selling products by quantity sold
        $topProducts = \DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.producer_id', $producer->id)
            ->where('orders.status', '!=', 'cancelled') // Exclude cancelled orders
            ->select(
                'products.id',
                'products.name',
                'products.unit',
                'products.price as current_price',
                'products.stock',
                'products.is_active',
                \DB::raw('SUM(order_items.quantity) as total_quantity_sold'),
                \DB::raw('SUM(order_items.total_price) as total_revenue'),
                \DB::raw('COUNT(DISTINCT order_items.order_id) as total_orders'),
                \DB::raw('AVG(order_items.unit_price) as average_unit_price')
            )
            ->groupBy(
                'products.id', 
                'products.name', 
                'products.unit', 
                'products.price',
                'products.stock',
                'products.is_active'
            )
            ->orderBy('total_quantity_sold', 'desc')
            ->limit($limit)
            ->get();
        
        // Also get products with no sales (for completeness if limit allows)
        if ($topProducts->count() < $limit) {
            $productIdsWithSales = $topProducts->pluck('id')->toArray();
            
            $productsWithoutSales = $producer->products()
                ->whereNotIn('id', $productIdsWithSales)
                ->select('id', 'name', 'unit', 'price as current_price', 'stock', 'is_active')
                ->limit($limit - $topProducts->count())
                ->get()
                ->map(function ($product) {
                    return (object) [
                        'id' => $product->id,
                        'name' => $product->name,
                        'unit' => $product->unit,
                        'current_price' => $product->current_price,
                        'stock' => $product->stock,
                        'is_active' => $product->is_active,
                        'total_quantity_sold' => 0,
                        'total_revenue' => 0.0,
                        'total_orders' => 0,
                        'average_unit_price' => (float) $product->current_price,
                    ];
                });
            
            $topProducts = $topProducts->concat($productsWithoutSales);
        }
        
        return response()->json([
            'top_products' => $topProducts->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'unit' => $product->unit,
                    'current_price' => number_format((float) $product->current_price, 2),
                    'stock' => $product->stock,
                    'is_active' => (bool) $product->is_active,
                    'total_quantity_sold' => (int) $product->total_quantity_sold,
                    'total_revenue' => number_format((float) $product->total_revenue, 2),
                    'total_orders' => (int) $product->total_orders,
                    'average_unit_price' => number_format((float) $product->average_unit_price, 2),
                ];
            })->values(),
            'limit' => $limit,
            'total_products_shown' => $topProducts->count(),
        ]);
    }
}
