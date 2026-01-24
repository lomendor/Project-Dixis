<?php

namespace Tests\Feature;

use App\Models\OrderShippingLine;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression test: Frontend checkout uses the correct order endpoint.
 *
 * The frontend calls `apiClient.createOrder()` which POSTs to `/api/v1/public/orders`.
 * This routes to `Api\V1\OrderController@store` which has multi-producer shipping logic.
 *
 * This test ensures that endpoint creates shipping lines (proves correct controller).
 */
class OrderRoutingRegressionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Regression: POST /api/v1/public/orders creates shipping lines.
     *
     * This proves the frontend checkout endpoint uses Api\V1\OrderController
     * which has the multi-producer shipping line logic.
     */
    public function test_public_orders_endpoint_creates_shipping_lines(): void
    {
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create(['name' => 'Routing Test Producer']);

        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 25.00,
            'stock' => 100,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 1],
                ],
                'shipping_method' => 'HOME',
                'currency' => 'EUR',
            ]);

        $response->assertStatus(201);

        // The key assertion: shipping_lines exists in response
        // This proves we're hitting Api\V1\OrderController (not the old one)
        $response->assertJsonStructure([
            'data' => [
                'shipping_lines',
                'shipping_total',
                'is_multi_producer',
            ],
        ]);

        // Verify DB has shipping line record
        $orderId = $response->json('data.id');
        $this->assertEquals(1, OrderShippingLine::where('order_id', $orderId)->count());
    }
}
