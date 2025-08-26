<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Product;
use App\Models\Producer;
use App\Models\Category;
use App\Models\ProductImage;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;

#[Group('mvp')]
class PublicProductsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create producer and categories for testing
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        
        $vegetables = Category::create(['name' => 'Vegetables', 'slug' => 'vegetables']);
        $fruits = Category::create(['name' => 'Fruits', 'slug' => 'fruits']);
        
        // Create active products
        $tomatoes = Product::factory()->create([
            'name' => 'Organic Tomatoes',
            'description' => 'Fresh organic tomatoes',
            'price' => 3.50,
            'producer_id' => $producer->id,
            'is_active' => true,
            'is_organic' => true
        ]);
        $tomatoes->categories()->attach($vegetables->id);
        
        $apples = Product::factory()->create([
            'name' => 'Fresh Apples',
            'description' => 'Crispy red apples',
            'price' => 4.00,
            'producer_id' => $producer->id,
            'is_active' => true,
            'is_organic' => false
        ]);
        $apples->categories()->attach($fruits->id);
        
        // Create second producer for producer filter tests
        $user2 = User::factory()->create(['role' => 'producer']);
        $producer2 = Producer::factory()->create(['user_id' => $user2->id, 'slug' => 'farm-fresh']);
        
        $carrots = Product::factory()->create([
            'name' => 'Farm Carrots',
            'description' => 'Fresh farm carrots',
            'price' => 2.50,
            'producer_id' => $producer2->id,
            'is_active' => true,
            'is_organic' => true
        ]);
        $carrots->categories()->attach($vegetables->id);
        
        // Create inactive product
        $lettuce = Product::factory()->create([
            'name' => 'Fresh Lettuce',
            'producer_id' => $producer->id,
            'is_active' => false
        ]);
        $lettuce->categories()->attach($vegetables->id);
        
        // Add images
        ProductImage::create([
            'product_id' => $tomatoes->id,
            'url' => 'https://example.com/tomatoes.jpg',
            'is_primary' => true,
            'sort_order' => 0
        ]);
    }

    public function test_public_products_index_returns_paginated_structure(): void
    {
        $response = $this->get('/api/v1/public/products');

        $response->assertStatus(200)
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
                        'producer'
                    ]
                ],
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

    public function test_public_products_index_returns_only_active_products(): void
    {
        $response = $this->get('/api/v1/public/products');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(3, $data); // Should only return active products
        
        foreach ($data as $product) {
            $this->assertTrue($product['is_active']);
        }
    }

    public function test_search_filter_works(): void
    {
        $response = $this->get('/api/v1/public/products?search=tomatoes');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(0, count($data));
        $this->assertStringContainsStringIgnoringCase('tomatoes', $data[0]['name']);
    }

    public function test_category_filter_by_slug_works(): void
    {
        $response = $this->get('/api/v1/public/products?category=vegetables');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(0, count($data));
        
        // Check that returned products belong to vegetables category
        foreach ($data as $product) {
            $categoryNames = collect($product['categories'])->pluck('slug');
            $this->assertTrue($categoryNames->contains('vegetables'));
        }
    }

    public function test_sort_by_price_desc_works(): void
    {
        $response = $this->get('/api/v1/public/products?sort=price&dir=desc');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(1, count($data));
        
        // Check that products are sorted by price descending
        $prices = collect($data)->pluck('price');
        $sortedPrices = $prices->sort()->reverse()->values();
        $this->assertEquals($sortedPrices, $prices);
    }

    public function test_sort_by_name_asc_works(): void
    {
        $response = $this->get('/api/v1/public/products?sort=name&dir=asc');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(1, count($data));
        
        // Check that products are sorted by name ascending
        $names = collect($data)->pluck('name');
        $sortedNames = $names->sort()->values();
        $this->assertEquals($sortedNames, $names);
    }

    public function test_pagination_works(): void
    {
        // Test per_page parameter
        $response = $this->get('/api/v1/public/products?per_page=1');

        $response->assertStatus(200)
            ->assertJsonPath('per_page', 1)
            ->assertJsonPath('total', 3); // We have 3 active products
    }

    public function test_per_page_max_limit_enforced(): void
    {
        $response = $this->get('/api/v1/public/products?per_page=200');

        $response->assertStatus(200)
            ->assertJsonPath('per_page', 100); // Should be capped at 100
    }

    public function test_producer_filter_by_slug_works(): void
    {
        $response = $this->get('/api/v1/public/products?producer=farm-fresh');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(0, count($data));
        
        // Check that all returned products belong to the farm-fresh producer
        foreach ($data as $product) {
            $this->assertEquals('farm-fresh', $product['producer']['slug'] ?? '');
        }
    }

    public function test_price_range_filters_work(): void
    {
        // Test minimum price filter
        $response = $this->get('/api/v1/public/products?min_price=3.00');
        $response->assertStatus(200);
        $data = $response->json('data');
        
        foreach ($data as $product) {
            $this->assertGreaterThanOrEqual(3.00, (float)$product['price']);
        }
        
        // Test maximum price filter
        $response = $this->get('/api/v1/public/products?max_price=3.00');
        $response->assertStatus(200);
        $data = $response->json('data');
        
        foreach ($data as $product) {
            $this->assertLessThanOrEqual(3.00, (float)$product['price']);
        }
        
        // Test price range filter
        $response = $this->get('/api/v1/public/products?min_price=2.50&max_price=3.50');
        $response->assertStatus(200);
        $data = $response->json('data');
        
        foreach ($data as $product) {
            $price = (float)$product['price'];
            $this->assertGreaterThanOrEqual(2.50, $price);
            $this->assertLessThanOrEqual(3.50, $price);
        }
    }

    public function test_organic_filter_works(): void
    {
        // Test organic=true filter
        $response = $this->get('/api/v1/public/products?organic=true');
        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(0, count($data));
        foreach ($data as $product) {
            $this->assertTrue($product['is_organic']);
        }
        
        // Test organic=false filter
        $response = $this->get('/api/v1/public/products?organic=false');
        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertGreaterThan(0, count($data));
        foreach ($data as $product) {
            $this->assertFalse($product['is_organic']);
        }
    }

    public function test_combined_filters_work(): void
    {
        // Test combining multiple filters
        $response = $this->get('/api/v1/public/products?category=vegetables&organic=true&max_price=4.00');
        
        $response->assertStatus(200);
        $data = $response->json('data');
        
        foreach ($data as $product) {
            // Should be organic
            $this->assertTrue($product['is_organic']);
            
            // Should be in vegetables category
            $categoryNames = collect($product['categories'])->pluck('slug');
            $this->assertTrue($categoryNames->contains('vegetables'));
            
            // Should be under max price
            $this->assertLessThanOrEqual(4.00, (float)$product['price']);
        }
    }
}
