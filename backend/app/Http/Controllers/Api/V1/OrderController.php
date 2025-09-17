<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders with pagination and filters.
     * Note: Demo visibility only, no PII exposed.
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
     */
    public function show(Order $order): OrderResource
    {
        $order->load('orderItems')->loadCount('orderItems');

        return new OrderResource($order);
    }

    /**
     * Create a new order with atomic transactions and stock validation.
     */
    public function store(StoreOrderRequest $request, InventoryService $inventoryService): OrderResource
    {
        $this->authorize('create', Order::class);

        return DB::transaction(function () use ($request, $inventoryService) {
            $validated = $request->validated();
            $orderTotal = 0;
            $productData = [];

            // Validate products and check stock
            foreach ($validated['items'] as $itemData) {
                $product = Product::where('id', $itemData['product_id'])
                    ->where('is_active', true)
                    ->lockForUpdate() // Prevent race conditions on stock
                    ->first();

                if (! $product) {
                    abort(400, "Product with ID {$itemData['product_id']} not found or inactive.");
                }

                // Check stock if available
                if ($product->stock !== null && $product->stock < $itemData['quantity']) {
                    abort(409, "Insufficient stock for product '{$product->name}'. Available: {$product->stock}, requested: {$itemData['quantity']}.");
                }

                $unitPrice = $product->price;
                $totalPrice = $unitPrice * $itemData['quantity'];
                $orderTotal += $totalPrice;

                $productData[] = [
                    'product' => $product,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ];

                // Update stock if it exists
                if ($product->stock !== null) {
                    $product->decrement('stock', $itemData['quantity']);
                    // Refresh the product to get updated stock value
                    $product->refresh();
                    // Check for low stock alerts
                    $inventoryService->checkProductLowStock($product);
                }
            }

            // Create the order
            $order = Order::create([
                'user_id' => $validated['user_id'] ?? null,
                'status' => 'pending',
                'payment_status' => 'pending',
                'shipping_method' => $validated['shipping_method'],
                'currency' => $validated['currency'],
                'subtotal' => $orderTotal,
                'shipping_cost' => 0, // No shipping cost for now
                'total' => $orderTotal,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items
            foreach ($productData as $data) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $data['product']->id,
                    'producer_id' => $data['product']->producer_id,
                    'quantity' => $data['quantity'],
                    'unit_price' => $data['unit_price'],
                    'total_price' => $data['total_price'],
                    'product_name' => $data['product']->name,
                    'product_unit' => $data['product']->unit,
                ]);
            }

            // Load relationships for response
            $order->load('orderItems')->loadCount('orderItems');

            return new OrderResource($order);
        });
    }
}
