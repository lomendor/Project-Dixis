<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: CheckoutService Shipping Tests
 *
 * Tests that shipping is calculated correctly by CheckoutService:
 * - €3.50 flat rate per producer
 * - Free shipping when producer subtotal >= €35
 * - Shipping is calculated by backend (single source of truth)
 */
class CheckoutServiceShippingTest extends TestCase
{
    use RefreshDatabase;

    private CheckoutService $checkoutService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->checkoutService = app(CheckoutService::class);
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
                'shipping_method' => 'HOME',
                'payment_method' => 'COD',
            ]
        );

        $order = $result['orders'][0];

        // Subtotal = €20, below €35 threshold
        $this->assertEquals('20.00', number_format($order->subtotal, 2));
        // Should charge €3.50 shipping
        $this->assertEquals('3.50', number_format($order->shipping_cost, 2));
        // Total = €20 + €3.50 = €23.50
        $this->assertEquals('23.50', number_format($order->total, 2));
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
                'shipping_method' => 'HOME',
                'payment_method' => 'COD',
            ]
        );

        $order = $result['orders'][0];

        // Subtotal = €35, at threshold
        $this->assertEquals('35.00', number_format($order->subtotal, 2));
        // Should be free shipping
        $this->assertEquals('0.00', number_format($order->shipping_cost, 2));
        // Total = €35 (no shipping)
        $this->assertEquals('35.00', number_format($order->total, 2));
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
                'shipping_method' => 'HOME',
                'payment_method' => 'COD',
            ]
        );

        $order = $result['orders'][0];

        // Subtotal = €50, above threshold
        $this->assertEquals('50.00', number_format($order->subtotal, 2));
        // Should be free shipping
        $this->assertEquals('0.00', number_format($order->shipping_cost, 2));
        // Total = €50 (no shipping)
        $this->assertEquals('50.00', number_format($order->total, 2));
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
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 15.00, // Below €35
            'stock' => 10,
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
            [
                'shipping_method' => 'HOME',
                'payment_method' => 'COD',
            ]
        );

        // Should create 2 child orders
        $this->assertCount(2, $result['orders']);
        $this->assertNotNull($result['checkout_session']);

        // Find orders by subtotal (€20 for producer1, €15 for producer2)
        $orders = collect($result['orders']);
        $order1 = $orders->firstWhere('subtotal', '20.00') ?? $orders->first(fn($o) => (float)$o->subtotal === 20.00);
        $order2 = $orders->firstWhere('subtotal', '15.00') ?? $orders->first(fn($o) => (float)$o->subtotal === 15.00);

        $this->assertNotNull($order1, 'Order with subtotal €20.00 not found');
        $this->assertNotNull($order2, 'Order with subtotal €15.00 not found');

        // Both should charge €3.50 shipping (both below €35 threshold)
        $this->assertEquals('3.50', number_format($order1->shipping_cost, 2));
        $this->assertEquals('3.50', number_format($order2->shipping_cost, 2));

        // Checkout session should have total shipping = €7.00
        $session = $result['checkout_session'];
        $this->assertEquals('7.00', number_format($session->shipping_total, 2));
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
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 20.00, // Below €35 - €3.50 shipping
            'stock' => 10,
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
            [
                'shipping_method' => 'HOME',
                'payment_method' => 'COD',
            ]
        );

        $this->assertCount(2, $result['orders']);

        // Find orders by subtotal (€40 for producer1, €20 for producer2)
        $orders = collect($result['orders']);
        $order1 = $orders->firstWhere('subtotal', '40.00') ?? $orders->first(fn($o) => (float)$o->subtotal === 40.00);
        $order2 = $orders->firstWhere('subtotal', '20.00') ?? $orders->first(fn($o) => (float)$o->subtotal === 20.00);

        $this->assertNotNull($order1, 'Order with subtotal €40.00 not found');
        $this->assertNotNull($order2, 'Order with subtotal €20.00 not found');

        // Producer 1 (€40) should have free shipping (above €35 threshold)
        $this->assertEquals('0.00', number_format($order1->shipping_cost, 2));

        // Producer 2 (€20) should charge €3.50 (below €35 threshold)
        $this->assertEquals('3.50', number_format($order2->shipping_cost, 2));

        // Checkout session should have total shipping = €3.50
        $session = $result['checkout_session'];
        $this->assertEquals('3.50', number_format($session->shipping_total, 2));
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
            ]
        );

        $order = $result['orders'][0];

        // Pickup should always be free, regardless of subtotal
        $this->assertEquals('0.00', number_format($order->shipping_cost, 2));
    }
}
