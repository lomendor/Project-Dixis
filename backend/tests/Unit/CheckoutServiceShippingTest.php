<?php

namespace Tests\Unit;

use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass SHIP-CALC-V2-01: CheckoutService Shipping Tests
 *
 * Tests that shipping is calculated correctly by CheckoutService:
 * - Weight/zone-based calculation via ShippingService
 * - Free shipping when producer subtotal >= €35
 * - Shipping is calculated by backend (single source of truth)
 *
 * Tests use explicit weights and postal codes for deterministic results.
 * Assertions check invariants, not exact euro amounts.
 */
class CheckoutServiceShippingTest extends TestCase
{
    use RefreshDatabase;

    private CheckoutService $checkoutService;

    /** Standard test options with fixed postal code for deterministic zone */
    private array $standardOptions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->checkoutService = app(CheckoutService::class);
        $this->standardOptions = [
            'shipping_method' => 'HOME',
            'payment_method' => 'COD',
            'shipping_address' => [
                'postal_code' => '10551', // GR_ATTICA zone
            ],
        ];
    }

    /** @test */
    public function single_producer_below_threshold_charges_shipping(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 20.00, // Below €35 threshold
            'stock' => 10,
            'weight_per_unit' => 0.5, // Explicit weight for deterministic calc
        ]);

        $productData = [
            [
                'product' => $product,
                'quantity' => 1,
                'unit_price' => $product->price,
                'total_price' => $product->price * 1,
            ],
        ];

        $result = $this->checkoutService->processCheckout(
            $user->id,
            $productData,
            $this->standardOptions
        );

        $order = $result['orders'][0];

        // Subtotal = €20, below €35 threshold
        $this->assertEquals(20.00, (float) $order->subtotal);

        // INVARIANT: Below threshold => shipping > 0 AND not flat €3.50
        $this->assertGreaterThan(0, (float) $order->shipping_cost);
        $this->assertNotEquals(3.50, (float) $order->shipping_cost);

        // Total = subtotal + shipping
        $this->assertEquals(
            (float) $order->subtotal + (float) $order->shipping_cost,
            (float) $order->total
        );
    }

    /** @test */
    public function single_producer_at_threshold_gets_free_shipping(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 35.00, // Exactly at €35 threshold
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        $productData = [
            [
                'product' => $product,
                'quantity' => 1,
                'unit_price' => $product->price,
                'total_price' => $product->price * 1,
            ],
        ];

        $result = $this->checkoutService->processCheckout(
            $user->id,
            $productData,
            $this->standardOptions
        );

        $order = $result['orders'][0];

        // Subtotal = €35, at threshold
        $this->assertEquals(35.00, (float) $order->subtotal);

        // INVARIANT: At/above threshold => shipping = 0
        $this->assertEquals(0.0, (float) $order->shipping_cost);

        // Total = subtotal (no shipping)
        $this->assertEquals((float) $order->subtotal, (float) $order->total);
    }

    /** @test */
    public function single_producer_above_threshold_gets_free_shipping(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 50.00, // Above €35 threshold
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        $productData = [
            [
                'product' => $product,
                'quantity' => 1,
                'unit_price' => $product->price,
                'total_price' => $product->price * 1,
            ],
        ];

        $result = $this->checkoutService->processCheckout(
            $user->id,
            $productData,
            $this->standardOptions
        );

        $order = $result['orders'][0];

        // Subtotal = €50, above threshold
        $this->assertEquals(50.00, (float) $order->subtotal);

        // INVARIANT: Above threshold => shipping = 0
        $this->assertEquals(0.0, (float) $order->shipping_cost);

        // Total = subtotal (no shipping)
        $this->assertEquals((float) $order->subtotal, (float) $order->total);
    }

    /** @test */
    public function multi_producer_each_below_threshold_both_charge_shipping(): void
    {
        $user = User::factory()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer A']);
        $producer2 = Producer::factory()->create(['name' => 'Producer B']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 20.00, // Below €35
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 15.00, // Below €35
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        $productData = [
            [
                'product' => $product1,
                'quantity' => 1,
                'unit_price' => $product1->price,
                'total_price' => $product1->price * 1,
            ],
            [
                'product' => $product2,
                'quantity' => 1,
                'unit_price' => $product2->price,
                'total_price' => $product2->price * 1,
            ],
        ];

        $result = $this->checkoutService->processCheckout(
            $user->id,
            $productData,
            $this->standardOptions
        );

        // Should create 2 child orders
        $this->assertCount(2, $result['orders']);
        $this->assertNotNull($result['checkout_session']);

        // Find orders by subtotal
        $orders = collect($result['orders']);
        $order1 = $orders->first(fn ($o) => (float) $o->subtotal === 20.00);
        $order2 = $orders->first(fn ($o) => (float) $o->subtotal === 15.00);

        $this->assertNotNull($order1, 'Order with subtotal €20.00 not found');
        $this->assertNotNull($order2, 'Order with subtotal €15.00 not found');

        // INVARIANT: Both below threshold => both charge shipping > 0, not flat €3.50
        $this->assertGreaterThan(0, (float) $order1->shipping_cost);
        $this->assertGreaterThan(0, (float) $order2->shipping_cost);
        $this->assertNotEquals(3.50, (float) $order1->shipping_cost);
        $this->assertNotEquals(3.50, (float) $order2->shipping_cost);

        // Session shipping = sum of both orders' shipping
        $session = $result['checkout_session'];
        $expectedSessionShipping = (float) $order1->shipping_cost + (float) $order2->shipping_cost;
        $this->assertEquals($expectedSessionShipping, (float) $session->shipping_total);
    }

    /** @test */
    public function multi_producer_one_above_threshold_one_below(): void
    {
        $user = User::factory()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer A']);
        $producer2 = Producer::factory()->create(['name' => 'Producer B']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 40.00, // Above €35 - FREE shipping
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 20.00, // Below €35 - charges shipping
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        $productData = [
            [
                'product' => $product1,
                'quantity' => 1,
                'unit_price' => $product1->price,
                'total_price' => $product1->price * 1,
            ],
            [
                'product' => $product2,
                'quantity' => 1,
                'unit_price' => $product2->price,
                'total_price' => $product2->price * 1,
            ],
        ];

        $result = $this->checkoutService->processCheckout(
            $user->id,
            $productData,
            $this->standardOptions
        );

        $this->assertCount(2, $result['orders']);

        // Find orders by subtotal
        $orders = collect($result['orders']);
        $order1 = $orders->first(fn ($o) => (float) $o->subtotal === 40.00);
        $order2 = $orders->first(fn ($o) => (float) $o->subtotal === 20.00);

        $this->assertNotNull($order1, 'Order with subtotal €40.00 not found');
        $this->assertNotNull($order2, 'Order with subtotal €20.00 not found');

        // INVARIANT: Above threshold => free shipping
        $this->assertEquals(0.0, (float) $order1->shipping_cost);

        // INVARIANT: Below threshold => shipping > 0, not flat €3.50
        $this->assertGreaterThan(0, (float) $order2->shipping_cost);
        $this->assertNotEquals(3.50, (float) $order2->shipping_cost);

        // Session shipping = only the below-threshold order's shipping
        $session = $result['checkout_session'];
        $this->assertEquals((float) $order2->shipping_cost, (float) $session->shipping_total);
    }

    /** @test */
    public function pickup_always_has_free_shipping(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 10.00, // Way below threshold
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        $productData = [
            [
                'product' => $product,
                'quantity' => 1,
                'unit_price' => $product->price,
                'total_price' => $product->price * 1,
            ],
        ];

        $result = $this->checkoutService->processCheckout(
            $user->id,
            $productData,
            [
                'shipping_method' => 'PICKUP', // Pickup - should be free
                'payment_method' => 'COD',
                'shipping_address' => [
                    'postal_code' => '10551',
                ],
            ]
        );

        $order = $result['orders'][0];

        // INVARIANT: Pickup always has free shipping, regardless of subtotal
        $this->assertEquals(0.0, (float) $order->shipping_cost);
    }

    /** @test */
    public function shipping_is_weight_based_not_flat_rate(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create();

        // Light product: 0.5kg
        $lightProduct = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 20.00, // Below threshold
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        // Heavy product: 5kg
        $heavyProduct = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 20.00, // Same price, below threshold
            'stock' => 10,
            'weight_per_unit' => 5.0,
        ]);

        // Order with light product
        $lightResult = $this->checkoutService->processCheckout(
            $user->id,
            [
                [
                    'product' => $lightProduct,
                    'quantity' => 1,
                    'unit_price' => $lightProduct->price,
                    'total_price' => $lightProduct->price * 1,
                ],
            ],
            $this->standardOptions
        );

        // Order with heavy product
        $heavyResult = $this->checkoutService->processCheckout(
            $user->id,
            [
                [
                    'product' => $heavyProduct,
                    'quantity' => 1,
                    'unit_price' => $heavyProduct->price,
                    'total_price' => $heavyProduct->price * 1,
                ],
            ],
            $this->standardOptions
        );

        $lightShipping = (float) $lightResult['orders'][0]->shipping_cost;
        $heavyShipping = (float) $heavyResult['orders'][0]->shipping_cost;

        // INVARIANT: Both should charge shipping (below threshold)
        $this->assertGreaterThan(0, $lightShipping);
        $this->assertGreaterThan(0, $heavyShipping);

        // INVARIANT: Neither should be flat €3.50
        $this->assertNotEquals(3.50, $lightShipping);
        $this->assertNotEquals(3.50, $heavyShipping);

        // GUARDRAIL: Heavy product should cost MORE to ship than light product
        $this->assertGreaterThan(
            $lightShipping,
            $heavyShipping,
            'Heavy product (5kg) should have higher shipping cost than light product (0.5kg)'
        );
    }
}
