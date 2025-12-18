<?php

namespace Tests\Feature;

use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

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
                ],
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
                ],
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
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
    }

    #[Group('mvp')]
    #[Group('ownership')]
    public function test_producer_cannot_update_other_producers_product(): void
    {
        // Create Producer A with their product
        $producerAUser = User::factory()->producer()->create();
        $producerA = Producer::factory()->create(['user_id' => $producerAUser->id]);
        $productA = Product::factory()->create([
            'producer_id' => $producerA->id,
            'name' => 'Producer A Product',
            'price' => 10.00,
        ]);

        // Create Producer B
        $producerBUser = User::factory()->producer()->create();
        Producer::factory()->create(['user_id' => $producerBUser->id]);

        // Producer B tries to update Producer A's product
        $updateData = ['name' => 'Hacked Product Name', 'price' => 99.99];

        $response = $this->actingAs($producerBUser, 'sanctum')
            ->patchJson("/api/v1/products/{$productA->id}", $updateData);

        $response->assertStatus(403); // Forbidden

        // Verify product was NOT updated
        $this->assertDatabaseHas('products', [
            'id' => $productA->id,
            'name' => 'Producer A Product',
            'price' => 10.00,
        ]);
    }

    #[Group('mvp')]
    #[Group('ownership')]
    public function test_producer_can_update_own_product(): void
    {
        $producerUser = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Original Name',
            'price' => 10.00,
        ]);

        $updateData = ['name' => 'Updated Name', 'price' => 15.00];

        $response = $this->actingAs($producerUser, 'sanctum')
            ->patchJson("/api/v1/products/{$product->id}", $updateData);

        $response->assertStatus(200); // OK

        // Verify product was updated
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name',
            'price' => 15.00,
        ]);
    }

    #[Group('mvp')]
    #[Group('ownership')]
    public function test_admin_can_update_any_product(): void
    {
        $admin = User::factory()->admin()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Original Name',
            'price' => 10.00,
        ]);

        $updateData = ['name' => 'Admin Updated Name', 'price' => 25.00];

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/products/{$product->id}", $updateData);

        $response->assertStatus(200); // OK

        // Verify product was updated
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Admin Updated Name',
            'price' => 25.00,
        ]);
    }

    #[Group('mvp')]
    #[Group('ownership')]
    public function test_producer_cannot_delete_other_producers_product(): void
    {
        // Create Producer A with their product
        $producerAUser = User::factory()->producer()->create();
        $producerA = Producer::factory()->create(['user_id' => $producerAUser->id]);
        $productA = Product::factory()->create(['producer_id' => $producerA->id]);

        // Create Producer B
        $producerBUser = User::factory()->producer()->create();
        Producer::factory()->create(['user_id' => $producerBUser->id]);

        // Producer B tries to delete Producer A's product
        $response = $this->actingAs($producerBUser, 'sanctum')
            ->deleteJson("/api/v1/products/{$productA->id}");

        $response->assertStatus(403); // Forbidden

        // Verify product still exists
        $this->assertDatabaseHas('products', ['id' => $productA->id]);
    }

    #[Group('mvp')]
    #[Group('ownership')]
    public function test_producer_create_auto_sets_producer_id(): void
    {
        $producerUser = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        // Try to create product WITHOUT specifying producer_id (should auto-set)
        $productData = [
            'name' => 'Auto Producer ID Test',
            'price' => 10.00,
            // Note: NO producer_id in request
        ];

        $response = $this->actingAs($producerUser, 'sanctum')
            ->postJson('/api/v1/products', $productData);

        $response->assertStatus(201);

        // Verify product was created with correct producer_id (auto-set server-side)
        $this->assertDatabaseHas('products', [
            'name' => 'Auto Producer ID Test',
            'producer_id' => $producer->id, // Should match auth user's producer
        ]);
    }

    #[Group('mvp')]
    #[Group('ownership')]
    public function test_producer_cannot_hijack_producer_id(): void
    {
        $producerAUser = User::factory()->producer()->create();
        $producerA = Producer::factory()->create(['user_id' => $producerAUser->id]);

        $producerB = Producer::factory()->create(); // Different producer

        // Producer A tries to create product with Producer B's ID
        $productData = [
            'name' => 'Hijack Attempt',
            'price' => 10.00,
            'producer_id' => $producerB->id, // Malicious: different producer
        ];

        $response = $this->actingAs($producerAUser, 'sanctum')
            ->postJson('/api/v1/products', $productData);

        $response->assertStatus(201);

        // Verify product was created with Producer A's ID (server-side override)
        $this->assertDatabaseHas('products', [
            'name' => 'Hijack Attempt',
            'producer_id' => $producerA->id, // Should be auth user's producer, NOT request value
        ]);

        // Verify product was NOT created for Producer B
        $this->assertDatabaseMissing('products', [
            'name' => 'Hijack Attempt',
            'producer_id' => $producerB->id,
        ]);
    }
}
