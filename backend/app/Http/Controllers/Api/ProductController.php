<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 15), 100); // Max 100 items per page
        
        $products = Product::with('producer')
            ->where('is_active', true)
            ->paginate($perPage);
        
        return response()->json($products);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        $product->load('producer');
        
        return response()->json($product);
    }
}
