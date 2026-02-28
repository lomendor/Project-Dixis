<?php

/**
 * OpenAPI Documentation Route
 *
 * ARCH-FIX-04b: Extracted from routes/api.php for maintainability.
 * Serves the OpenAPI 3.0.3 specification at GET /api/v1/openapi.json
 *
 * Loaded by: routes/api.php via require __DIR__.'/openapi.php'
 */

use Illuminate\Support\Facades\Route;

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
                        ['name' => 'search', 'in' => 'query', 'description' => 'Search in product name and description', 'schema' => ['type' => 'string']],
                        ['name' => 'category', 'in' => 'query', 'description' => 'Filter by category slug', 'schema' => ['type' => 'string']],
                        ['name' => 'sort', 'in' => 'query', 'description' => 'Sort field', 'schema' => ['type' => 'string', 'enum' => ['price', 'name', 'created_at']]],
                        ['name' => 'dir', 'in' => 'query', 'description' => 'Sort direction', 'schema' => ['type' => 'string', 'enum' => ['asc', 'desc']]],
                        ['name' => 'per_page', 'in' => 'query', 'description' => 'Items per page (max 100)', 'schema' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Paginated product list',
                            'content' => ['application/json' => ['schema' => ['type' => 'object', 'properties' => ['current_page' => ['type' => 'integer'], 'data' => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/Product']], 'total' => ['type' => 'integer'], 'per_page' => ['type' => 'integer']]]]],
                        ],
                    ],
                ],
            ],
            '/v1/public/products/{id}' => [
                'get' => [
                    'summary' => 'Get Product Details',
                    'description' => 'Get detailed product information by ID',
                    'parameters' => [['name' => 'id', 'in' => 'path', 'required' => true, 'description' => 'Product ID', 'schema' => ['type' => 'integer']]],
                    'responses' => [
                        '200' => ['description' => 'Product details', 'content' => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/Product']]]],
                        '404' => ['description' => 'Product not found'],
                    ],
                ],
            ],
            '/v1/producer/dashboard/kpi' => [
                'get' => [
                    'summary' => 'Producer KPI Dashboard',
                    'security' => [['sanctum' => []]],
                    'responses' => ['200' => ['description' => 'Producer KPI data', 'content' => ['application/json' => ['schema' => ['type' => 'object', 'properties' => ['total_products' => ['type' => 'integer'], 'active_products' => ['type' => 'integer'], 'total_orders' => ['type' => 'integer'], 'revenue' => ['type' => 'number']]]]]]],
                ],
            ],
            '/v1/producer/products/{product}/toggle' => [
                'patch' => [
                    'summary' => 'Toggle Product Status',
                    'security' => [['sanctum' => []]],
                    'parameters' => [['name' => 'product', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']]],
                    'responses' => ['200' => ['description' => 'Product status toggled', 'content' => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/Product']]]]],
                ],
            ],
            '/v1/producer/messages/{message}/read' => [
                'patch' => [
                    'summary' => 'Mark Message as Read',
                    'security' => [['sanctum' => []]],
                    'parameters' => [['name' => 'message', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']]],
                    'responses' => ['200' => ['description' => 'Message marked as read']],
                ],
            ],
            '/v1/producer/messages/{message}/replies' => [
                'post' => [
                    'summary' => 'Reply to Message',
                    'security' => [['sanctum' => []]],
                    'parameters' => [['name' => 'message', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']]],
                    'requestBody' => ['required' => true, 'content' => ['application/json' => ['schema' => ['type' => 'object', 'properties' => ['content' => ['type' => 'string']], 'required' => ['content']]]]],
                    'responses' => ['201' => ['description' => 'Reply sent successfully']],
                ],
            ],
            '/v1/producer/dashboard/top-products' => [
                'get' => [
                    'summary' => 'Get Top-Selling Products',
                    'security' => [['sanctum' => []]],
                    'parameters' => [['name' => 'limit', 'in' => 'query', 'schema' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 10]]],
                    'responses' => ['200' => ['description' => 'Top-selling products with analytics', 'content' => ['application/json' => ['schema' => ['type' => 'object', 'properties' => ['top_products' => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/ProductAnalytics']], 'limit' => ['type' => 'integer'], 'total_products_shown' => ['type' => 'integer']]]]]]],
                ],
            ],
            '/v1/cart/items' => [
                'get' => ['summary' => 'Get Cart Items', 'security' => [['sanctum' => []]], 'responses' => ['200' => ['description' => 'User cart items']]],
                'post' => ['summary' => 'Add Item to Cart', 'security' => [['sanctum' => []]], 'requestBody' => ['required' => true, 'content' => ['application/json' => ['schema' => ['type' => 'object', 'properties' => ['product_id' => ['type' => 'integer'], 'quantity' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]], 'required' => ['product_id', 'quantity']]]]], 'responses' => ['201' => ['description' => 'Item added'], '422' => ['description' => 'Validation errors']]],
            ],
            '/v1/cart/items/{cartItem}' => [
                'patch' => ['summary' => 'Update Cart Item', 'security' => [['sanctum' => []]], 'parameters' => [['name' => 'cartItem', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']]], 'responses' => ['200' => ['description' => 'Cart item updated'], '404' => ['description' => 'Not found']]],
                'delete' => ['summary' => 'Remove Cart Item', 'security' => [['sanctum' => []]], 'parameters' => [['name' => 'cartItem', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']]], 'responses' => ['200' => ['description' => 'Item removed'], '404' => ['description' => 'Not found']]],
            ],
            '/v1/orders/checkout' => [
                'post' => ['summary' => 'Checkout Cart', 'security' => [['sanctum' => []]], 'responses' => ['201' => ['description' => 'Order created'], '422' => ['description' => 'Validation errors']]],
            ],
        ],
        'components' => [
            'securitySchemes' => [
                'sanctum' => ['type' => 'http', 'scheme' => 'bearer', 'bearerFormat' => 'token'],
            ],
            'schemas' => [
                'Product' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'name' => ['type' => 'string'], 'description' => ['type' => 'string'], 'price' => ['type' => 'string', 'format' => 'decimal'], 'unit' => ['type' => 'string'], 'stock' => ['type' => 'integer'], 'is_active' => ['type' => 'boolean'], 'categories' => ['type' => 'array', 'items' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'name' => ['type' => 'string'], 'slug' => ['type' => 'string']]]], 'images' => ['type' => 'array', 'items' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'url' => ['type' => 'string'], 'is_primary' => ['type' => 'boolean'], 'sort_order' => ['type' => 'integer']]]], 'producer' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'name' => ['type' => 'string']]], 'created_at' => ['type' => 'string', 'format' => 'date-time'], 'updated_at' => ['type' => 'string', 'format' => 'date-time']]],
                'CartItem' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'quantity' => ['type' => 'integer'], 'product' => ['$ref' => '#/components/schemas/Product'], 'subtotal' => ['type' => 'string', 'format' => 'decimal']]],
                'Order' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'subtotal' => ['type' => 'string', 'format' => 'decimal'], 'total_amount' => ['type' => 'string', 'format' => 'decimal'], 'status' => ['type' => 'string', 'enum' => ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']], 'items' => ['type' => 'array', 'items' => ['$ref' => '#/components/schemas/OrderItem']]]],
                'OrderItem' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'product_id' => ['type' => 'integer'], 'product_name' => ['type' => 'string'], 'quantity' => ['type' => 'integer'], 'unit_price' => ['type' => 'string', 'format' => 'decimal'], 'total_price' => ['type' => 'string', 'format' => 'decimal']]],
                'ProductAnalytics' => ['type' => 'object', 'properties' => ['id' => ['type' => 'integer'], 'name' => ['type' => 'string'], 'total_quantity_sold' => ['type' => 'integer'], 'total_revenue' => ['type' => 'string', 'format' => 'decimal'], 'total_orders' => ['type' => 'integer']]],
            ],
        ],
    ]);
});
