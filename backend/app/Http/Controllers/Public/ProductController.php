<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filtering, search, and sorting.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['categories', 'images' => function ($query) {
            $query->orderBy('is_primary', 'desc')->orderBy('sort_order');
        }, 'producer']);

        // Default to active products only
        $query->where('is_active', true);

        // Search filter
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter (by slug or id)
        if ($category = $request->get('category')) {
            $query->whereHas('categories', function ($q) use ($category) {
                if (is_numeric($category)) {
                    $q->where('categories.id', $category);
                } else {
                    $q->where('categories.slug', $category);
                }
            });
        }

        // Producer filter (by slug or id)
        if ($producer = $request->get('producer')) {
            $query->whereHas('producer', function ($q) use ($producer) {
                if (is_numeric($producer)) {
                    $q->where('producers.id', $producer);
                } else {
                    $q->where('producers.slug', $producer);
                }
            });
        }

        // Price range filters
        if ($minPrice = $request->get('min_price')) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->get('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        // Organic filter
        if ($request->has('organic')) {
            $organic = filter_var($request->get('organic'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($organic !== null) {
                $query->where('is_organic', $organic);
            }
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDir = $request->get('dir', 'desc');
        
        $allowedSorts = ['price', 'name', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Display the specified product with categories and images.
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['categories', 'images' => function ($query) {
            $query->orderBy('is_primary', 'desc')->orderBy('sort_order');
        }, 'producer'])
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json($product);
    }
}
