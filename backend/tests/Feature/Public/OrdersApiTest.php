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
        
        // Create test order with items
        $order = Order::factory()->create([
            'subtotal' => 26.25,
            'shipping_cost' => 3.50,
            'total' => 29.75,
            'status' => 'paid',
            'payment_status' => 'paid'
        ]);
        
        // Create order items
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'unit_price' => 10.50,
            'total_price' => 21.00
        ]);
        
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'unit_price' => 5.25,
            'total_price' => 5.25
        ]);
    }

    public function test_orders_index_returns_paginated_json_with_required_fields(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'status',
                        'payment_status',
                        'subtotal',
                        'shipping_cost',
                        'total',
                        'created_at',
                        'items'
                    ]
                ],
                'links',
                'meta'
            ]);
        
        // Verify no PII fields are present
        $orderData = $response->json('data.0');
        $this->assertArrayNotHasKey('email', $orderData);
        $this->assertArrayNotHasKey('address', $orderData);
        $this->assertArrayNotHasKey('phone', $orderData);
        $this->assertArrayNotHasKey('user_id', $orderData);
    }

    public function test_orders_show_returns_items_and_correct_total(): void
    {
        $order = Order::first();

        $response = $this->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'payment_status',
                    'subtotal',
                    'shipping_cost',
                    'total',
                    'created_at',
                    'items' => [
                        '*' => [
                            'product_id',
                            'quantity',
                            'unit_price',
                            'total_price'
                        ]
                    ]
                ]
            ]);

        $orderData = $response->json('data');
        
        // Verify items array is present
        $this->assertIsArray($orderData['items']);
        $this->assertCount(2, $orderData['items']);
        
        // Verify total calculation: subtotal + shipping_cost = total
        $subtotal = (float) str_replace(',', '', $orderData['subtotal']);
        $shippingCost = (float) str_replace(',', '', $orderData['shipping_cost']);
        $total = (float) str_replace(',', '', $orderData['total']);
        
        $this->assertEquals($subtotal + $shippingCost, $total, 'Total should equal subtotal + shipping_cost');
        
        // Verify specific values
        $this->assertEquals('26.25', $orderData['subtotal']);
        $this->assertEquals('3.50', $orderData['shipping_cost']);
        $this->assertEquals('29.75', $orderData['total']);
    }

    public function test_orders_show_returns_404_for_nonexistent_order(): void
    {
        $response = $this->getJson('/api/v1/orders/99999');

        $response->assertStatus(404);
    }

    public function test_orders_index_includes_items_with_eager_loading(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(200);
        
        $orderData = $response->json('data.0');
        $this->assertArrayHasKey('items', $orderData);
        $this->assertIsArray($orderData['items']);
        
        // Verify item structure
        if (count($orderData['items']) > 0) {
            $item = $orderData['items'][0];
            $this->assertArrayHasKey('product_id', $item);
            $this->assertArrayHasKey('quantity', $item);
            $this->assertArrayHasKey('unit_price', $item);
            $this->assertArrayHasKey('total_price', $item);
        }
    }

    public function test_orders_data_formats_are_correct(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(200);
        
        $orderData = $response->json('data.0');
        
        // Verify numeric fields are formatted as strings with 2 decimal places
        $this->assertMatchesRegularExpression('/^\d+\.\d{2}$/', $orderData['subtotal']);
        $this->assertMatchesRegularExpression('/^\d+\.\d{2}$/', $orderData['shipping_cost']);
        $this->assertMatchesRegularExpression('/^\d+\.\d{2}$/', $orderData['total']);
        
        // Verify created_at is ISO format
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/', $orderData['created_at']);
    }
}