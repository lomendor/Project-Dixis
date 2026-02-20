<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected $product1;

    protected $product2;

    protected $producer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create user
        $this->user = User::factory()->create([
            'email' => 'order-test@test.com',
            'role' => 'consumer',
        ]);

        // Create producer and products
        $this->producer = Producer::factory()->create();

        $this->product1 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Test Product 1',
            'price' => 15.00,
            'stock' => 50,
            'is_active' => true,
        ]);

        $this->product2 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Test Product 2',
            'price' => 25.50,
            'stock' => 30,
            'is_active' => true,
        ]);
    }

    /**
     * Test creating an order with multiple items via public endpoint.
     * (Replaces legacy cart-checkout test — POST /api/v1/public/orders)
     */
    public function test_create_order_with_multiple_items(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => $this->product1->id, 'quantity' => 2],
                ['product_id' => $this->product2->id, 'quantity' => 1],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
            'notes' => 'Test order',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'subtotal',
                    'total_amount',
                    'payment_status',
                    'status',
                ],
            ]);

        // Verify order items were created
        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product2->id,
            'quantity' => 1,
        ]);
    }

    /**
     * Test creating an order with PICKUP shipping.
     */
    public function test_order_with_pickup_shipping(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => $this->product1->id, 'quantity' => 1],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'PICKUP',
        ]);

        $response->assertStatus(201);

        // Verify order was created with PICKUP method
        $this->assertDatabaseHas('orders', [
            'shipping_method' => 'PICKUP',
        ]);
    }

    /**
     * Test order creation requires items (validation).
     */
    public function test_order_requires_items(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/public/orders', [
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
    }

    /**
     * Test order validation rejects invalid shipping method.
     */
    public function test_order_validation_rejects_invalid_shipping_method(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => $this->product1->id, 'quantity' => 1],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'INVALID',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['shipping_method']);
    }

    /**
     * Test order creation with items (direct POST, not cart-based).
     */
    public function test_manual_order_creation(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 2,
                ],
                [
                    'product_id' => $this->product2->id,
                    'quantity' => 1,
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'COURIER',
            'notes' => 'Manual test order',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'subtotal',
                    'total_amount',
                    'payment_status',
                    'status',
                ],
            ]);

        // Verify order was created
        $this->assertDatabaseCount('order_items', 2);
    }

    /**
     * Test viewing order by public token (no auth required).
     */
    public function test_get_order_by_public_token(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product1->id,
        ]);

        // Public endpoint — no auth needed
        $response = $this->getJson("/api/v1/public/orders/by-token/{$order->public_token}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'total_amount',
                ],
            ]);
    }

    /**
     * Test that nonexistent token returns error (400 or 404).
     */
    public function test_nonexistent_token_returns_error(): void
    {
        $response = $this->getJson('/api/v1/public/orders/by-token/nonexistent-uuid');

        // Endpoint returns 400 for malformed tokens, 404 for not found
        $this->assertTrue(
            in_array($response->getStatusCode(), [400, 404]),
            "Expected 400 or 404 but got {$response->getStatusCode()}"
        );
    }

    /**
     * Test public order creation works without authentication (guest checkout).
     * The /api/v1/public/orders endpoint uses auth.optional middleware.
     */
    public function test_guest_checkout_allowed(): void
    {
        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => $this->product1->id, 'quantity' => 1],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ]);

        // Guest checkout is allowed (auth.optional) — should not return 401
        // May return 201 (success) or 422 (validation) but never 401
        $this->assertNotEquals(401, $response->getStatusCode());
    }

    /**
     * Test order creation with non-existent product fails validation.
     */
    public function test_order_with_nonexistent_product_fails(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => 99999, 'quantity' => 1],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ]);

        $response->assertStatus(422);
    }
}
