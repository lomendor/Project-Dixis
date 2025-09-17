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
            'shipping_method' => 'HOME',
            'notes' => 'Test order',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'user_id',
                'subtotal',
                'tax_amount',
                'shipping_amount',
                'total_amount',
                'payment_status',
                'status',
                'order_items' => [
                    '*' => [
                        'id',
                        'product_id',
                        'quantity',
                        'unit_price',
                        'total_price',
                        'product_name',
                    ],
                ],
            ])
            ->assertJson([
                'user_id' => $user->id,
                'payment_status' => 'pending',
                'status' => 'pending',
            ]);

        // Verify order was created in database
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
    }

    #[Group('mvp')]
    public function test_show_order_returns_order_details(): void
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

        $response = $this->actingAs($user, 'sanctum')
            ->get("/api/v1/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'user_id',
                'subtotal',
                'tax_amount',
                'shipping_amount',
                'total_amount',
                'payment_status',
                'status',
                'order_items' => [
                    '*' => [
                        'id',
                        'product_id',
                        'quantity',
                        'unit_price',
                        'total_price',
                        'product',
                    ],
                ],
            ])
            ->assertJson([
                'id' => $order->id,
                'user_id' => $user->id,
            ]);
    }

    #[Group('mvp')]
    public function test_create_order_requires_authentication(): void
    {
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $orderData = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(401);
    }
}
