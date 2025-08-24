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
        
        // Get KPI data
        $productsCount = $producer->products()->count();
        
        // For MVP, return sample data for orders, revenue, payouts
        // In a real app, these would come from orders/sales tables
        $kpiData = [
            'orders' => 5,  // Sample data
            'revenue' => 1250.50,  // Sample data
            'products' => $productsCount,
            'payouts' => 875.25  // Sample data
        ];
        
        return response()->json($kpiData);
    }
}
