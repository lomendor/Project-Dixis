<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Http\Resources\ProducerResource;
use App\Http\Resources\PublicProducerResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProducerController extends Controller
{
    /**
     * Display a listing of producers with optional search and pagination.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Producer::query()
            ->where('is_active', true)
            ->orderBy('created_at', 'desc');

        // Apply search filter if provided
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('slug', 'LIKE', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $producers = $query->paginate($perPage);

        return PublicProducerResource::collection($producers);
    }

    /**
     * Display the specified producer.
     *
     * @param Producer $producer
     * @return PublicProducerResource
     */
    public function show(Producer $producer): PublicProducerResource
    {
        // Only show active producers
        abort_if(!$producer->is_active, 404);

        return new PublicProducerResource($producer);
    }
}