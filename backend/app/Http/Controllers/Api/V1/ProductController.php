<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products with optional search, filtering, and pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'category' => 'nullable|string|max:100',
            'producer_id' => 'nullable|integer|exists:producers,id',
            'is_seasonal' => 'nullable|boolean',
            'cultivation_type' => 'nullable|string|in:conventional,organic_certified,organic_transitional,biodynamic,traditional_natural,other',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0|gte:min_price',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort' => 'nullable|string|in:name,price,created_at,stock',
            'direction' => 'nullable|string|in:asc,desc',
        ]);

        $query = Product::query()
            ->with('producer');

        // Filter by active status (default: only active products)
        $isActive = $request->get('is_active', true);
        if ($isActive !== null) {
            $query->where('is_active', $isActive);
        }

        // Apply search filter if provided
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('slug', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filter by category
        if ($category = $request->get('category')) {
            $query->where('category', $category);
        }

        // Filter by producer
        if ($producerId = $request->get('producer_id')) {
            $query->where('producer_id', $producerId);
        }

        // Filter by organic (derived from cultivation_type)
        if ($request->has('is_organic')) {
            if ($request->boolean('is_organic')) {
                $query->whereIn('cultivation_type', ['organic_certified', 'organic_transitional']);
            } else {
                $query->where(function ($q) {
                    $q->whereNull('cultivation_type')
                      ->orWhereNotIn('cultivation_type', ['organic_certified', 'organic_transitional']);
                });
            }
        }

        // Filter by seasonal
        if ($request->has('is_seasonal')) {
            $query->where('is_seasonal', $request->boolean('is_seasonal'));
        }

        // Filter by cultivation type
        if ($cultivationType = $request->get('cultivation_type')) {
            $query->where('cultivation_type', $cultivationType);
        }

        // Price range filter
        if ($minPrice = $request->get('min_price')) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->get('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return ProductResource::collection($products)->additional([
            'current_page' => $products->currentPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'last_page' => $products->lastPage(),
            'from' => $products->firstItem(),
            'to' => $products->lastItem(),
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): ProductResource
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();
        $user = $request->user();

        // Security: Auto-set producer_id from authenticated user (server-side)
        // Never trust client for ownership. Admin can override via request.
        if ($user->role === 'producer') {
            if (!$user->producer) {
                return response()->json([
                    'message' => 'Producer profile not found for authenticated user'
                ], 403);
            }
            $data['producer_id'] = $user->producer->id;
        }
        // Admin can specify producer_id from request (already validated)

        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product = Product::create($data);

        // Sync product images if provided
        if ($request->has('images')) {
            $this->syncImages($product, $request->input('images', []));
        }

        $product->load(['producer', 'images']);

        return new ProductResource($product);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): ProductResource
    {
        // Only show active products
        abort_if(! $product->is_active, 404);

        // Eager load producer + images
        $product->load(['producer', 'images']);

        return new ProductResource($product);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        // Generate slug if name is updated but slug is not provided
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product->update($data);

        // Sync product images if provided
        if ($request->has('images')) {
            $this->syncImages($product, $request->input('images', []));
        }

        $product->load(['producer', 'images']);

        return new ProductResource($product);
    }

    /**
     * Sync product images: delete old, insert new with sort_order.
     * First image is automatically marked as primary.
     * Also updates product.image_url to match primary image for backwards compatibility.
     */
    private function syncImages(Product $product, array $images): void
    {
        // Delete existing images
        $product->images()->delete();

        // Insert new images
        foreach ($images as $i => $img) {
            $url = is_string($img) ? $img : ($img['url'] ?? null);
            if (!$url) continue;

            $product->images()->create([
                'url'        => $url,
                'is_primary' => $i === 0,
                'sort_order' => $i,
            ]);
        }

        // Sync primary image to product.image_url for backwards compat
        $primaryUrl = count($images) > 0
            ? (is_string($images[0]) ? $images[0] : ($images[0]['url'] ?? null))
            : null;
        $product->update(['image_url' => $primaryUrl]);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully'], 204);
    }
}
