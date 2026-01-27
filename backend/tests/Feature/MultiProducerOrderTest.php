<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderShippingLine;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass MP-ORDERS-SHIPPING-V1-02: Multi-producer order tests
 * Updated for Pass MP-ORDERS-SPLIT-01: CheckoutSession response format
 *
 * Tests for multi-producer checkout with per-producer shipping lines.
 */
class MultiProducerOrderTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that multi-producer order creates correct number of shipping lines.
     * Updated: Now returns CheckoutSession with N child orders.
     */
    public function test_multi_producer_order_creates_shipping_lines(): void
    {
        // Create test data: 2 producers with products
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer Alpha']);
        $producer2 = Producer::factory()->create(['name' => 'Producer Beta']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 20.00,
            'stock' => 100,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 15.00,
            'stock' => 100,
        ]);

        // Create multi-producer order
        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1],
                ['product_id' => $product2->id, 'quantity' => 2],
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Pass MP-ORDERS-SPLIT-01: Multi-producer now returns CheckoutSession
        $this->assertEquals('checkout_session', $response->json('data.type'));
        $this->assertTrue($response->json('data.is_multi_producer'));

        // Each child order has 1 shipping line
        $orders = $response->json('data.orders');
        $this->assertCount(2, $orders);

        // Total shipping lines = 2 (one per child order)
        $totalShippingLines = OrderShippingLine::count();
        $this->assertEquals(2, $totalShippingLines, 'Should have 2 shipping lines for 2 producers');

        // Verify each producer has a shipping line
        $this->assertDatabaseHas('order_shipping_lines', ['producer_id' => $producer1->id]);
        $this->assertDatabaseHas('order_shipping_lines', ['producer_id' => $producer2->id]);
    }

    /**
     * Test that shipping_total equals sum of shipping_cost across lines.
     * Updated: Now returns CheckoutSession.
     */
    public function test_shipping_total_equals_sum_of_line_costs(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer One']);
        $producer2 = Producer::factory()->create(['name' => 'Producer Two']);

        // Products below free shipping threshold (€35)
        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 20.00, // Below €35 threshold
            'stock' => 100,
            'weight_per_unit' => 0.5,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 25.00, // Below €35 threshold
            'stock' => 100,
            'weight_per_unit' => 0.5,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1], // €20 subtotal
                ['product_id' => $product2->id, 'quantity' => 1], // €25 subtotal
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
            'shipping_address' => ['postal_code' => '10551'],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Pass MP-ORDERS-SPLIT-01: shipping_total is on CheckoutSession
        $shippingTotal = (float) $response->json('data.shipping_total');

        // Sum of child order shipping costs
        $orders = $response->json('data.orders');
        $sumOfLines = collect($orders)->sum(fn ($order) => (float) $order['shipping_cost']);

        $this->assertEquals(
            $shippingTotal,
            $sumOfLines,
            'shipping_total should equal sum of shipping_cost across orders'
        );

        // INVARIANT: Both below threshold => both charge shipping > 0, not flat rate
        $this->assertGreaterThan(0, $shippingTotal);
        $this->assertNotEquals(7.00, $shippingTotal);
    }

    /**
     * Test order total invariant: total = subtotal + shipping_total.
     * Updated: Now returns CheckoutSession.
     */
    public function test_order_total_invariant_holds(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Farm A']);
        $producer2 = Producer::factory()->create(['name' => 'Farm B']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 40.00, // Above €35 threshold → free shipping
            'stock' => 100,
            'weight_per_unit' => 0.5,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 18.00, // Below €35 threshold → shipping charged
            'stock' => 100,
            'weight_per_unit' => 0.5,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1], // €40 + free
                ['product_id' => $product2->id, 'quantity' => 1], // €18 + shipping
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
            'shipping_address' => ['postal_code' => '10551'],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Pass MP-ORDERS-SPLIT-01: Totals are on CheckoutSession
        $subtotal = (float) $response->json('data.subtotal'); // €58.00
        $shippingTotal = (float) $response->json('data.shipping_total'); // €3.50
        $total = (float) $response->json('data.total'); // €61.50

        // Invariant: total = subtotal + shipping_total (tax is 0 in this system)
        $expected = $subtotal + $shippingTotal;

        $this->assertEquals(
            number_format($expected, 2),
            number_format($total, 2),
            "Invariant violated: total ($total) should equal subtotal ($subtotal) + shipping ($shippingTotal)"
        );

        // Verify free shipping applied for producer1's order
        $orders = $response->json('data.orders');
        $producer1Order = collect($orders)->first(fn ($o) => (float) $o['subtotal'] === 40.0);
        $producer2Order = collect($orders)->first(fn ($o) => (float) $o['subtotal'] === 18.0);

        $this->assertEquals('0.00', $producer1Order['shipping_cost'], 'Producer 1 should have free shipping (€40 > €35)');
        // INVARIANT: Below threshold => shipping > 0 and not flat rate
        $this->assertGreaterThan(0, (float) $producer2Order['shipping_cost'], 'Producer 2 should pay shipping (€18 < €35)');
        $this->assertNotEquals(3.50, (float) $producer2Order['shipping_cost']);
    }

    /**
     * Test single producer order still works (backward compatibility).
     */
    public function test_single_producer_order_creates_one_shipping_line(): void
    {
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create(['name' => 'Solo Producer']);

        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 25.00,
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2], // €50 total → free shipping
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Single producer = Order response (not CheckoutSession)
        $this->assertNull($response->json('data.type')); // Order doesn't have 'type'
        $this->assertFalse($response->json('data.is_multi_producer'));

        // 1 shipping line for the single producer
        $orderId = $response->json('data.id');
        $shippingLines = OrderShippingLine::where('order_id', $orderId)->get();
        $this->assertCount(1, $shippingLines);

        // €50 > €35 → free shipping
        $this->assertTrue($shippingLines->first()->free_shipping_applied);
        $this->assertEquals(0.00, (float) $shippingLines->first()->shipping_cost);
    }

    /**
     * Test PICKUP shipping method is always free.
     * Updated: Now returns CheckoutSession.
     */
    public function test_pickup_shipping_is_always_free(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Pickup Producer 1']);
        $producer2 = Producer::factory()->create(['name' => 'Pickup Producer 2']);

        // Products below threshold
        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 10.00,
            'stock' => 100,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 15.00,
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1],
                ['product_id' => $product2->id, 'quantity' => 1],
            ],
            'shipping_method' => 'PICKUP', // Should be free regardless of subtotal
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Pass MP-ORDERS-SPLIT-01: shipping_total is on CheckoutSession
        $shippingTotal = (float) $response->json('data.shipping_total');
        $this->assertEquals(0.00, $shippingTotal, 'PICKUP shipping should always be free');

        // All child orders should have free shipping
        $orders = $response->json('data.orders');
        foreach ($orders as $order) {
            $this->assertEquals('0.00', $order['shipping_cost'], 'PICKUP should apply free shipping');
        }

        // Verify in database
        $allLines = OrderShippingLine::all();
        foreach ($allLines as $line) {
            $this->assertTrue($line->free_shipping_applied);
            $this->assertEquals(0.00, (float) $line->shipping_cost);
        }
    }
}
