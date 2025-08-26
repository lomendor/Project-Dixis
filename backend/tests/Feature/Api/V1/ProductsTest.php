<?php

namespace Tests\Feature\Api\V1;

use PHPUnit\Framework\Attributes\Group;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;

class ProductsTest extends TestCase
{
    use RefreshDatabase;

    #[Group('mvp')]
    public function test_products_index_returns_json_array(): void
    {
        // Create test data
        $producer = Producer::factory()->create();
        Product::factory()->create(['producer_id' => $producer->id, 'is_active' => true]);
        Product::factory()->create(['producer_id' => $producer->id, 'is_active' => true]);

        $response = $this->get('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'price',
                        'stock',
                        'is_active',
                        'created_at'
                    ]
                ],
                'links',
                'meta'
            ]);
    }

    #[Group('mvp')]
    public function test_products_show_returns_product_details(): void
    {
        // Create test data
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id, 'is_active' => true]);

        $response = $this->get("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'price',
                    'stock',
                    'is_active',
                    'created_at'
                ]
            ])
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name', $product->name);
    }

    #[Group('mvp')]
    public function test_authenticated_user_can_create_product(): void
    {
        $user = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        
        $productData = [
            'name' => 'Fresh Tomatoes',
            'description' => 'Organic fresh tomatoes from local farm',
            'price' => 3.50,
            'discount_price' => 2.99,
            'weight_per_unit' => 0.5,
            'unit' => 'kg',
            'stock' => 100,
            'category' => 'vegetables',
            'is_organic' => true,
            'is_seasonal' => false,
            'image_url' => 'https://example.com/tomato.jpg',
            'status' => 'available',
            'is_active' => true,
            'producer_id' => $producer->id,
        ];

        $response = $this->actingAs($user)->postJson('/api/v1/products', $productData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'price',
                    'discount_price',
                    'has_discount',
                    'effective_price',
                    'weight_per_unit',
                    'unit',
                    'stock',
                    'category',
                    'is_organic',
                    'is_seasonal',
                    'image_url',
                    'status',
                    'is_active',
                    'created_at',
                    'updated_at',
                    'producer'
                ]
            ])
            ->assertJsonPath('data.name', 'Fresh Tomatoes')
            ->assertJsonPath('data.price', '3.50')
            ->assertJsonPath('data.discount_price', '2.99')
            ->assertJsonPath('data.has_discount', true)
            ->assertJsonPath('data.effective_price', '2.99')
            ->assertJsonPath('data.is_organic', true);

        $this->assertDatabaseHas('products', [
            'name' => 'Fresh Tomatoes',
            'price' => 3.50,
            'producer_id' => $producer->id,
        ]);
    }

    #[Group('mvp')]
    public function test_unauthenticated_user_cannot_create_product(): void
    {
        $producer = Producer::factory()->create();
        
        $productData = [
            'name' => 'Fresh Tomatoes',
            'price' => 3.50,
            'producer_id' => $producer->id,
        ];

        $response = $this->postJson('/api/v1/products', $productData);

        $response->assertStatus(401);
        $this->assertDatabaseMissing('products', ['name' => 'Fresh Tomatoes']);
    }

    #[Group('mvp')]
    public function test_product_creation_requires_valid_data(): void
    {
        $user = User::factory()->producer()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/products', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price', 'producer_id']);
    }

    #[Group('mvp')]
    public function test_product_creation_validates_discount_price_less_than_price(): void
    {
        $user = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        
        $productData = [
            'name' => 'Expensive Item',
            'price' => 10.00,
            'discount_price' => 15.00, // Invalid: discount > price
            'producer_id' => $producer->id,
        ];

        $response = $this->actingAs($user)->postJson('/api/v1/products', $productData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['discount_price']);
    }

    #[Group('mvp')]
    public function test_authenticated_user_can_update_product(): void
    {
        $user = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['producer_id' => $producer->id]);
        
        $updateData = [
            'name' => 'Updated Product Name',
            'price' => 25.99,
            'description' => 'Updated description',
            'stock' => 50,
        ];

        $response = $this->actingAs($user)->patchJson("/api/v1/products/{$product->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Product Name')
            ->assertJsonPath('data.price', '25.99')
            ->assertJsonPath('data.stock', 50);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
            'price' => 25.99,
        ]);
    }

    #[Group('mvp')]
    public function test_product_update_auto_generates_slug_when_name_changes(): void
    {
        $user = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Original Name',
            'slug' => 'original-name'
        ]);
        
        $updateData = ['name' => 'New Product Name'];

        $response = $this->actingAs($user)->patchJson("/api/v1/products/{$product->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'new-product-name');
    }

    #[Group('mvp')]
    public function test_unauthenticated_user_cannot_update_product(): void
    {
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);
        
        $updateData = ['name' => 'Unauthorized Update'];

        $response = $this->patchJson("/api/v1/products/{$product->id}", $updateData);

        $response->assertStatus(401);
        $this->assertDatabaseMissing('products', ['name' => 'Unauthorized Update']);
    }

    #[Group('mvp')]
    public function test_authenticated_user_can_delete_product(): void
    {
        $user = User::factory()->producer()->create();
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $response = $this->actingAs($user)->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    #[Group('mvp')]
    public function test_unauthenticated_user_cannot_delete_product(): void
    {
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $response = $this->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(401);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    #[Group('mvp')]
    public function test_products_index_filtering_by_category(): void
    {
        $producer = Producer::factory()->create();
        Product::factory()->create(['producer_id' => $producer->id, 'category' => 'fruits', 'is_active' => true]);
        Product::factory()->create(['producer_id' => $producer->id, 'category' => 'vegetables', 'is_active' => true]);

        $response = $this->getJson('/api/v1/products?category=fruits');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category', 'fruits');
    }

    #[Group('mvp')]
    public function test_products_index_filtering_by_organic(): void
    {
        $producer = Producer::factory()->create();
        Product::factory()->create(['producer_id' => $producer->id, 'is_organic' => true, 'is_active' => true]);
        Product::factory()->create(['producer_id' => $producer->id, 'is_organic' => false, 'is_active' => true]);

        $response = $this->getJson('/api/v1/products?is_organic=1');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_organic', true);
    }

    #[Group('mvp')]
    public function test_products_index_filtering_by_price_range(): void
    {
        $producer = Producer::factory()->create();
        Product::factory()->create(['producer_id' => $producer->id, 'price' => 5.00, 'is_active' => true]);
        Product::factory()->create(['producer_id' => $producer->id, 'price' => 15.00, 'is_active' => true]);
        Product::factory()->create(['producer_id' => $producer->id, 'price' => 25.00, 'is_active' => true]);

        $response = $this->getJson('/api/v1/products?min_price=10&max_price=20');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    #[Group('mvp')]
    public function test_products_index_search_functionality(): void
    {
        $producer = Producer::factory()->create();
        Product::factory()->create([
            'producer_id' => $producer->id, 
            'name' => 'Fresh Tomatoes',
            'description' => 'Red juicy tomatoes',
            'is_active' => true
        ]);
        Product::factory()->create([
            'producer_id' => $producer->id, 
            'name' => 'Green Apples',
            'description' => 'Crispy green apples',
            'is_active' => true
        ]);

        $response = $this->getJson('/api/v1/products?q=tomato');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Fresh Tomatoes');
    }
}