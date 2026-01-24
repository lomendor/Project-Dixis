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
 *
 * Tests for multi-producer checkout with per-producer shipping lines.
 */
class MultiProducerOrderTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that multi-producer order creates correct number of shipping lines.
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

        // Verify shipping lines created
        // Note: OrderResource wraps response in 'data' key
        $orderId = $response->json('data.id');
        $shippingLines = OrderShippingLine::where('order_id', $orderId)->get();

        $this->assertCount(2, $shippingLines, 'Should have 2 shipping lines for 2 producers');

        // Verify each producer has a shipping line
        $this->assertTrue(
            $shippingLines->contains('producer_id', $producer1->id),
            'Should have shipping line for Producer Alpha'
        );
        $this->assertTrue(
            $shippingLines->contains('producer_id', $producer2->id),
            'Should have shipping line for Producer Beta'
        );

        // Verify response includes shipping_lines (wrapped in 'data' by OrderResource)
        $response->assertJsonStructure([
            'data' => [
                'shipping_lines' => [
                    '*' => [
                        'producer_id',
                        'producer_name',
                        'subtotal',
                        'shipping_cost',
                        'shipping_method',
                        'free_shipping_applied',
                    ],
                ],
                'shipping_total',
                'is_multi_producer',
            ],
        ]);

        $this->assertTrue($response->json('data.is_multi_producer'));
    }

    /**
     * Test that shipping_total equals sum of shipping_cost across lines.
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
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 25.00, // Below €35 threshold
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1], // €20 subtotal
                ['product_id' => $product2->id, 'quantity' => 1], // €25 subtotal
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

        // Both producers below threshold: 2 × €3.50 = €7.00
        $shippingTotal = (float) $response->json('data.shipping_total');
        $shippingLines = $response->json('data.shipping_lines');

        $sumOfLines = collect($shippingLines)->sum(fn ($line) => (float) $line['shipping_cost']);

        $this->assertEquals(
            $shippingTotal,
            $sumOfLines,
            'shipping_total should equal sum of shipping_cost across lines'
        );

        // Verify exact values: 2 producers × €3.50 flat rate = €7.00
        $this->assertEquals(7.00, $shippingTotal);
    }

    /**
     * Test order total invariant: total = subtotal + shipping_total.
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
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 18.00, // Below €35 threshold → €3.50 shipping
            'stock' => 100,
        ]);

        $orderData = [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 1], // €40 + free
                ['product_id' => $product2->id, 'quantity' => 1], // €18 + €3.50
            ],
            'shipping_method' => 'HOME',
            'currency' => 'EUR',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201);

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

        // Verify free shipping applied for producer1
        $shippingLines = collect($response->json('data.shipping_lines'));
        $producer1Line = $shippingLines->firstWhere('producer_id', $producer1->id);
        $producer2Line = $shippingLines->firstWhere('producer_id', $producer2->id);

        $this->assertTrue($producer1Line['free_shipping_applied'], 'Producer 1 should have free shipping (€40 > €35)');
        $this->assertFalse($producer2Line['free_shipping_applied'], 'Producer 2 should NOT have free shipping (€18 < €35)');
        $this->assertEquals('0.00', $producer1Line['shipping_cost']);
        $this->assertEquals('3.50', $producer2Line['shipping_cost']);
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

        // Single producer = 1 shipping line
        $shippingLines = $response->json('data.shipping_lines');
        $this->assertCount(1, $shippingLines);
        $this->assertFalse($response->json('data.is_multi_producer'));

        // €50 > €35 → free shipping
        $this->assertTrue($shippingLines[0]['free_shipping_applied']);
        $this->assertEquals('0.00', $shippingLines[0]['shipping_cost']);
    }

    /**
     * Test PICKUP shipping method is always free.
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

        // All shipping lines should be free for PICKUP
        $shippingTotal = (float) $response->json('data.shipping_total');
        $this->assertEquals(0.00, $shippingTotal, 'PICKUP shipping should always be free');

        $shippingLines = $response->json('data.shipping_lines');
        foreach ($shippingLines as $line) {
            $this->assertTrue($line['free_shipping_applied'], 'PICKUP should apply free shipping');
            $this->assertEquals('0.00', $line['shipping_cost']);
        }
    }
}
