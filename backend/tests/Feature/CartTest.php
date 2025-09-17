<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected $product;

    protected $producer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create user
        $this->user = User::factory()->create([
            'email' => 'cart-test@test.com',
            'role' => 'consumer',
        ]);

        // Create producer and product
        $this->producer = Producer::factory()->create();
        $this->product = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'price' => 10.50,
            'stock' => 100,
            'is_active' => true,
        ]);
    }

    public function test_get_empty_cart_for_authenticated_user(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/cart/items');

        $response->assertStatus(200)
            ->assertJson([
                'cart_items' => [],
                'total_items' => 0,
                'total_amount' => '0.00',
            ]);
    }

    public function test_add_item_to_cart(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'cart_item' => [
                    'id',
                    'quantity',
                    'product' => [
                        'id',
                        'name',
                        'price',
                        'unit',
                    ],
                    'subtotal',
                ],
            ]);

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);
    }

    public function test_add_item_to_cart_increases_existing_quantity(): void
    {
        Sanctum::actingAs($this->user);

        // Add item first time
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        // Add same item again
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 3,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 5, // 2 + 3
        ]);
    }

    public function test_cannot_add_inactive_product_to_cart(): void
    {
        $this->product->update(['is_active' => false]);
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);
    }

    public function test_cannot_add_more_than_available_stock(): void
    {
        $this->product->update(['stock' => 5]);
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 10, // More than available stock
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_cannot_exceed_stock_when_adding_to_existing_cart_item(): void
    {
        $this->product->update(['stock' => 10]);
        Sanctum::actingAs($this->user);

        // Add 7 items first
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 7,
        ]);

        // Try to add 5 more (total would be 12, but stock is 10)
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 5,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_get_cart_with_items(): void
    {
        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 3,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/cart/items');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'cart_items' => [
                    '*' => [
                        'id',
                        'quantity',
                        'product' => [
                            'id',
                            'name',
                            'price',
                            'unit',
                            'categories',
                            'images',
                            'producer',
                        ],
                        'subtotal',
                    ],
                ],
                'total_items',
                'total_amount',
            ])
            ->assertJson([
                'total_items' => 3,
                'total_amount' => '31.50', // 3 * 10.50
            ]);
    }

    public function test_update_cart_item_quantity(): void
    {
        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->patchJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 5,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'cart_item' => [
                    'id',
                    'quantity',
                    'subtotal',
                ],
            ]);

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 5,
        ]);
    }

    public function test_cannot_update_cart_item_exceeding_stock(): void
    {
        $this->product->update(['stock' => 3]);

        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->patchJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 5, // More than stock
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_cannot_update_another_users_cart_item(): void
    {
        $anotherUser = User::factory()->create();
        $cartItem = CartItem::create([
            'user_id' => $anotherUser->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->patchJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 2,
        ]);

        $response->assertStatus(404);
    }

    public function test_remove_item_from_cart(): void
    {
        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->deleteJson("/api/v1/cart/items/{$cartItem->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Item removed from cart successfully']);

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_cannot_remove_another_users_cart_item(): void
    {
        $anotherUser = User::factory()->create();
        $cartItem = CartItem::create([
            'user_id' => $anotherUser->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->deleteJson("/api/v1/cart/items/{$cartItem->id}");

        $response->assertStatus(404);
    }

    public function test_cart_requires_authentication(): void
    {
        // Test all endpoints without authentication
        $this->getJson('/api/v1/cart/items')->assertStatus(401);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ])->assertStatus(401);

        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $this->patchJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 2,
        ])->assertStatus(401);

        $this->deleteJson("/api/v1/cart/items/{$cartItem->id}")
            ->assertStatus(401);
    }

    public function test_add_to_cart_validation_rules(): void
    {
        Sanctum::actingAs($this->user);

        // Test missing required fields
        $response = $this->postJson('/api/v1/cart/items', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['product_id', 'quantity']);

        // Test invalid product_id
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => 99999,
            'quantity' => 1,
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);

        // Test invalid quantity (negative)
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => -1,
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);

        // Test invalid quantity (too high)
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 101, // Max is 100
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_update_cart_validation_rules(): void
    {
        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        Sanctum::actingAs($this->user);

        // Test missing quantity
        $response = $this->patchJson("/api/v1/cart/items/{$cartItem->id}", []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);

        // Test invalid quantity (zero)
        $response = $this->patchJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 0,
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);

        // Test invalid quantity (too high)
        $response = $this->patchJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 101, // Max is 100
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }
}
