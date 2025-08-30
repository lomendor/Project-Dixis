<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;

#[Group('auth')]
class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    #[Group('mvp')]
    public function test_consumer_cannot_create_products(): void
    {
        $consumer = User::factory()->consumer()->create();
        $producer = Producer::factory()->create(); // Valid producer

        $productData = [
            'name' => 'Test Product',
            'price' => 10.00,
            'producer_id' => $producer->id, // Valid producer ID
        ];

        $response = $this->actingAs($consumer, 'sanctum')
            ->postJson('/api/v1/products', $productData);

        $response->assertStatus(403); // Forbidden
    }

    #[Group('mvp')]
    public function test_producer_can_create_products(): void
    {
        $producerUser = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        $productData = [
            'name' => 'Producer Test Product',
            'price' => 15.00,
            'producer_id' => $producer->id,
        ];

        $response = $this->actingAs($producerUser, 'sanctum')
            ->postJson('/api/v1/products', $productData);

        $response->assertStatus(201); // Created
    }

    #[Group('mvp')]
    public function test_consumer_can_create_orders(): void
    {
        $consumer = User::factory()->consumer()->create();
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
                ]
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->actingAs($consumer, 'sanctum')
            ->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201); // Created
    }

    #[Group('mvp')]
    public function test_producer_cannot_create_orders(): void
    {
        $producerUser = User::factory()->producer()->create();
        Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create(['price' => 10.00, 'is_active' => true]);

        $orderData = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ]
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->actingAs($producerUser, 'sanctum')
            ->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(403); // Forbidden
    }

    #[Group('mvp')]
    public function test_admin_has_full_access(): void
    {
        $admin = User::factory()->admin()->create();
        $producer = Producer::factory()->create();
        
        // Admin can create products
        $productData = [
            'name' => 'Admin Test Product',
            'price' => 20.00,
            'producer_id' => $producer->id,
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/products', $productData);

        $response->assertStatus(201);

        // Admin can create orders
        $product = Product::factory()->create(['price' => 10.00, 'is_active' => true]);
        $orderData = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ]
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
    }
}