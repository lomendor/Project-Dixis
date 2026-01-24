<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShippingLine;
use App\Models\Producer;
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
            ->with(['orderItems.producer', 'shippingLines']) // Eager-load items + producer + shipping lines
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
        // Pass MP-ORDERS-SHIPPING-V1-02: Include shipping lines
        $order->load(['orderItems.producer', 'shippingLines'])->loadCount('orderItems');

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

                // Pass MP-ORDERS-SHIPPING-V1-02: Multi-producer checkout enabled
                // Group items by producer for per-producer shipping calculation
                $producerGroups = collect($productData)->groupBy(fn ($item) => $item['product']->producer_id ?? 0);
                $producerIds = $producerGroups->keys()->filter()->values();

                // Create the order
                // Use authenticated user's ID if available, otherwise allow guest orders
                $userId = auth()->id() ?? $validated['user_id'] ?? null;

                // Pass MP-ORDERS-SHIPPING-V1-02: Calculate per-producer shipping
                $shippingMethod = $validated['shipping_method'] ?? 'HOME';
                $isMultiProducer = $producerIds->count() > 1;

                // V1 Shipping calculation constants
                $freeShippingThreshold = 35.00; // €35 per producer
                $flatShippingRate = 3.50; // €3.50 per producer shipment
                $isPickup = in_array(strtoupper($shippingMethod), ['PICKUP', 'STORE_PICKUP']);

                // Calculate shipping per producer
                $shippingLines = [];
                $totalShippingCost = 0;

                foreach ($producerGroups as $producerId => $items) {
                    if (! $producerId) {
                        continue; // Skip items without producer
                    }

                    // Calculate subtotal for this producer
                    $producerSubtotal = collect($items)->sum('total_price');

                    // Get producer name
                    $producer = Producer::find($producerId);
                    $producerName = $producer?->name ?? 'Unknown Producer';

                    // Calculate shipping for this producer
                    // PICKUP is always free, otherwise check threshold
                    $producerShipping = 0;
                    $freeShippingApplied = false;

                    if ($isPickup) {
                        // Pickup is free
                        $freeShippingApplied = true;
                    } elseif ($producerSubtotal >= $freeShippingThreshold) {
                        // Free shipping - subtotal meets threshold
                        $freeShippingApplied = true;
                    } else {
                        // Charge flat rate
                        $producerShipping = $flatShippingRate;
                    }

                    $totalShippingCost += $producerShipping;

                    $shippingLines[] = [
                        'producer_id' => $producerId,
                        'producer_name' => $producerName,
                        'subtotal' => $producerSubtotal,
                        'shipping_cost' => $producerShipping,
                        'shipping_method' => $shippingMethod,
                        'free_shipping_applied' => $freeShippingApplied,
                    ];
                }

                // Total with shipping
                $totalWithShipping = $orderTotal + $totalShippingCost;

                $order = Order::create([
                    'user_id' => $userId,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'payment_method' => $validated['payment_method'] ?? 'COD',
                    'shipping_method' => $shippingMethod,
                    'shipping_address' => $validated['shipping_address'] ?? null,
                    'currency' => $validated['currency'],
                    'subtotal' => $orderTotal,
                    'shipping_cost' => $totalShippingCost, // Pass MP-ORDERS-SHIPPING-V1-02: Sum of per-producer shipping
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

                // Pass MP-ORDERS-SHIPPING-V1-02: Create per-producer shipping lines
                foreach ($shippingLines as $line) {
                    OrderShippingLine::create([
                        'order_id' => $order->id,
                        'producer_id' => $line['producer_id'],
                        'producer_name' => $line['producer_name'],
                        'subtotal' => $line['subtotal'],
                        'shipping_cost' => $line['shipping_cost'],
                        'shipping_method' => $line['shipping_method'],
                        'free_shipping_applied' => $line['free_shipping_applied'],
                    ]);
                }

                // Load relationships for response
                $order->load(['orderItems.producer', 'shippingLines'])->loadCount('orderItems');

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
