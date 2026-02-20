<?php

namespace Tests\Feature\Api\V1;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

class OrdersTest extends TestCase
{
    use RefreshDatabase;

    #[Group('mvp')]
    public function test_create_order_returns_201_with_structure(): void
    {
        // Create test data
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 10.00,
            'stock' => 100,
            'is_active' => true,
        ]);

        $orderData = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
            'notes' => 'Test order',
        ];

        // POST /api/v1/public/orders — auth.optional middleware captures user_id
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', $orderData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'payment_status',
                    'subtotal',
                    'total_amount',
                    'items' => [
                        '*' => [
                            'id',
                            'product_id',
                            'quantity',
                            'unit_price',
                            'total_price',
                            'product_name',
                        ],
                    ],
                ],
            ]);

        // Verify order was created in database
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
    }

    #[Group('mvp')]
    public function test_show_order_by_token_returns_order_details(): void
    {
        // Create test data
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $order = Order::factory()->create(['user_id' => $user->id]);
        $orderItem = OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
        ]);

        // GET /api/v1/public/orders/by-token/{token} — public, no auth required
        $response = $this->get("/api/v1/public/orders/by-token/{$order->public_token}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'subtotal',
                    'tax_amount',
                    'shipping_amount',
                    'total_amount',
                    'payment_status',
                    'status',
                    'items' => [
                        '*' => [
                            'id',
                            'product_id',
                            'quantity',
                            'unit_price',
                            'total_price',
                        ],
                    ],
                ],
            ]);
    }

    #[Group('mvp')]
    public function test_create_order_requires_valid_items(): void
    {
        // POST /api/v1/public/orders — requires items array with valid product IDs
        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [],
            'shipping_method' => 'HOME',
        ]);

        // Should reject empty items
        $response->assertStatus(422);
    }
}
