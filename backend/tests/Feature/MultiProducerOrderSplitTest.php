<?php

namespace Tests\Feature;

use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\OrderShippingLine;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass MP-ORDERS-SPLIT-01: Multi-producer order splitting tests
 *
 * Tests for CheckoutSession creation and order splitting for multi-producer carts.
 */
class MultiProducerOrderSplitTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that multi-producer checkout creates a CheckoutSession.
     */
    public function test_multi_producer_checkout_creates_checkout_session(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer Alpha']);
        $producer2 = Producer::factory()->create(['name' => 'Producer Beta']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 25.00,
            'stock' => 100,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 20.00,
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1],
                ['product_id' => $product2->id, 'quantity' => 1],
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Verify response is a CheckoutSession
        $response->assertJsonStructure([
            'data' => [
                'id',
                'type',
                'status',
                'is_multi_producer',
                'order_count',
                'subtotal',
                'shipping_total',
                'total',
                'orders',
            ],
        ]);

        $this->assertEquals('checkout_session', $response->json('data.type'));
        $this->assertTrue($response->json('data.is_multi_producer'));
        $this->assertEquals(2, $response->json('data.order_count'));

        // Verify CheckoutSession exists in database
        $sessionId = $response->json('data.id');
        $this->assertDatabaseHas('checkout_sessions', [
            'id' => $sessionId,
            'user_id' => $user->id,
            'order_count' => 2,
        ]);
    }

    /**
     * Test that multi-producer checkout creates N child orders.
     */
    public function test_multi_producer_checkout_creates_child_orders(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Farm A']);
        $producer2 = Producer::factory()->create(['name' => 'Farm B']);
        $producer3 = Producer::factory()->create(['name' => 'Farm C']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 30.00,
            'stock' => 100,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 25.00,
            'stock' => 100,
        ]);
        $product3 = Product::factory()->create([
            'producer_id' => $producer3->id,
            'price' => 15.00,
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1],
                ['product_id' => $product2->id, 'quantity' => 2],
                ['product_id' => $product3->id, 'quantity' => 1],
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Should have 3 child orders (one per producer)
        $this->assertEquals(3, $response->json('data.order_count'));

        $orders = $response->json('data.orders');
        $this->assertCount(3, $orders);

        // All orders should be linked to same checkout session
        $sessionId = $response->json('data.id');
        foreach ($orders as $order) {
            $this->assertEquals($sessionId, $order['checkout_session_id']);
            $this->assertTrue($order['is_child_order']);
        }

        // Verify in database
        $childOrders = Order::where('checkout_session_id', $sessionId)->get();
        $this->assertCount(3, $childOrders);
    }

    /**
     * Test that each child order contains only items from its producer.
     */
    public function test_child_orders_contain_only_producer_items(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer X']);
        $producer2 = Producer::factory()->create(['name' => 'Producer Y']);

        $product1a = Product::factory()->create([
            'producer_id' => $producer1->id,
            'name' => 'Product 1A',
            'price' => 10.00,
            'stock' => 100,
        ]);
        $product1b = Product::factory()->create([
            'producer_id' => $producer1->id,
            'name' => 'Product 1B',
            'price' => 15.00,
            'stock' => 100,
        ]);
        $product2a = Product::factory()->create([
            'producer_id' => $producer2->id,
            'name' => 'Product 2A',
            'price' => 20.00,
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1a->id, 'quantity' => 1], // Producer 1: €10
                ['product_id' => $product1b->id, 'quantity' => 2], // Producer 1: €30
                ['product_id' => $product2a->id, 'quantity' => 1], // Producer 2: €20
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        $orders = $response->json('data.orders');

        // Find order for producer 1
        $producer1Order = collect($orders)->first(fn ($o) =>
            collect($o['items'] ?? $o['order_items'] ?? [])->contains('product_name', 'Product 1A')
        );

        // Find order for producer 2
        $producer2Order = collect($orders)->first(fn ($o) =>
            collect($o['items'] ?? $o['order_items'] ?? [])->contains('product_name', 'Product 2A')
        );

        // Verify producer 1 order has 2 items
        $items1 = $producer1Order['items'] ?? $producer1Order['order_items'] ?? [];
        $this->assertCount(2, $items1);
        $this->assertEquals('40.00', $producer1Order['subtotal']); // €10 + €30

        // Verify producer 2 order has 1 item
        $items2 = $producer2Order['items'] ?? $producer2Order['order_items'] ?? [];
        $this->assertCount(1, $items2);
        $this->assertEquals('20.00', $producer2Order['subtotal']);
    }

    /**
     * Test that checkout session totals equal sum of child orders.
     */
    public function test_checkout_session_totals_equal_sum_of_orders(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Sum Producer 1']);
        $producer2 = Producer::factory()->create(['name' => 'Sum Producer 2']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 40.00, // >= €35, free shipping
            'stock' => 100,
            'weight_per_unit' => 0.5,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 20.00, // < €35, shipping charged
            'stock' => 100,
            'weight_per_unit' => 0.5,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1], // €40 + €0
                ['product_id' => $product2->id, 'quantity' => 1], // €20 + shipping
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
            'shipping_address' => ['postal_code' => '10551'],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Session totals
        $sessionSubtotal = (float) $response->json('data.subtotal');
        $sessionShipping = (float) $response->json('data.shipping_total');
        $sessionTotal = (float) $response->json('data.total');

        // Sum of orders
        $orders = $response->json('data.orders');
        $ordersSubtotal = collect($orders)->sum(fn ($o) => (float) $o['subtotal']);
        $ordersShipping = collect($orders)->sum(fn ($o) => (float) $o['shipping_cost']);
        $ordersTotal = collect($orders)->sum(fn ($o) => (float) $o['total']);

        // Verify invariants
        $this->assertEquals($ordersSubtotal, $sessionSubtotal, 'Session subtotal should equal sum of order subtotals');
        $this->assertEquals($ordersShipping, $sessionShipping, 'Session shipping should equal sum of order shipping');
        $this->assertEquals($ordersTotal, $sessionTotal, 'Session total should equal sum of order totals');

        // Verify expected values
        $this->assertEquals(60.00, $sessionSubtotal); // €40 + €20
        // INVARIANT: shipping > 0 (one producer below threshold) and not flat rate
        $this->assertGreaterThan(0, $sessionShipping);
        $this->assertNotEquals(3.50, $sessionShipping);
        // Total = subtotal + shipping
        $this->assertEquals($sessionSubtotal + $sessionShipping, $sessionTotal);
    }

    /**
     * Test that single-producer checkout still returns Order (backward compatible).
     */
    public function test_single_producer_checkout_returns_order(): void
    {
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create(['name' => 'Solo Producer']);

        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 30.00,
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Should return Order, not CheckoutSession
        $this->assertNull($response->json('data.type')); // Order doesn't have 'type' field
        $this->assertNotNull($response->json('data.order_number')); // Order has order_number
        $this->assertNull($response->json('data.checkout_session_id'));
        $this->assertFalse($response->json('data.is_child_order'));

        // No CheckoutSession created
        $this->assertEquals(0, CheckoutSession::count());
    }

    /**
     * Test that each child order has its own shipping line.
     */
    public function test_each_child_order_has_shipping_line(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Shipping Producer 1']);
        $producer2 = Producer::factory()->create(['name' => 'Shipping Producer 2']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 50.00, // Free shipping
            'stock' => 100,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 15.00, // €3.50 shipping
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1],
                ['product_id' => $product2->id, 'quantity' => 1],
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        $orders = $response->json('data.orders');

        foreach ($orders as $order) {
            // Each child order should have exactly 1 shipping line in the database
            $dbShippingLines = OrderShippingLine::where('order_id', $order['id'])->get();
            $this->assertCount(1, $dbShippingLines);

            // Verify shipping line is linked to correct order
            $this->assertEquals($order['id'], $dbShippingLines->first()->order_id);
        }

        // Total shipping lines = 2 (one per order)
        $this->assertEquals(2, OrderShippingLine::count());
    }

    /**
     * Test checkout session status is pending after creation.
     */
    public function test_checkout_session_status_is_pending(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create();
        $producer2 = Producer::factory()->create();

        $product1 = Product::factory()->create(['producer_id' => $producer1->id, 'price' => 20.00, 'stock' => 100]);
        $product2 = Product::factory()->create(['producer_id' => $producer2->id, 'price' => 25.00, 'stock' => 100]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', [
                'items' => [
                    ['product_id' => $product1->id, 'quantity' => 1],
                    ['product_id' => $product2->id, 'quantity' => 1],
                ],
                'shipping_method' => 'HOME',
                'currency' => 'EUR',
            ]);

        $response->assertStatus(201);

        $this->assertEquals('pending', $response->json('data.status'));

        // All child orders should also be pending
        $orders = $response->json('data.orders');
        foreach ($orders as $order) {
            $this->assertEquals('pending', $order['status']);
            $this->assertEquals('pending', $order['payment_status']);
        }
    }
}
