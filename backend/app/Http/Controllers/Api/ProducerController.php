<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProducerController extends Controller
{
    /**
     * Toggle product active status for the authenticated producer
     */
    public function toggleProduct(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        
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
     * Get KPI data for producer dashboard
     */
    public function kpi(Request $request): JsonResponse
    {
        $user = $request->user();
        
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
}
