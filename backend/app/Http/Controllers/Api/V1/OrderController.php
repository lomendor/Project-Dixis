<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * Display a listing of orders with pagination and filters.
     * Note: Demo visibility only, no PII exposed.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'status' => 'nullable|string|in:pending,processing,shipped,completed,cancelled',
            'q' => 'nullable|string|max:255',
        ]);

        $perPage = $request->get('per_page', 15);
        
        $query = Order::query()
            ->withCount('orderItems')
            ->orderBy('created_at', 'desc');

        // Apply status filter if provided
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        // Apply search filter by ID (simulating order_number search)
        if ($search = $request->get('q')) {
            // Search by ID since we don't have order_number field
            // Users can search for "123" to find order with ID 123
            if (is_numeric($search)) {
                $query->where('id', $search);
            } else {
                // Non-numeric search cannot match any ID, return empty result
                $query->where('id', -1);
            }
        }
        
        $orders = $query->paginate($perPage);

        return OrderResource::collection($orders);
    }

    /**
     * Display the specified order with items.
     *
     * @param Order $order
     * @return OrderResource
     */
    public function show(Order $order): OrderResource
    {
        $order->load('orderItems')->loadCount('orderItems');

        return new OrderResource($order);
    }
}