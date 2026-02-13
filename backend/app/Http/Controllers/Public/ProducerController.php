<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProducerController extends Controller
{
    /**
     * Display a listing of active producers.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 100);
        $search = $request->get('search');
        $sort = $request->get('sort', 'name');
        $direction = $request->get('dir', 'asc');

        // Validate sort parameters
        $allowedSorts = ['name', 'location', 'created_at'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'name';
        $direction = in_array($direction, ['asc', 'desc']) ? $direction : 'asc';

        $query = Producer::query()
            ->with(['user:id,name,email'])
            ->where('is_active', true);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhere('location', 'ILIKE', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'ILIKE', "%{$search}%");
                    });
            });
        }

        // Apply sorting
        $query->orderBy($sort, $direction);

        $producers = $query->paginate($perPage);

        // Transform the data to include only public information
        $producers->getCollection()->transform(function ($producer) {
            return [
                'id' => $producer->id,
                'name' => $producer->name,
                'description' => $producer->description,
                'location' => $producer->location,
                'slug' => $producer->slug,
                'is_active' => $producer->is_active,
                'created_at' => $producer->created_at,
                'updated_at' => $producer->updated_at,
                // Optional: Include product count
                'products_count' => $producer->products()->where('is_active', true)->count(),
            ];
        });

        return response()->json($producers);
    }

    /**
     * Display the specified producer by ID or slug.
     *
     * STOREFRONT-LARAVEL-01: Accept both numeric ID and string slug
     * so the Next.js storefront can look up producers by slug.
     */
    public function show(string $id): JsonResponse
    {
        $producer = Producer::with(['user:id,name,email'])
            ->where('is_active', true)
            ->where(function ($q) use ($id) {
                $q->where('id', is_numeric($id) ? (int) $id : 0)
                    ->orWhere('slug', $id);
            })
            ->firstOrFail();

        // Load active products with their categories and images
        $producer->load(['products' => function ($query) {
            $query->where('is_active', true)
                ->with(['categories:id,name,slug', 'images'])
                ->orderBy('name');
        }]);

        $data = [
            'id' => $producer->id,
            'name' => $producer->name,
            'description' => $producer->description,
            'location' => $producer->location,
            'city' => $producer->city,
            'region' => $producer->region,
            'latitude' => $producer->latitude,
            'longitude' => $producer->longitude,
            'website' => $producer->website,
            'slug' => $producer->slug,
            'is_active' => $producer->is_active,
            'created_at' => $producer->created_at,
            'updated_at' => $producer->updated_at,
            'products' => $producer->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => number_format($product->price, 2),
                    'unit' => $product->unit,
                    'stock' => $product->stock,
                    'is_organic' => $product->is_organic,
                    'categories' => $product->categories,
                    'images' => $product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'is_primary' => $image->is_primary,
                            'sort_order' => $image->sort_order,
                        ];
                    }),
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            }),
            'total_active_products' => $producer->products->count(),
        ];

        return response()->json($data);
    }
}
