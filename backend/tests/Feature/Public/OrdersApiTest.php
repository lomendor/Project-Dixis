<?php

namespace Tests\Feature\Public;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('api')]
class OrdersApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test products
        $product1 = Product::factory()->create(['price' => 10.50, 'name' => 'Test Oranges']);
        $product2 = Product::factory()->create(['price' => 5.25, 'name' => 'Test Apples']);

        // Create test orders with items
        $order1 = Order::factory()->create([
            'subtotal' => 26.25,
            'shipping_cost' => 3.50,
            'total' => 29.75,
            'status' => 'completed',
            'payment_status' => 'paid',
        ]);

        $order2 = Order::factory()->create([
            'subtotal' => 15.00,
            'shipping_cost' => 2.00,
            'total' => 17.00,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        // Create order items for first order
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product1->id,
            'product_name' => $product1->name,
            'quantity' => 2,
            'unit_price' => 10.50,
            'total_price' => 21.00,
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product2->id,
            'product_name' => $product2->name,
            'quantity' => 1,
            'unit_price' => 5.25,
            'total_price' => 5.25,
        ]);

        // Create order item for second order
        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product1->id,
            'product_name' => $product1->name,
            'quantity' => 1,
            'unit_price' => 10.50,
            'total_price' => 10.50,
        ]);
    }

    public function test_orders_index_returns_paginated_json_with_required_fields(): void
    {
        $response = $this->getJson('/api/v1/public/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'order_number',
                        'status',
                        'total',
                        'total_amount', // Frontend compatibility alias
                        'currency',
                        'created_at',
                        'items_count',
                        'payment_status', // Needed for UI status display
                        'payment_method', // Needed for UI
                        'shipping_method', // Needed for UI
                        'subtotal', // Needed for order summary
                        'items', // Now included in list for UI card display
                    ],
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(2, 'data'); // Should have 2 orders

        // Verify no PII fields are present (these are sensitive)
        $orderData = $response->json('data.0');
        $this->assertArrayNotHasKey('email', $orderData);
        $this->assertArrayNotHasKey('shipping_address', $orderData);
        $this->assertArrayNotHasKey('billing_address', $orderData);
        $this->assertArrayNotHasKey('user_id', $orderData);

        // Verify order_number format
        $this->assertMatchesRegularExpression('/^ORD-\d{6}$/', $orderData['order_number']);

        // Verify currency
        $this->assertEquals('EUR', $orderData['currency']);

        // Verify items ARE included in list (for card display)
        $this->assertArrayHasKey('items', $orderData);
        $this->assertIsArray($orderData['items']);
    }

    public function test_orders_show_returns_items_and_correct_total(): void
    {
        $order = Order::first();

        $response = $this->getJson("/api/v1/public/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'order_number',
                    'status',
                    'total',
                    'total_amount', // Frontend alias
                    'currency',
                    'created_at',
                    'items_count',
                    'payment_status',
                    'payment_method',
                    'shipping_method',
                    'subtotal',
                    'items' => [
                        '*' => [
                            'id', // Item ID needed for keying
                            'product_id',
                            'product_name',
                            'product_unit', // Unit display
                            'quantity',
                            'unit_price',
                            'price', // Alias
                            'total_price',
                        ],
                    ],
                ],
            ]);

        $orderData = $response->json('data');

        // Verify items array is present and has expected count
        $this->assertIsArray($orderData['items']);
        $this->assertCount(2, $orderData['items']);
        $this->assertEquals(2, $orderData['items_count']);

        // Verify total value
        $this->assertEquals('29.75', $orderData['total']);
        $this->assertEquals('29.75', $orderData['total_amount']); // Alias

        // Verify item structure includes product_name
        $item = $orderData['items'][0];
        $this->assertArrayHasKey('product_name', $item);
        $this->assertNotEmpty($item['product_name']);
        $this->assertArrayHasKey('product_unit', $item);
    }

    public function test_orders_show_returns_404_for_nonexistent_order(): void
    {
        $response = $this->getJson('/api/v1/public/orders/99999');

        $response->assertStatus(404);
    }

    public function test_orders_index_filters_by_status(): void
    {
        // Test filtering by 'completed' status
        $response = $this->getJson('/api/v1/public/orders?status=completed');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $orderData = $response->json('data.0');
        $this->assertEquals('completed', $orderData['status']);

        // Test filtering by 'pending' status
        $response = $this->getJson('/api/v1/public/orders?status=pending');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $orderData = $response->json('data.0');
        $this->assertEquals('pending', $orderData['status']);

        // Test invalid status returns validation error
        $response = $this->getJson('/api/v1/public/orders?status=invalid');
        $response->assertStatus(422);
    }

    public function test_orders_search_by_id(): void
    {
        $order = Order::first();

        // Test search by order ID
        $response = $this->getJson("/api/v1/public/orders?q={$order->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $orderData = $response->json('data.0');
        $this->assertEquals($order->id, $orderData['id']);

        // Test search with non-numeric value returns no results
        $response = $this->getJson('/api/v1/public/orders?q=abc');
        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_orders_pagination_works(): void
    {
        $response = $this->getJson('/api/v1/public/orders?per_page=1');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data',
                'links' => [
                    'first',
                    'last',
                    'prev',
                    'next',
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_orders_data_formats_are_correct(): void
    {
        $response = $this->getJson('/api/v1/public/orders');

        $response->assertStatus(200);

        $orderData = $response->json('data.0');

        // Verify numeric fields are formatted as strings with 2 decimal places
        $this->assertMatchesRegularExpression('/^\d+\.\d{2}$/', $orderData['total']);

        // Verify created_at is ISO format
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/', $orderData['created_at']);

        // Verify order_number format
        $this->assertMatchesRegularExpression('/^ORD-\d{6}$/', $orderData['order_number']);

        // Verify items_count is integer
        $this->assertIsInt($orderData['items_count']);
    }
}
