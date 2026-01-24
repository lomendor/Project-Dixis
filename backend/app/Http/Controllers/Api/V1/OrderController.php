<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\InventoryService;
use App\Services\OrderEmailService;
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
            ->with('orderItems.producer') // Eager-load items + producer for list view
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
        $order->load('orderItems.producer')->loadCount('orderItems');

        return new OrderResource($order);
    }

    /**
     * Create a new order with atomic transactions and stock validation.
     * Pass 53: Sends email notifications after transaction commits.
     */
    public function store(
        StoreOrderRequest $request,
        InventoryService $inventoryService,
        OrderEmailService $emailService
    ): OrderResource {
        $requestId = uniqid('order_', true); // Request tracking ID

        try {
            $this->authorize('create', Order::class);

            // Store order reference for afterCommit callback
            $createdOrder = null;

            $result = DB::transaction(function () use ($request, $inventoryService, $requestId, &$createdOrder) {
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

                // HOTFIX: Block multi-producer checkout (Pass HOTFIX-MP-CHECKOUT-GUARD-01)
                // Multi-producer order splitting is not yet implemented.
                // Defense in depth: validates even if frontend guard is bypassed.
                $producerIds = collect($productData)
                    ->pluck('product.producer_id')
                    ->filter() // Remove nulls
                    ->unique();

                if ($producerIds->count() > 1) {
                    abort(422, json_encode([
                        'error' => 'MULTI_PRODUCER_NOT_SUPPORTED_YET',
                        'message' => 'Η ολοκλήρωση αγοράς με προϊόντα από πολλαπλούς παραγωγούς δεν υποστηρίζεται ακόμα. Παρακαλώ χωρίστε το καλάθι σε ξεχωριστές παραγγελίες.',
                        'producer_count' => $producerIds->count(),
                    ]));
                }

                // Create the order
                // Use authenticated user's ID if available, otherwise allow guest orders
                $userId = auth()->id() ?? $validated['user_id'] ?? null;

                // Pass 48: Use shipping_cost from frontend, default to 0
                $shippingCost = $validated['shipping_cost'] ?? 0;
                $totalWithShipping = $orderTotal + $shippingCost;

                $order = Order::create([
                    'user_id' => $userId,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'payment_method' => $validated['payment_method'] ?? 'COD',
                    'shipping_method' => $validated['shipping_method'],
                    'shipping_address' => $validated['shipping_address'] ?? null,
                    'currency' => $validated['currency'],
                    'subtotal' => $orderTotal,
                    'shipping_cost' => $shippingCost,
                    'total' => $totalWithShipping,
                    'total_amount' => $totalWithShipping, // Legacy alias for frontend compatibility
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
                $order->load('orderItems.producer')->loadCount('orderItems');

                // Store order for email sending after commit
                $createdOrder = $order;

                return new OrderResource($order);
            });

            // Pass 53 + HOTFIX: Send email notifications AFTER transaction commits
            // HOTFIX-MP-CHECKOUT-GUARD-01: Only send for COD orders.
            // Card payments send email after payment confirmation (in PaymentController).
            if ($createdOrder && $createdOrder->payment_method === 'COD') {
                try {
                    $emailService->sendOrderPlacedNotifications($createdOrder);
                } catch (\Exception $e) {
                    // Log but don't fail the order creation
                    \Log::error('Pass 53: Email notification failed (order still created)', [
                        'order_id' => $createdOrder->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return $result;
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            // Log authorization failures (guest trying to create order when not allowed)
            \Log::warning('Order creation authorization failed', [
                'request_id' => $requestId,
                'user_id' => auth()->id(),
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);
            throw $e;
        } catch (\Illuminate\Database\QueryException $e) {
            // Log database errors with SQLSTATE but NOT connection strings
            \Log::error('Order creation database error', [
                'request_id' => $requestId,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'sql_state' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            // Log all other exceptions with stack trace (top 10 lines only)
            \Log::error('Order creation failed', [
                'request_id' => $requestId,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => array_slice(explode("\n", $e->getTraceAsString()), 0, 10),
            ]);
            throw $e;
        }
    }
}
