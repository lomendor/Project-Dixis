<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShippingLine;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass MP-MULTI-PRODUCER-CHECKOUT-02: Multi-producer shipping total tests.
 *
 * Verifies that:
 * - shipping_total = sum of shipping_lines[].shipping_cost
 * - is_multi_producer is true when order has 2+ producers
 * - API response includes shipping breakdown
 */
class MultiProducerShippingTotalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * AC-A1: shipping_total = sum of shipping_lines.shipping_cost
     */
    public function test_shipping_total_equals_sum_of_shipping_lines(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer A']);
        $producer2 = Producer::factory()->create(['name' => 'Producer B']);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 60.00,
            'shipping_cost' => 7.00, // Total from shipping lines
            'total' => 67.00,
        ]);

        // Create shipping lines: €3.50 + €3.50 = €7.00
        OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer1->id,
            'producer_name' => $producer1->name,
            'subtotal' => 30.00,
            'shipping_cost' => 3.50,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => false,
        ]);

        OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer2->id,
            'producer_name' => $producer2->name,
            'subtotal' => 30.00,
            'shipping_cost' => 3.50,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => false,
        ]);

        // Fetch order via API
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/public/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.shipping_total', '7.00');
        $response->assertJsonPath('data.is_multi_producer', true);
        $response->assertJsonCount(2, 'data.shipping_lines');
    }

    /**
     * AC-A1 with free shipping: one producer gets free, one pays.
     */
    public function test_shipping_total_with_free_shipping_on_one_producer(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer A']);
        $producer2 = Producer::factory()->create(['name' => 'Producer B']);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 80.00,
            'shipping_cost' => 3.50, // Only producer B pays
            'total' => 83.50,
        ]);

        // Producer A: subtotal >= €35, free shipping
        OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer1->id,
            'producer_name' => $producer1->name,
            'subtotal' => 50.00,
            'shipping_cost' => 0.00,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => true,
        ]);

        // Producer B: subtotal < €35, pays shipping
        OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer2->id,
            'producer_name' => $producer2->name,
            'subtotal' => 30.00,
            'shipping_cost' => 3.50,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/public/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.shipping_total', '3.50');
        $response->assertJsonPath('data.is_multi_producer', true);

        // Verify individual shipping lines
        $shippingLines = $response->json('data.shipping_lines');
        $this->assertEquals('0.00', $shippingLines[0]['shipping_cost']);
        $this->assertTrue($shippingLines[0]['free_shipping_applied']);
        $this->assertEquals('3.50', $shippingLines[1]['shipping_cost']);
        $this->assertFalse($shippingLines[1]['free_shipping_applied']);
    }

    /**
     * Single producer order: is_multi_producer = false
     */
    public function test_single_producer_order_not_multi_producer(): void
    {
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create(['name' => 'Solo Producer']);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 25.00,
            'shipping_cost' => 3.50,
            'total' => 28.50,
        ]);

        OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer->id,
            'producer_name' => $producer->name,
            'subtotal' => 25.00,
            'shipping_cost' => 3.50,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/public/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.shipping_total', '3.50');
        $response->assertJsonPath('data.is_multi_producer', false);
        $response->assertJsonCount(1, 'data.shipping_lines');
    }
}
