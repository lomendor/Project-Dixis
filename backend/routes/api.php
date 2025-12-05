<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OpsDbController;

Route::get('/health', function () {
    try {
        // Test database connection
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'failed: '.$e->getMessage();
    }

    return response()->json([
        'status' => 'ok',
        'database' => $dbStatus,
        'timestamp' => now()->toISOString(),
        'version' => app()->version(),
    ]);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Test-only login endpoint (E2E testing)
if (env('ALLOW_TEST_LOGIN', false) && (app()->environment('testing', 'local') || env('CI', false))) {
    Route::post('v1/test/login', [App\Http\Controllers\Api\TestLoginController::class, 'login'])
        ->middleware('throttle:30,1');
}

// Authentication routes
Route::prefix('v1/auth')->group(function () {
    Route::post('register', [App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('login', [App\Http\Controllers\Api\AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::post('logout-all', [App\Http\Controllers\Api\AuthController::class, 'logoutAll']);
        Route::get('profile', [App\Http\Controllers\Api\AuthController::class, 'profile']);
    });
});

// Public API v1 routes
Route::prefix('v1')->group(function () {
    // Products (public, read-only)
    Route::get('products', [App\Http\Controllers\Api\V1\ProductController::class, 'index'])->name('api.v1.products.index');
    Route::get('products/{product}', [App\Http\Controllers\Api\V1\ProductController::class, 'show'])->name('api.v1.products.show');

    // Products CRUD (authenticated)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('products', [App\Http\Controllers\Api\V1\ProductController::class, 'store'])->name('api.v1.products.store');
        Route::patch('products/{product}', [App\Http\Controllers\Api\V1\ProductController::class, 'update'])->name('api.v1.products.update');
        Route::delete('products/{product}', [App\Http\Controllers\Api\V1\ProductController::class, 'destroy'])->name('api.v1.products.destroy');
    });

    // Authenticated user orders
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders', [App\Http\Controllers\Api\OrderController::class, 'index'])->name('api.v1.orders.index');
        Route::get('orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'show'])->name('api.v1.orders.show');
        Route::post('orders', [App\Http\Controllers\Api\OrderController::class, 'store'])->name('api.v1.orders.store')
            ->middleware('throttle:10,1'); // 10 requests per minute for order creation
        Route::post('orders/checkout', [App\Http\Controllers\Api\OrderController::class, 'checkout'])->name('api.v1.orders.checkout')
            ->middleware('throttle:5,1'); // 5 checkouts per minute
    });

    // Producers (public, read-only)
    Route::get('producers', [App\Http\Controllers\Api\V1\ProducerController::class, 'index'])->name('api.v1.producers.index');
    Route::get('producers/{producer}', [App\Http\Controllers\Api\V1\ProducerController::class, 'show'])->name('api.v1.producers.show');

    // Enhanced Public Products API
    Route::prefix('public')->group(function () {
        Route::get('products', [App\Http\Controllers\Public\ProductController::class, 'index']);
        Route::get('products/{id}', [App\Http\Controllers\Public\ProductController::class, 'show']);

        // Public Producers API
        Route::get('producers', [App\Http\Controllers\Public\ProducerController::class, 'index']);
        Route::get('producers/{id}', [App\Http\Controllers\Public\ProducerController::class, 'show']);

        // Public Orders API (demo access - no PII exposed)
        Route::get('orders', [App\Http\Controllers\Api\V1\OrderController::class, 'index'])->name('api.v1.public.orders.index');
        Route::get('orders/{order}', [App\Http\Controllers\Api\V1\OrderController::class, 'show'])->name('api.v1.public.orders.show');
        Route::post('orders', [App\Http\Controllers\Api\V1\OrderController::class, 'store'])->name('api.v1.public.orders.store')
            ->middleware('throttle:10,1'); // 10 requests per minute for order creation
    });

    // Cart (authenticated)
    Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
        Route::get('items', [App\Http\Controllers\Api\CartController::class, 'index']);
        Route::post('items', [App\Http\Controllers\Api\CartController::class, 'store'])
            ->middleware('throttle:30,1'); // 30 requests per minute for cart additions
        Route::patch('items/{cartItem}', [App\Http\Controllers\Api\CartController::class, 'update']);
        Route::delete('items/{cartItem}', [App\Http\Controllers\Api\CartController::class, 'destroy']);
    });

    // Shipping routes
    Route::prefix('shipping')->group(function () {
        // Public quote endpoint
        Route::post('quote', [App\Http\Controllers\Api\ShippingController::class, 'getQuote'])
            ->middleware('throttle:60,1'); // 60 quote requests per minute

        // Public tracking endpoint
        Route::get('tracking/{trackingCode}', [App\Http\Controllers\Api\ShippingController::class, 'getTracking'])
            ->middleware('throttle:60,1'); // 60 tracking requests per minute

        // Admin-only label creation
        Route::post('labels/{order}', [App\Http\Controllers\Api\ShippingController::class, 'createLabel'])
            ->middleware(['auth:sanctum', 'throttle:10,1']); // Admin only, 10 label requests per minute

        // Public locker search endpoint (feature-flagged)
        Route::get('lockers/search', [App\Http\Controllers\Api\LockerController::class, 'search'])
            ->middleware('throttle:60,1'); // 60 locker search requests per minute
    });

    // Order shipment details (authenticated users)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders/{order}/shipment', [App\Http\Controllers\Api\ShippingController::class, 'getOrderShipment']);
    });

    // Payment methods (public - no auth required)
    Route::get('payment/methods', [App\Http\Controllers\Api\PaymentController::class, 'getPaymentMethods']);

    // Payments (authenticated)
    Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
        Route::post('orders/{order}/init', [App\Http\Controllers\Api\PaymentController::class, 'initPayment'])
            ->middleware('throttle:10,1'); // 10 payment inits per minute
        Route::post('orders/{order}/confirm', [App\Http\Controllers\Api\PaymentController::class, 'confirmPayment'])
            ->middleware('throttle:20,1'); // 20 confirmations per minute
        Route::post('orders/{order}/cancel', [App\Http\Controllers\Api\PaymentController::class, 'cancelPayment'])
            ->middleware('throttle:10,1'); // 10 cancellations per minute
        Route::get('orders/{order}/status', [App\Http\Controllers\Api\PaymentController::class, 'getPaymentStatus'])
            ->middleware('throttle:30,1'); // 30 status checks per minute
    });

    // Refunds (admin only - simplified auth for now)
    Route::middleware('auth:sanctum')->prefix('refunds')->group(function () {
        Route::get('orders', [App\Http\Controllers\Api\RefundController::class, 'index'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::post('orders/{order}', [App\Http\Controllers\Api\RefundController::class, 'create'])
            ->middleware('throttle:5,1'); // 5 refunds per minute
        Route::get('orders/{order}', [App\Http\Controllers\Api\RefundController::class, 'show'])
            ->middleware('throttle:30,1'); // 30 status checks per minute
    });

    // Notifications (authenticated users)
    Route::middleware('auth:sanctum')->prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\NotificationController::class, 'index'])
            ->middleware('throttle:100,1'); // 100 requests per minute
        Route::get('unread-count', [App\Http\Controllers\Api\NotificationController::class, 'unreadCount'])
            ->middleware('throttle:120,1'); // 120 requests per minute
        Route::get('latest', [App\Http\Controllers\Api\NotificationController::class, 'latest'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::patch('{notification}/read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::patch('read-all', [App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead'])
            ->middleware('throttle:10,1'); // 10 requests per minute
    });

    // Admin Analytics (simplified auth for now - should be admin middleware in production)
    Route::middleware('auth:sanctum')->prefix('admin/analytics')->group(function () {
        Route::get('sales', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'sales'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('orders', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'orders'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('products', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'products'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('producers', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'producers'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('dashboard', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'dashboard'])
            ->middleware('throttle:120,1'); // 120 requests per minute for dashboard
    });

    // Admin Shipping (read-only rate tables interface)
    Route::middleware('auth:sanctum')->prefix('admin/shipping')->group(function () {
        Route::get('rates', [App\Http\Controllers\Api\Admin\ShippingController::class, 'getRates'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('zones', [App\Http\Controllers\Api\Admin\ShippingController::class, 'getZoneInfo'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('simulate', [App\Http\Controllers\Api\Admin\ShippingController::class, 'simulateQuote'])
            ->middleware('throttle:30,1'); // 30 simulations per minute
    });

});

// Webhook routes (no authentication - verified by signature)
Route::prefix('webhooks')->group(function () {
    Route::post('stripe', [App\Http\Controllers\Api\WebhookController::class, 'stripe']);
    Route::post('viva', [App\Http\Controllers\Api\WebhookController::class, 'viva']);
    Route::post('payment', [App\Http\Controllers\Api\WebhookController::class, 'payment']);
});

// OpenAPI Documentation
Route::get('v1/openapi.json', function () {
    return response()->json([
        'openapi' => '3.0.3',
        'info' => [
            'title' => 'Dixis API',
            'description' => 'Greek local produce marketplace API',
            'version' => '1.0.0',
        ],
        'servers' => [
            [
                'url' => url('/api'),
                'description' => 'Production API Server',
            ],
        ],
        'paths' => [
            '/health' => [
                'get' => [
                    'summary' => 'Health Check',
                    'description' => 'Check API and database connectivity',
                    'responses' => [
                        '200' => [
                            'description' => 'System health status',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'status' => ['type' => 'string', 'example' => 'ok'],
                                            'database' => ['type' => 'string', 'example' => 'connected'],
                                            'timestamp' => ['type' => 'string', 'format' => 'date-time'],
                                            'version' => ['type' => 'string', 'example' => '11.45.2'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            '/v1/public/products' => [
                'get' => [
                    'summary' => 'List Products',
                    'description' => 'Get paginated list of active products with filtering and sorting',
                    'parameters' => [
                        [
                            'name' => 'search',
                            'in' => 'query',
                            'description' => 'Search in product name and description',
                            'schema' => ['type' => 'string'],
                        ],
                        [
                            'name' => 'category',
                            'in' => 'query',
                            'description' => 'Filter by category slug',
                            'schema' => ['type' => 'string'],
                        ],
                        [
                            'name' => 'sort',
                            'in' => 'query',
                            'description' => 'Sort field (price, name, created_at)',
                            'schema' => ['type' => 'string', 'enum' => ['price', 'name', 'created_at']],
                        ],
                        [
                            'name' => 'dir',
                            'in' => 'query',
                            'description' => 'Sort direction (asc, desc)',
                            'schema' => ['type' => 'string', 'enum' => ['asc', 'desc']],
                        ],
                        [
                            'name' => 'per_page',
                            'in' => 'query',
                            'description' => 'Items per page (max 100)',
                            'schema' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100],
                        ],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Paginated product list',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'current_page' => ['type' => 'integer'],
                                            'data' => [
                                                'type' => 'array',
                                                'items' => ['$ref' => '#/components/schemas/Product'],
                                            ],
                                            'total' => ['type' => 'integer'],
                                            'per_page' => ['type' => 'integer'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            '/v1/public/products/{id}' => [
                'get' => [
                    'summary' => 'Get Product Details',
                    'description' => 'Get detailed product information by ID',
                    'parameters' => [
                        [
                            'name' => 'id',
                            'in' => 'path',
                            'required' => true,
                            'description' => 'Product ID',
                            'schema' => ['type' => 'integer'],
                        ],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Product details',
                            'content' => [
                                'application/json' => [
                                    'schema' => ['$ref' => '#/components/schemas/Product'],
                                ],
                            ],
                        ],
                        '404' => [
                            'description' => 'Product not found',
                        ],
                    ],
                ],
            ],
            '/v1/producer/dashboard/kpi' => [
                'get' => [
                    'summary' => 'Producer KPI Dashboard',
                    'description' => 'Get key performance indicators for producer',
                    'security' => [['sanctum' => []]],
                    'responses' => [
                        '200' => [
                            'description' => 'Producer KPI data',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'total_products' => ['type' => 'integer'],
                                            'active_products' => ['type' => 'integer'],
                                            'total_orders' => ['type' => 'integer'],
                                            'revenue' => ['type' => 'number'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            '/v1/producer/products/{product}/toggle' => [
                'patch' => [
                    'summary' => 'Toggle Product Status',
                    'description' => 'Toggle active/inactive status of a product',
                    'security' => [['sanctum' => []]],
                    'parameters' => [
                        [
                            'name' => 'product',
                            'in' => 'path',
                            'required' => true,
                            'description' => 'Product ID',
                            'schema' => ['type' => 'integer'],
                        ],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Product status toggled successfully',
                            'content' => [
                                'application/json' => [
                                    'schema' => ['$ref' => '#/components/schemas/Product'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            '/v1/producer/messages/{message}/read' => [
                'patch' => [
                    'summary' => 'Mark Message as Read',
                    'description' => 'Mark a message as read by the producer',
                    'security' => [['sanctum' => []]],
                    'parameters' => [
                        [
                            'name' => 'message',
                            'in' => 'path',
                            'required' => true,
                            'description' => 'Message ID',
                            'schema' => ['type' => 'integer'],
                        ],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Message marked as read',
                        ],
                    ],
                ],
            ],
            '/v1/producer/messages/{message}/replies' => [
                'post' => [
                    'summary' => 'Reply to Message',
                    'description' => 'Send a reply to a message',
                    'security' => [['sanctum' => []]],
                    'parameters' => [
                        [
                            'name' => 'message',
                            'in' => 'path',
                            'required' => true,
                            'description' => 'Message ID',
                            'schema' => ['type' => 'integer'],
                        ],
                    ],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'content' => ['type' => 'string'],
                                    ],
                                    'required' => ['content'],
                                ],
                            ],
                        ],
                    ],
                    'responses' => [
                        '201' => [
                            'description' => 'Reply sent successfully',
                        ],
                    ],
                ],
            ],
            '/v1/producer/dashboard/top-products' => [
                'get' => [
                    'summary' => 'Get Top-Selling Products',
                    'description' => 'Get top-selling products for producer dashboard with sales analytics',
                    'security' => [['sanctum' => []]],
                    'parameters' => [
                        [
                            'name' => 'limit',
                            'in' => 'query',
                            'description' => 'Maximum number of products to return (1-50)',
                            'schema' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 10],
                        ],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Top-selling products with analytics',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'top_products' => [
                                                'type' => 'array',
                                                'items' => ['$ref' => '#/components/schemas/ProductAnalytics'],
                                            ],
                                            'limit' => ['type' => 'integer'],
                                            'total_products_shown' => ['type' => 'integer'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            '/v1/cart/items' => [
                'get' => [
                    'summary' => 'Get Cart Items',
                    'description' => 'Get all cart items for authenticated user',
                    'security' => [['sanctum' => []]],
                    'responses' => [
                        '200' => [
                            'description' => 'User cart items',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'cart_items' => [
                                                'type' => 'array',
                                                'items' => ['$ref' => '#/components/schemas/CartItem'],
                                            ],
                                            'total_items' => ['type' => 'integer'],
                                            'total_amount' => ['type' => 'string', 'format' => 'decimal'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'post' => [
                    'summary' => 'Add Item to Cart',
                    'description' => 'Add a product to the user cart or increase quantity if already exists',
                    'security' => [['sanctum' => []]],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'product_id' => ['type' => 'integer'],
                                        'quantity' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100],
                                    ],
                                    'required' => ['product_id', 'quantity'],
                                ],
                            ],
                        ],
                    ],
                    'responses' => [
                        '201' => [
                            'description' => 'Item added to cart successfully',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'message' => ['type' => 'string'],
                                            'cart_item' => ['$ref' => '#/components/schemas/CartItem'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        '422' => [
                            'description' => 'Validation errors (stock insufficient, product inactive, etc.)',
                        ],
                    ],
                ],
            ],
            '/v1/cart/items/{cartItem}' => [
                'patch' => [
                    'summary' => 'Update Cart Item',
                    'description' => 'Update quantity of a cart item',
                    'security' => [['sanctum' => []]],
                    'parameters' => [
                        [
                            'name' => 'cartItem',
                            'in' => 'path',
                            'required' => true,
                            'description' => 'Cart Item ID',
                            'schema' => ['type' => 'integer'],
                        ],
                    ],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'quantity' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100],
                                    ],
                                    'required' => ['quantity'],
                                ],
                            ],
                        ],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Cart item updated successfully',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'message' => ['type' => 'string'],
                                            'cart_item' => ['$ref' => '#/components/schemas/CartItem'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        '404' => [
                            'description' => 'Cart item not found',
                        ],
                        '422' => [
                            'description' => 'Validation errors (stock insufficient, etc.)',
                        ],
                    ],
                ],
                'delete' => [
                    'summary' => 'Remove Cart Item',
                    'description' => 'Remove an item from the cart',
                    'security' => [['sanctum' => []]],
                    'parameters' => [
                        [
                            'name' => 'cartItem',
                            'in' => 'path',
                            'required' => true,
                            'description' => 'Cart Item ID',
                            'schema' => ['type' => 'integer'],
                        ],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Item removed from cart successfully',
                        ],
                        '404' => [
                            'description' => 'Cart item not found',
                        ],
                    ],
                ],
            ],
            '/v1/orders/checkout' => [
                'post' => [
                    'summary' => 'Checkout Cart',
                    'description' => 'Create order from current cart items and clear cart',
                    'security' => [['sanctum' => []]],
                    'requestBody' => [
                        'required' => false,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'shipping_method' => [
                                            'type' => 'string',
                                            'enum' => ['HOME', 'PICKUP', 'COURIER'],
                                            'default' => 'HOME',
                                        ],
                                        'notes' => ['type' => 'string', 'maxLength' => 500],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'responses' => [
                        '201' => [
                            'description' => 'Order created successfully from cart',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'message' => ['type' => 'string'],
                                            'order' => ['$ref' => '#/components/schemas/Order'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        '422' => [
                            'description' => 'Validation errors (empty cart, inactive products, insufficient stock)',
                        ],
                    ],
                ],
            ],
        ],
        'components' => [
            'securitySchemes' => [
                'sanctum' => [
                    'type' => 'http',
                    'scheme' => 'bearer',
                    'bearerFormat' => 'token',
                ],
            ],
            'schemas' => [
                'Product' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'name' => ['type' => 'string'],
                        'description' => ['type' => 'string'],
                        'price' => ['type' => 'string', 'format' => 'decimal'],
                        'unit' => ['type' => 'string'],
                        'stock' => ['type' => 'integer'],
                        'is_active' => ['type' => 'boolean'],
                        'categories' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'id' => ['type' => 'integer'],
                                    'name' => ['type' => 'string'],
                                    'slug' => ['type' => 'string'],
                                ],
                            ],
                        ],
                        'images' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'id' => ['type' => 'integer'],
                                    'url' => ['type' => 'string'],
                                    'is_primary' => ['type' => 'boolean'],
                                    'sort_order' => ['type' => 'integer'],
                                ],
                            ],
                        ],
                        'producer' => [
                            'type' => 'object',
                            'properties' => [
                                'id' => ['type' => 'integer'],
                                'name' => ['type' => 'string'],
                            ],
                        ],
                        'created_at' => ['type' => 'string', 'format' => 'date-time'],
                        'updated_at' => ['type' => 'string', 'format' => 'date-time'],
                    ],
                ],
                'CartItem' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'quantity' => ['type' => 'integer'],
                        'product' => ['$ref' => '#/components/schemas/Product'],
                        'subtotal' => ['type' => 'string', 'format' => 'decimal'],
                        'created_at' => ['type' => 'string', 'format' => 'date-time'],
                        'updated_at' => ['type' => 'string', 'format' => 'date-time'],
                    ],
                ],
                'Order' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'subtotal' => ['type' => 'string', 'format' => 'decimal'],
                        'tax_amount' => ['type' => 'string', 'format' => 'decimal'],
                        'shipping_amount' => ['type' => 'string', 'format' => 'decimal'],
                        'total_amount' => ['type' => 'string', 'format' => 'decimal'],
                        'payment_status' => ['type' => 'string', 'enum' => ['pending', 'completed', 'failed', 'refunded']],
                        'status' => ['type' => 'string', 'enum' => ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']],
                        'shipping_method' => ['type' => 'string', 'enum' => ['HOME', 'PICKUP', 'COURIER']],
                        'notes' => ['type' => 'string', 'nullable' => true],
                        'created_at' => ['type' => 'string', 'format' => 'date-time'],
                        'updated_at' => ['type' => 'string', 'format' => 'date-time'],
                        'items' => [
                            'type' => 'array',
                            'items' => ['$ref' => '#/components/schemas/OrderItem'],
                        ],
                    ],
                ],
                'OrderItem' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'product_id' => ['type' => 'integer'],
                        'product_name' => ['type' => 'string'],
                        'product_unit' => ['type' => 'string'],
                        'quantity' => ['type' => 'integer'],
                        'unit_price' => ['type' => 'string', 'format' => 'decimal'],
                        'total_price' => ['type' => 'string', 'format' => 'decimal'],
                        'product' => ['$ref' => '#/components/schemas/Product'],
                    ],
                ],
                'ProductAnalytics' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'name' => ['type' => 'string'],
                        'unit' => ['type' => 'string'],
                        'current_price' => ['type' => 'string', 'format' => 'decimal'],
                        'stock' => ['type' => 'integer', 'nullable' => true],
                        'is_active' => ['type' => 'boolean'],
                        'total_quantity_sold' => ['type' => 'integer'],
                        'total_revenue' => ['type' => 'string', 'format' => 'decimal'],
                        'total_orders' => ['type' => 'integer'],
                        'average_unit_price' => ['type' => 'string', 'format' => 'decimal'],
                    ],
                ],
            ],
        ],
    ]);
});

// Producer API routes
Route::middleware('auth:sanctum')->prefix('v1/producer')->group(function () {
    // Producer Profile
    Route::get('me', [App\Http\Controllers\Api\ProducerController::class, 'me']);
    Route::patch('profile', [App\Http\Controllers\Api\ProducerController::class, 'updateProfile']);

    // Product management
    Route::get('products', [App\Http\Controllers\Api\ProducerController::class, 'getProducts']);
    Route::patch('products/{product}/toggle', [App\Http\Controllers\Api\ProducerController::class, 'toggleProduct']);
    Route::patch('products/{product}/stock', [App\Http\Controllers\Api\ProducerController::class, 'updateStock']);

    // Dashboard
    Route::get('dashboard/kpi', [App\Http\Controllers\Api\ProducerController::class, 'kpi']);
    Route::get('dashboard/top-products', [App\Http\Controllers\Api\ProducerController::class, 'topProducts']);

    // Messages
    Route::patch('messages/{message}/read', [App\Http\Controllers\Api\MessageController::class, 'markAsRead']);
    Route::post('messages/{message}/replies', [App\Http\Controllers\Api\MessageController::class, 'storeReply']);

    // Producer Analytics
    Route::prefix('analytics')->group(function () {
        Route::get('sales', [App\Http\Controllers\Api\Producer\ProducerAnalyticsController::class, 'sales'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('orders', [App\Http\Controllers\Api\Producer\ProducerAnalyticsController::class, 'orders'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('products', [App\Http\Controllers\Api\Producer\ProducerAnalyticsController::class, 'products'])
            ->middleware('throttle:60,1'); // 60 requests per minute
    });

    // Producer Order Management (AG126.1)
    Route::get('orders', [App\Http\Controllers\Api\Producer\ProducerOrderController::class, 'index'])
        ->middleware('throttle:60,1'); // 60 requests per minute
    Route::get('orders/{id}', [App\Http\Controllers\Api\Producer\ProducerOrderController::class, 'show'])
        ->middleware('throttle:60,1'); // 60 requests per minute
    Route::patch('orders/{id}/status', [App\Http\Controllers\Api\Producer\ProducerOrderController::class, 'updateStatus'])
        ->middleware('throttle:30,1'); // 30 status updates per minute
});

// === OPS: Commission preview (simple JSON) ===
Route::get('/ops/commission/preview', function (Illuminate\Http\Request $request) {
    // Simple token auth
    if ($request->header('x-ops-token') !== env('OPS_TOKEN')) {
        abort(404);
    }

    $channel = $request->query('channel', 'b2c') === 'b2b' ? 'b2b' : 'b2c';
    $producerId = $request->integer('producerId') ?: null;
    $categoryId = $request->integer('categoryId') ?: null;

    // Option 1: By orderId
    if ($request->has('orderId')) {
        $orderId = (int)$request->query('orderId');
        $order = \App\Models\Order::find($orderId);
        
        if (!$order) {
            return response()->json(['error' => 'order not found'], 404);
        }

        $service = app(\App\Services\CommissionService::class);
        $commission = $service->settleForOrder($order, $channel);

        return response()->json([
            'orderId' => $orderId,
            'calc' => [
                'channel' => $commission->channel,
                'order_gross' => $commission->order_gross,
                'platform_fee' => $commission->platform_fee,
                'platform_fee_vat' => $commission->platform_fee_vat,
                'producer_payout' => $commission->producer_payout,
                'currency' => $commission->currency,
            ],
        ]);
    }

    // Option 2: By amount
    if ($request->has('amount')) {
        $amount = (float)$request->query('amount');
        
        $resolver = app(\App\Services\FeeResolver::class);
        $resolved = $resolver->resolve($producerId, $categoryId, $channel);

        $platformFee = round($amount * (float)$resolved['rate'], 2);
        $platformFeeVat = round($platformFee * (float)$resolved['fee_vat_rate'], 2);
        $producerPayout = round($amount - $platformFee - $platformFeeVat, 2);

        return response()->json([
            'amount' => $amount,
            'calc' => [
                'channel' => $channel,
                'rate' => $resolved['rate'],
                'fee_vat_rate' => $resolved['fee_vat_rate'],
                'platform_fee' => $platformFee,
                'platform_fee_vat' => $platformFeeVat,
                'producer_payout' => $producerPayout,
                'source' => $resolved['source'],
            ],
        ]);
    }

    return response()->json(['error' => 'provide orderId or amount'], 400);
});

// Dixis: Commission preview (read-only; feature-flagged)
use App\Http\Controllers\Api\OrderCommissionPreviewController;
Route::get('/orders/{order}/commission-preview', [OrderCommissionPreviewController::class, 'show']);

// Ops: DB slow queries endpoint (guarded by X-Ops-Key in production)
Route::get('/ops/db/slow-queries', [OpsDbController::class, 'slow'])
    ->name('ops.db.slow');
