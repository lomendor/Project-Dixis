<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\CheckoutSessionResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShippingLine;
use App\Models\Producer;
use App\Models\Product;
use App\Services\CheckoutService;
use App\Services\InventoryService;
use App\Services\OrderEmailService;
use App\Exceptions\ShippingChangedException;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
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
     * SECURITY FIX: Public order lookup by UUID token (replaces sequential ID access).
     * Used by thank-you page and email confirmation links.
     * Token is a UUID v4, not guessable — safe for public access.
     */
    public function showByToken(string $token): OrderResource|Response
    {
        // Validate UUID v4 format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $token)) {
            abort(400, 'Invalid token format');
        }

        $order = Order::with(['orderItems.producer', 'shippingLines'])
            ->where('public_token', $token)
            ->first();

        if (!$order) {
            abort(404, 'Order not found');
        }

        $order->loadCount('orderItems');

        return new OrderResource($order);
    }

    /**
     * Create a new order with atomic transactions and stock validation.
     * Pass 53: Sends email notifications after transaction commits.
     * Pass MP-ORDERS-SPLIT-01: Multi-producer carts create CheckoutSession + N child orders.
     */
    public function store(
        StoreOrderRequest $request,
        InventoryService $inventoryService,
        OrderEmailService $emailService,
        CheckoutService $checkoutService
    ): JsonResource {
        $requestId = uniqid('order_', true); // Request tracking ID

        try {
            $this->authorize('create', Order::class);

            // Store result for afterCommit callback
            $checkoutResult = null;

            $result = DB::transaction(function () use ($request, $inventoryService, $checkoutService, $requestId, &$checkoutResult) {
                $validated = $request->validated();
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

                // Use authenticated user's ID if available, otherwise allow guest orders
                $userId = auth()->id() ?? $validated['user_id'] ?? null;

                // Pass MP-ORDERS-SPLIT-01: Use CheckoutService for order creation
                // Pass ORDER-SHIPPING-SPLIT-01: Include quoted_shipping for mismatch detection
                $checkoutResult = $checkoutService->processCheckout($userId, $productData, [
                    'shipping_method' => $validated['shipping_method'] ?? 'HOME',
                    'payment_method' => $validated['payment_method'] ?? 'COD',
                    'currency' => $validated['currency'],
                    'shipping_address' => $validated['shipping_address'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'quoted_shipping' => $validated['quoted_shipping'] ?? null,
                    'quoted_at' => $validated['quoted_at'] ?? null,
                ]);

                // Return appropriate resource based on checkout type
                if ($checkoutResult['checkout_session']) {
                    // Multi-producer: return CheckoutSession with child orders
                    return new CheckoutSessionResource($checkoutResult['checkout_session']);
                }

                // Single-producer: return the single Order (backward compatible)
                return new OrderResource($checkoutResult['orders'][0]);
            });

            // Pass 53 + HOTFIX: Send email notifications AFTER transaction commits
            // HOTFIX-MP-CHECKOUT-GUARD-01: Only send for COD orders.
            // Card payments send email after payment confirmation (in PaymentController).
            if ($checkoutResult) {
                $paymentMethod = $checkoutResult['orders'][0]->payment_method ?? 'COD';

                if ($paymentMethod === 'COD') {
                    try {
                        // Send email for each order (for multi-producer, each producer gets their own email)
                        foreach ($checkoutResult['orders'] as $order) {
                            $emailService->sendOrderPlacedNotifications($order);
                        }
                    } catch (\Exception $e) {
                        // Log but don't fail the order creation
                        \Log::error('Pass 53: Email notification failed (order still created)', [
                            'checkout_session_id' => $checkoutResult['checkout_session']?->id,
                            'order_count' => count($checkoutResult['orders']),
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            return $result;
        } catch (ShippingChangedException $e) {
            // Pass ORDER-SHIPPING-SPLIT-01: Return SHIPPING_CHANGED for frontend hard-block modal
            \Log::info('Order shipping mismatch detected', [
                'request_id' => $requestId,
                'quoted_total' => $e->quotedTotal,
                'locked_total' => $e->lockedTotal,
            ]);
            return response()->json($e->toArray(), 409);
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
