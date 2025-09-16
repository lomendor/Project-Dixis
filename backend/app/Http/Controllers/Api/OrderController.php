<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\CartItem;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(private NotificationService $notificationService)
    {
    }

    /**
     * Display user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['orderItems.product.categories', 'orderItems.product.images', 'orderItems.product.producer'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'orders' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'subtotal' => number_format($order->subtotal, 2),
                    'tax_amount' => number_format($order->tax_amount, 2),
                    'shipping_amount' => number_format($order->shipping_amount, 2),
                    'total_amount' => number_format($order->total_amount, 2),
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'shipping_method' => $order->shipping_method,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product_name,
                            'product_unit' => $item->product_unit,
                            'quantity' => $item->quantity,
                            'unit_price' => number_format($item->unit_price, 2),
                            'total_price' => number_format($item->total_price, 2),
                            'product' => $item->product ? [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                                'categories' => $item->product->categories,
                                'images' => $item->product->images,
                                'producer' => $item->product->producer,
                            ] : null,
                        ];
                    }),
                ];
            })
        ]);
    }

    /**
     * Create order from cart items (checkout)
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'shipping_method' => 'string|nullable|in:HOME,PICKUP,COURIER',
            'notes' => 'string|nullable|max:500',
        ]);

        // Get cart items for authenticated user
        $cartItems = CartItem::where('user_id', $request->user()->id)
            ->with('product')
            ->get();

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Your cart is empty. Please add items before checkout.'],
            ]);
        }

        try {
            DB::beginTransaction();

            // Validate cart items and calculate totals
            $subtotal = 0;
            $orderItems = [];
            $unavailableProducts = [];
            $insufficientStock = [];

            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;
                
                // Check if product is still active
                if (!$product->is_active) {
                    $unavailableProducts[] = $product->name;
                    continue;
                }

                // Check stock if available
                if ($product->stock !== null && $cartItem->quantity > $product->stock) {
                    $insufficientStock[] = [
                        'product' => $product->name,
                        'requested' => $cartItem->quantity,
                        'available' => $product->stock
                    ];
                    continue;
                }

                $unitPrice = $product->price;
                $totalPrice = $unitPrice * $cartItem->quantity;
                $subtotal += $totalPrice;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'product_name' => $product->name,
                    'product_unit' => $product->unit ?? 'unit',
                ];
            }

            // Handle validation errors
            if (!empty($unavailableProducts)) {
                throw ValidationException::withMessages([
                    'products' => ['The following products are no longer available: ' . implode(', ', $unavailableProducts)],
                ]);
            }

            if (!empty($insufficientStock)) {
                $stockErrors = [];
                foreach ($insufficientStock as $stockError) {
                    $stockErrors[] = "{$stockError['product']}: requested {$stockError['requested']}, only {$stockError['available']} available";
                }
                throw ValidationException::withMessages([
                    'stock' => ['Insufficient stock for: ' . implode('; ', $stockErrors)],
                ]);
            }

            if (empty($orderItems)) {
                throw ValidationException::withMessages([
                    'cart' => ['No valid items found in cart for checkout.'],
                ]);
            }

            // Calculate additional charges
            $taxAmount = $subtotal * 0.10; // 10% tax
            $shippingAmount = ($request->shipping_method === 'PICKUP') ? 0.00 : 5.00;
            $totalAmount = $subtotal + $taxAmount + $shippingAmount;

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'total_amount' => $totalAmount,
                'payment_status' => 'pending',
                'status' => 'pending',
                'shipping_method' => $request->shipping_method ?? 'HOME',
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // Reduce stock for products with stock tracking
            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;
                if ($product->stock !== null) {
                    $product->decrement('stock', $cartItem->quantity);
                }
            }

            // Clear cart after successful order creation
            CartItem::where('user_id', $request->user()->id)->delete();

            DB::commit();

            // Send order placed notification
            $this->notificationService->sendOrderPlacedNotification($order);

            // Load relationships for response
            $order->load(['orderItems.product.categories', 'orderItems.product.images', 'orderItems.product.producer']);

            return response()->json([
                'message' => 'Order created successfully from cart',
                'order' => [
                    'id' => $order->id,
                    'subtotal' => number_format($order->subtotal, 2),
                    'tax_amount' => number_format($order->tax_amount, 2),
                    'shipping_amount' => number_format($order->shipping_amount, 2),
                    'total_amount' => number_format($order->total_amount, 2),
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'shipping_method' => $order->shipping_method,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at,
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product_name,
                            'product_unit' => $item->product_unit,
                            'quantity' => $item->quantity,
                            'unit_price' => number_format($item->unit_price, 2),
                            'total_price' => number_format($item->total_price, 2),
                            'product' => $item->product ? [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                                'categories' => $item->product->categories,
                                'images' => $item->product->images,
                                'producer' => $item->product->producer,
                            ] : null,
                        ];
                    }),
                ]
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created order (manual order creation).
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Order::class);
        
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_method' => 'string|nullable',
            'notes' => 'string|nullable',
        ]);

        try {
            DB::beginTransaction();

            // Calculate totals
            $subtotal = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $unitPrice = $product->price ?? 0;
                $totalPrice = $unitPrice * $item['quantity'];
                $subtotal += $totalPrice;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'product_name' => $product->name,
                    'product_unit' => $product->unit ?? 'unit',
                ];
            }

            $taxAmount = $subtotal * 0.10; // 10% tax
            $shippingAmount = 5.00; // Fixed shipping
            $totalAmount = $subtotal + $taxAmount + $shippingAmount;

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'total_amount' => $totalAmount,
                'payment_status' => 'pending',
                'status' => 'pending',
                'shipping_method' => $validated['shipping_method'] ?? 'HOME',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            DB::commit();

            // Send order placed notification
            $this->notificationService->sendOrderPlacedNotification($order);

            // Load relationships and format response
            $order->load(['orderItems.product.categories', 'orderItems.product.images', 'orderItems.product.producer']);

            return response()->json([
                'id' => $order->id,
                'user_id' => $order->user_id,
                'subtotal' => $order->subtotal,
                'tax_amount' => $order->tax_amount,
                'shipping_amount' => $order->shipping_amount,
                'total_amount' => $order->total_amount,
                'payment_status' => $order->payment_status,
                'status' => $order->status,
                'shipping_method' => $order->shipping_method,
                'notes' => $order->notes,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                'order_items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'product_name' => $item->product_name,
                        'product_unit' => $item->product_unit,
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'categories' => $item->product->categories,
                            'images' => $item->product->images,
                            'producer' => $item->product->producer,
                        ] : null,
                    ];
                }),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create order'], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        // Ensure user can only see their own orders
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->load(['orderItems.product.categories', 'orderItems.product.images', 'orderItems.product.producer']);

        return response()->json([
            'id' => $order->id,
            'user_id' => $order->user_id,
            'subtotal' => $order->subtotal,
            'tax_amount' => $order->tax_amount,
            'shipping_amount' => $order->shipping_amount,
            'total_amount' => $order->total_amount,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'shipping_method' => $order->shipping_method,
            'notes' => $order->notes,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'order_items' => $order->orderItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'product_name' => $item->product_name,
                    'product_unit' => $item->product_unit,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'categories' => $item->product->categories,
                        'images' => $item->product->images,
                        'producer' => $item->product->producer,
                    ] : null,
                ];
            }),
        ]);
    }
}
