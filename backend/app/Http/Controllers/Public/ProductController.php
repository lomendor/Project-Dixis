<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filtering, search, and sorting.
     *
     * Pass SEARCH-FTS-01: Ranked full-text search on PostgreSQL,
     * ILIKE fallback on other databases (e.g., SQLite in CI).
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->get('search');
        $usesFts = false;

        $query = Product::query()->with(['categories', 'images' => function ($query) {
            $query->orderBy('is_primary', 'desc')->orderBy('sort_order');
        }, 'producer']);

        // Default to active products only
        $query->where('is_active', true);

        // Search filter with FTS ranking on PostgreSQL, ILIKE fallback otherwise
        if ($search) {
            if (DB::getDriverName() === 'pgsql') {
                // PostgreSQL: Use full-text search with ranking
                // websearch_to_tsquery handles phrases and operators safely
                $query->whereRaw(
                    "search_vector @@ websearch_to_tsquery('simple', ?)",
                    [$search]
                );
                $query->selectRaw(
                    "*, ts_rank_cd(search_vector, websearch_to_tsquery('simple', ?)) AS search_rank",
                    [$search]
                );
                $usesFts = true;
            } else {
                // Non-PostgreSQL (SQLite in CI): Use ILIKE fallback
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }
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

        // Cultivation type filter
        if ($cultivationType = $request->get('cultivation_type')) {
            $allowed = ['conventional', 'organic_certified', 'organic_transitional', 'biodynamic', 'traditional_natural', 'other'];
            if (in_array($cultivationType, $allowed)) {
                $query->where('cultivation_type', $cultivationType);
            }
        }

        // Sorting
        // When FTS is active and no explicit sort requested, order by search_rank DESC
        $sortField = $request->get('sort', $usesFts ? 'relevance' : 'created_at');
        $sortDir = $request->get('dir', 'desc');

        $allowedSorts = ['price', 'name', 'created_at'];
        if ($usesFts && $sortField === 'relevance') {
            // FTS ranking: best matches first
            $query->orderByRaw('search_rank DESC');
        } elseif (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $products = $query->paginate($perPage);

        // Transform the data to ensure consistent producer information
        $products->getCollection()->transform(function ($product) {
            $data = $product->toArray();

            // Ensure producer information is properly formatted
            if ($product->producer) {
                $data['producer'] = [
                    'id' => $product->producer->id,
                    'name' => $product->producer->name,
                    'slug' => $product->producer->slug,
                    'location' => $product->producer->location,
                ];
            }

            // Format price consistently
            $data['price'] = number_format($product->price, 2);

            return $data;
        });

        // Pass PERF-PRODUCTS-CACHE-01: Add cache headers for CDN/proxy caching
        // - public: allow CDN/proxy caching (this is public product data, no auth)
        // - s-maxage=60: CDN can cache for 60 seconds
        // - stale-while-revalidate=30: serve stale while fetching fresh in background
        return response()->json($products)
            ->header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    }

    /**
     * Display the specified product by ID or slug.
     *
     * STOREFRONT-LARAVEL-01: Accept both numeric ID and string slug
     * so the Next.js storefront can look up products by slug.
     */
    public function show($id): JsonResponse
    {
        $query = Product::with(['categories', 'images' => function ($query) {
            $query->orderBy('is_primary', 'desc')->orderBy('sort_order');
        }, 'producer'])
            ->where('is_active', true);

        if (is_numeric($id)) {
            $product = $query->findOrFail((int) $id);
        } else {
            $product = $query->where('slug', $id)->firstOrFail();
        }

        $data = $product->toArray();

        // Ensure producer information is properly formatted
        if ($product->producer) {
            $data['producer'] = [
                'id' => $product->producer->id,
                'name' => $product->producer->name,
                'slug' => $product->producer->slug,
                'location' => $product->producer->location,
                'description' => $product->producer->description,
            ];
        }

        // Format price consistently
        $data['price'] = number_format($product->price, 2);

        // Pass PERF-PRODUCTS-CACHE-01: Add cache headers for CDN/proxy caching
        return response()->json($data)
            ->header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    }
}
