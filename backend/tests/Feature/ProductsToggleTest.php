<?php

namespace Tests\Feature;

use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Group;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

#[Group('mvp')]
class ProductsToggleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear permission cache to ensure fresh data
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function test_producer_can_toggle_own_product(): void
    {
        // Create a producer user with role
        $user = User::factory()->create([
            'email' => 'producer1@test.com',
            'role' => 'producer',
        ]);

        // Create producer profile for the user
        $producer = Producer::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test Producer',
            'business_name' => 'Test Producer LLC',
        ]);

        // Create a product for this producer
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $product->id,
                'is_active' => ! $product->is_active,  // Should be toggled
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_active' => ! $product->is_active,  // Should be toggled
        ]);
    }

    public function test_producer_cannot_toggle_other_producer_product(): void
    {
        // Create first producer user
        $user1 = User::factory()->create([
            'email' => 'producer2@test.com',
            'role' => 'producer',
        ]);

        $producer1 = Producer::factory()->create([
            'user_id' => $user1->id,
        ]);

        // Create second producer user
        $user2 = User::factory()->create([
            'email' => 'producer3@test.com',
            'role' => 'producer',
        ]);

        $producer2 = Producer::factory()->create([
            'user_id' => $user2->id,
        ]);

        // Create product for second producer
        $product = Product::factory()->create([
            'producer_id' => $producer2->id,
        ]);

        // Try to toggle as first producer
        Sanctum::actingAs($user1);

        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");

        // ProductPolicy throws 403 Forbidden when authorization fails
        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_toggle_product(): void
    {
        // Create producer and product
        $user = User::factory()->create([
            'email' => 'producer4@test.com',
            'role' => 'producer',
        ]);

        $producer = Producer::factory()->create([
            'user_id' => $user->id,
        ]);

        $product = Product::factory()->create([
            'producer_id' => $producer->id,
        ]);

        // Make request without authentication
        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");

        $response->assertStatus(401);
    }

    public function test_admin_can_toggle_any_product(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'email' => 'admin@test.com',
            'role' => 'admin',
        ]);

        // Create producer and product
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true,
        ]);

        // Admin can toggle any product (ProductPolicy admin override)
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $product->id,
                'is_active' => false,  // Toggled from true to false
            ]);
    }
}
