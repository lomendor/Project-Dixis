<?php

namespace Tests\Unit;

use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-Producer Free Shipping Threshold Tests
 *
 * Tests that producers can set their own free shipping thresholds:
 * - NULL threshold uses system default (€35)
 * - Custom threshold overrides system default
 * - Different producers can have different thresholds
 * - Threshold is applied per-producer in multi-producer checkout
 */
class ProducerFreeShippingThresholdTest extends TestCase
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
    public function producer_with_null_threshold_uses_system_default(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create([
            'free_shipping_threshold_eur' => null, // Uses default €35
        ]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 34.00, // Below default €35 threshold
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

        // Subtotal = €34, below €35 default threshold
        $this->assertEquals(34.00, (float) $order->subtotal);

        // INVARIANT: Below threshold => shipping > 0
        $this->assertGreaterThan(0, (float) $order->shipping_cost);
    }

    /** @test */
    public function producer_with_custom_lower_threshold_gets_free_shipping_earlier(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create([
            'free_shipping_threshold_eur' => 25.00, // Lower than default €35
        ]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 26.00, // Above €25 custom threshold, below default €35
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

        // Subtotal = €26, above €25 custom threshold
        $this->assertEquals(26.00, (float) $order->subtotal);

        // INVARIANT: Above custom threshold => free shipping
        $this->assertEquals(0.00, (float) $order->shipping_cost);
    }

    /** @test */
    public function producer_with_custom_higher_threshold_charges_shipping_longer(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create([
            'free_shipping_threshold_eur' => 50.00, // Higher than default €35
        ]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 40.00, // Above default €35, but below custom €50 threshold
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

        // Subtotal = €40, above default €35 but below custom €50 threshold
        $this->assertEquals(40.00, (float) $order->subtotal);

        // INVARIANT: Below custom threshold => shipping > 0
        $this->assertGreaterThan(0, (float) $order->shipping_cost);
    }

    /** @test */
    public function multi_producer_with_different_thresholds(): void
    {
        $user = User::factory()->create();

        // Producer A: Custom €20 threshold
        $producerA = Producer::factory()->create([
            'name' => 'Producer A',
            'free_shipping_threshold_eur' => 20.00,
        ]);
        $productA = Product::factory()->create([
            'producer_id' => $producerA->id,
            'price' => 22.00, // Above €20 threshold = free shipping
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        // Producer B: Custom €50 threshold
        $producerB = Producer::factory()->create([
            'name' => 'Producer B',
            'free_shipping_threshold_eur' => 50.00,
        ]);
        $productB = Product::factory()->create([
            'producer_id' => $producerB->id,
            'price' => 30.00, // Below €50 threshold = shipping charged
            'stock' => 10,
            'weight_per_unit' => 0.5,
        ]);

        $productData = [
            [
                'product' => $productA,
                'quantity' => 1,
                'unit_price' => $productA->price,
                'total_price' => $productA->price * 1,
            ],
            [
                'product' => $productB,
                'quantity' => 1,
                'unit_price' => $productB->price,
                'total_price' => $productB->price * 1,
            ],
        ];

        $result = $this->checkoutService->processCheckout(
            $user->id,
            $productData,
            $this->standardOptions
        );

        // Multi-producer checkout creates CheckoutSession with 2 child orders
        $this->assertNotNull($result['checkout_session']);
        $this->assertCount(2, $result['orders']);

        // Find orders by producer
        $orderA = collect($result['orders'])->first(function ($order) use ($producerA) {
            return $order->orderItems->first()->producer_id === $producerA->id;
        });
        $orderB = collect($result['orders'])->first(function ($order) use ($producerB) {
            return $order->orderItems->first()->producer_id === $producerB->id;
        });

        // Order A: €22 subtotal, above €20 threshold = free shipping
        $this->assertEquals(22.00, (float) $orderA->subtotal);
        $this->assertEquals(0.00, (float) $orderA->shipping_cost);

        // Order B: €30 subtotal, below €50 threshold = shipping charged
        $this->assertEquals(30.00, (float) $orderB->subtotal);
        $this->assertGreaterThan(0, (float) $orderB->shipping_cost);
    }

    /** @test */
    public function producer_with_zero_threshold_always_has_free_shipping(): void
    {
        $user = User::factory()->create();
        $producer = Producer::factory()->create([
            'free_shipping_threshold_eur' => 0.00, // Always free shipping
        ]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 5.00, // Very low price
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

        // Subtotal = €5, any amount >= €0 threshold
        $this->assertEquals(5.00, (float) $order->subtotal);

        // INVARIANT: Zero threshold means always free shipping
        $this->assertEquals(0.00, (float) $order->shipping_cost);
    }
}
