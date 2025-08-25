<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/health', function () {
    try {
        // Test database connection
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'failed: ' . $e->getMessage();
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
    // Products (public)
    Route::get('products', [App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('products/{product}', [App\Http\Controllers\Api\ProductController::class, 'show']);
    
    // Enhanced Public Products API
    Route::prefix('public')->group(function () {
        Route::get('products', [App\Http\Controllers\Public\ProductController::class, 'index']);
        Route::get('products/{id}', [App\Http\Controllers\Public\ProductController::class, 'show']);
    });
    
    // Cart (authenticated)
    Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
        Route::get('items', [App\Http\Controllers\Api\CartController::class, 'index']);
        Route::post('items', [App\Http\Controllers\Api\CartController::class, 'store'])
            ->middleware('throttle:30,1'); // 30 requests per minute for cart additions
        Route::patch('items/{cartItem}', [App\Http\Controllers\Api\CartController::class, 'update']);
        Route::delete('items/{cartItem}', [App\Http\Controllers\Api\CartController::class, 'destroy']);
    });
    
    // Orders (authenticated)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
        Route::post('orders', [App\Http\Controllers\Api\OrderController::class, 'store'])
            ->middleware('throttle:10,1'); // 10 requests per minute for order creation
        Route::post('orders/checkout', [App\Http\Controllers\Api\OrderController::class, 'checkout'])
            ->middleware('throttle:5,1'); // 5 checkouts per minute
        Route::get('orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'show']);
    });
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
                'description' => 'Production API Server'
            ]
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
                                            'version' => ['type' => 'string', 'example' => '11.45.2']
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
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
                            'schema' => ['type' => 'string']
                        ],
                        [
                            'name' => 'category',
                            'in' => 'query', 
                            'description' => 'Filter by category slug',
                            'schema' => ['type' => 'string']
                        ],
                        [
                            'name' => 'sort',
                            'in' => 'query',
                            'description' => 'Sort field (price, name, created_at)',
                            'schema' => ['type' => 'string', 'enum' => ['price', 'name', 'created_at']]
                        ],
                        [
                            'name' => 'dir',
                            'in' => 'query',
                            'description' => 'Sort direction (asc, desc)', 
                            'schema' => ['type' => 'string', 'enum' => ['asc', 'desc']]
                        ],
                        [
                            'name' => 'per_page',
                            'in' => 'query',
                            'description' => 'Items per page (max 100)',
                            'schema' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]
                        ]
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
                                                'items' => ['$ref' => '#/components/schemas/Product']
                                            ],
                                            'total' => ['type' => 'integer'],
                                            'per_page' => ['type' => 'integer']
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
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
                            'schema' => ['type' => 'integer']
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Product details',
                            'content' => [
                                'application/json' => [
                                    'schema' => ['$ref' => '#/components/schemas/Product']
                                ]
                            ]
                        ],
                        '404' => [
                            'description' => 'Product not found'
                        ]
                    ]
                ]
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
                                            'revenue' => ['type' => 'number']
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
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
                            'schema' => ['type' => 'integer']
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Product status toggled successfully',
                            'content' => [
                                'application/json' => [
                                    'schema' => ['$ref' => '#/components/schemas/Product']
                                ]
                            ]
                        ]
                    ]
                ]
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
                            'schema' => ['type' => 'integer']
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Message marked as read'
                        ]
                    ]
                ]
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
                            'schema' => ['type' => 'integer']
                        ]
                    ],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'content' => ['type' => 'string']
                                    ],
                                    'required' => ['content']
                                ]
                            ]
                        ]
                    ],
                    'responses' => [
                        '201' => [
                            'description' => 'Reply sent successfully'
                        ]
                    ]
                ]
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
                            'schema' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 10]
                        ]
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
                                                'items' => ['$ref' => '#/components/schemas/ProductAnalytics']
                                            ],
                                            'limit' => ['type' => 'integer'],
                                            'total_products_shown' => ['type' => 'integer']
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
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
                                                'items' => ['$ref' => '#/components/schemas/CartItem']
                                            ],
                                            'total_items' => ['type' => 'integer'],
                                            'total_amount' => ['type' => 'string', 'format' => 'decimal']
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
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
                                        'quantity' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]
                                    ],
                                    'required' => ['product_id', 'quantity']
                                ]
                            ]
                        ]
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
                                            'cart_item' => ['$ref' => '#/components/schemas/CartItem']
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        '422' => [
                            'description' => 'Validation errors (stock insufficient, product inactive, etc.)'
                        ]
                    ]
                ]
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
                            'schema' => ['type' => 'integer']
                        ]
                    ],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'quantity' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]
                                    ],
                                    'required' => ['quantity']
                                ]
                            ]
                        ]
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
                                            'cart_item' => ['$ref' => '#/components/schemas/CartItem']
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        '404' => [
                            'description' => 'Cart item not found'
                        ],
                        '422' => [
                            'description' => 'Validation errors (stock insufficient, etc.)'
                        ]
                    ]
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
                            'schema' => ['type' => 'integer']
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Item removed from cart successfully'
                        ],
                        '404' => [
                            'description' => 'Cart item not found'
                        ]
                    ]
                ]
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
                                            'default' => 'HOME'
                                        ],
                                        'notes' => ['type' => 'string', 'maxLength' => 500]
                                    ]
                                ]
                            ]
                        ]
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
                                            'order' => ['$ref' => '#/components/schemas/Order']
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        '422' => [
                            'description' => 'Validation errors (empty cart, inactive products, insufficient stock)'
                        ]
                    ]
                ]
            ]
        ],
        'components' => [
            'securitySchemes' => [
                'sanctum' => [
                    'type' => 'http',
                    'scheme' => 'bearer',
                    'bearerFormat' => 'token'
                ]
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
                                    'slug' => ['type' => 'string']
                                ]
                            ]
                        ],
                        'images' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'id' => ['type' => 'integer'],
                                    'url' => ['type' => 'string'],
                                    'is_primary' => ['type' => 'boolean'],
                                    'sort_order' => ['type' => 'integer']
                                ]
                            ]
                        ],
                        'producer' => [
                            'type' => 'object',
                            'properties' => [
                                'id' => ['type' => 'integer'],
                                'name' => ['type' => 'string']
                            ]
                        ],
                        'created_at' => ['type' => 'string', 'format' => 'date-time'],
                        'updated_at' => ['type' => 'string', 'format' => 'date-time']
                    ]
                ],
                'CartItem' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'quantity' => ['type' => 'integer'],
                        'product' => ['$ref' => '#/components/schemas/Product'],
                        'subtotal' => ['type' => 'string', 'format' => 'decimal'],
                        'created_at' => ['type' => 'string', 'format' => 'date-time'],
                        'updated_at' => ['type' => 'string', 'format' => 'date-time']
                    ]
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
                            'items' => ['$ref' => '#/components/schemas/OrderItem']
                        ]
                    ]
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
                        'product' => ['$ref' => '#/components/schemas/Product']
                    ]
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
                        'average_unit_price' => ['type' => 'string', 'format' => 'decimal']
                    ]
                ]
            ]
        ]
    ]);
});

// Producer API routes
Route::middleware('auth:sanctum')->prefix('v1/producer')->group(function () {
    // Product management
    Route::patch('products/{product}/toggle', [App\Http\Controllers\Api\ProducerController::class, 'toggleProduct']);
    
    // Dashboard
    Route::get('dashboard/kpi', [App\Http\Controllers\Api\ProducerController::class, 'kpi']);
    Route::get('dashboard/top-products', [App\Http\Controllers\Api\ProducerController::class, 'topProducts']);
    
    // Messages
    Route::patch('messages/{message}/read', [App\Http\Controllers\Api\MessageController::class, 'markAsRead']);
    Route::post('messages/{message}/replies', [App\Http\Controllers\Api\MessageController::class, 'storeReply']);
});