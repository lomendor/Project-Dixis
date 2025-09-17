<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('smoke')]
class FrontendSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected $consumer;

    protected $producer;

    protected $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Create demo users
        $this->consumer = User::create([
            'name' => 'Demo Consumer',
            'email' => 'consumer@demo.com',
            'password' => Hash::make('password'),
            'role' => 'consumer',
            'email_verified_at' => now(),
        ]);

        $producerUser = User::create([
            'name' => 'Demo Producer',
            'email' => 'producer@demo.com',
            'password' => Hash::make('password'),
            'role' => 'producer',
            'email_verified_at' => now(),
        ]);

        // Create producer profile
        $this->producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        // Create category
        $category = Category::create(['name' => 'Vegetables', 'slug' => 'vegetables']);

        // Create product with category and images
        $this->product = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Organic Tomatoes',
            'description' => 'Fresh organic tomatoes from local farm',
            'price' => 3.50,
            'is_active' => true,
        ]);

        $this->product->categories()->attach($category->id);

        ProductImage::create([
            'product_id' => $this->product->id,
            'url' => 'https://example.com/tomatoes.jpg',
            'is_primary' => true,
            'sort_order' => 0,
        ]);
    }

    public function test_frontend_smoke_flow_login_list_products_view_details(): void
    {
        // STEP 1: Consumer Login
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'consumer@demo.com',
            'password' => 'password',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'role'],
                'token',
                'token_type',
            ]);

        $token = $loginResponse->json('token');
        $this->assertNotEmpty($token);

        // STEP 2: List Public Products (no auth needed but testing with auth)
        $listResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/v1/public/products');

        $listResponse->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'price',
                        'categories',
                        'images',
                        'producer',
                    ],
                ],
                'total',
                'per_page',
            ]);

        $products = $listResponse->json('data');
        $this->assertGreaterThan(0, count($products));
        $this->assertEquals('Organic Tomatoes', $products[0]['name']);

        // STEP 3: View Product Details
        $productId = $products[0]['id'];
        $detailResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson("/api/v1/public/products/{$productId}");

        $detailResponse->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'description',
                'price',
                'unit',
                'stock',
                'is_active',
                'categories' => [
                    '*' => ['id', 'name', 'slug'],
                ],
                'images' => [
                    '*' => ['id', 'url', 'is_primary', 'sort_order'],
                ],
                'producer' => ['id', 'name'],
                'created_at',
                'updated_at',
            ])
            ->assertJson([
                'id' => $this->product->id,
                'name' => 'Organic Tomatoes',
                'description' => 'Fresh organic tomatoes from local farm',
                'price' => '3.50',
                'is_active' => true,
            ]);

        // Validate categories are present
        $categories = $detailResponse->json('categories');
        $this->assertCount(1, $categories);
        $this->assertEquals('Vegetables', $categories[0]['name']);

        // Validate images are present and primary is first
        $images = $detailResponse->json('images');
        $this->assertCount(1, $images);
        $this->assertTrue($images[0]['is_primary']);

        // Validate producer information
        $producer = $detailResponse->json('producer');
        $this->assertEquals($this->producer->id, $producer['id']);
    }

    public function test_frontend_smoke_flow_without_authentication(): void
    {
        // Test that public endpoints work without authentication (for frontend browsing)

        // STEP 1: List Public Products (no auth)
        $listResponse = $this->getJson('/api/v1/public/products');

        $listResponse->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'price',
                        'categories',
                        'images',
                        'producer',
                    ],
                ],
                'total',
            ]);

        $products = $listResponse->json('data');
        $this->assertGreaterThan(0, count($products));

        // STEP 2: View Product Details (no auth)
        $productId = $products[0]['id'];
        $detailResponse = $this->getJson("/api/v1/public/products/{$productId}");

        $detailResponse->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'description',
                'price',
                'categories',
                'images',
                'producer',
            ]);
    }

    public function test_frontend_smoke_producer_authentication_flow(): void
    {
        // Test producer-specific authentication and access

        // STEP 1: Producer Login
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'producer@demo.com',
            'password' => 'password',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJson([
                'user' => [
                    'role' => 'producer',
                ],
            ]);

        $token = $loginResponse->json('token');

        // STEP 2: Get Producer Profile
        $profileResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/v1/auth/profile');

        $profileResponse->assertStatus(200)
            ->assertJson([
                'user' => [
                    'email' => 'producer@demo.com',
                    'role' => 'producer',
                ],
            ]);

        // STEP 3: Access Producer KPI (should work if producer has products)
        $kpiResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/v1/producer/dashboard/kpi');

        $kpiResponse->assertStatus(200)
            ->assertJsonStructure([
                'total_products',
                'active_products',
                'total_orders',
                'revenue',
            ]);
    }

    public function test_frontend_smoke_search_and_filter_functionality(): void
    {
        // Create additional products for testing search/filter
        $fruitCategory = Category::create(['name' => 'Fruits', 'slug' => 'fruits']);

        $appleProduct = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Fresh Apples',
            'description' => 'Crispy red apples',
            'price' => 4.00,
            'is_active' => true,
        ]);
        $appleProduct->categories()->attach($fruitCategory->id);

        // STEP 1: Test search functionality
        $searchResponse = $this->getJson('/api/v1/public/products?search=tomato');

        $searchResponse->assertStatus(200);
        $products = $searchResponse->json('data');
        $this->assertGreaterThan(0, count($products));
        $this->assertStringContainsStringIgnoringCase('tomato', $products[0]['name']);

        // STEP 2: Test category filtering
        $filterResponse = $this->getJson('/api/v1/public/products?category=vegetables');

        $filterResponse->assertStatus(200);
        $products = $filterResponse->json('data');
        $this->assertGreaterThan(0, count($products));

        foreach ($products as $product) {
            $categoryNames = collect($product['categories'])->pluck('slug')->toArray();
            $this->assertContains('vegetables', $categoryNames);
        }

        // STEP 3: Test sorting
        $sortResponse = $this->getJson('/api/v1/public/products?sort=name&dir=asc');

        $sortResponse->assertStatus(200);
        $products = $sortResponse->json('data');
        $this->assertGreaterThan(1, count($products));

        // Check if products are sorted by name
        $names = collect($products)->pluck('name')->toArray();
        $sortedNames = collect($names)->sort()->values()->toArray();
        $this->assertEquals($sortedNames, $names);
    }

    public function test_frontend_smoke_pagination(): void
    {
        // STEP 1: Test pagination with per_page parameter
        $paginationResponse = $this->getJson('/api/v1/public/products?per_page=1');

        $paginationResponse->assertStatus(200)
            ->assertJsonPath('per_page', 1)
            ->assertJsonStructure([
                'current_page',
                'data',
                'first_page_url',
                'from',
                'last_page',
                'last_page_url',
                'links',
                'next_page_url',
                'path',
                'per_page',
                'prev_page_url',
                'to',
                'total',
            ]);
    }

    public function test_frontend_smoke_error_handling(): void
    {
        // STEP 1: Test 404 for non-existent product
        $response = $this->getJson('/api/v1/public/products/99999');
        $response->assertStatus(404);

        // STEP 2: Test 401 for protected routes without auth
        $response = $this->getJson('/api/v1/auth/profile');
        $response->assertStatus(401);

        // STEP 3: Test validation errors for login
        $response = $this->postJson('/api/v1/auth/login', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }
}
