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
     * Display a listing of orders with pagination.
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
        ]);

        $perPage = $request->get('per_page', 15);
        
        $orders = Order::query()
            ->with('orderItems')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

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
        $order->load('orderItems');

        return new OrderResource($order);
    }
}