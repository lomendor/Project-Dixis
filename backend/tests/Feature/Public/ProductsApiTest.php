<?php

namespace Tests\Feature\Public;

use App\Models\Product;
use App\Models\Producer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('api')]
class ProductsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test products
        Product::factory()->create([
            'name' => 'Test Oranges',
            'is_active' => true,
        ]);
        
        Product::factory()->create([
            'name' => 'Fresh Apples',
            'is_active' => true,
        ]);
        
        Product::factory()->create([
            'name' => 'Inactive Product',
            'is_active' => false,
        ]);
    }

    public function test_products_index_returns_paginated_json(): void
    {
        $response = $this->getJson('/api/v1/products');

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
                        'created_at',
                        'producer' => [
                            'id',
                            'name',
                            'slug',
                            'business_name',
                            'location'
                        ]
                    ]
                ],
                'links',
                'meta'
            ])
            ->assertJsonCount(2, 'data'); // Only active products
    }

    public function test_products_index_filters_by_search(): void
    {
        $response = $this->getJson('/api/v1/products?q=Orange');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Test Oranges');
    }

    public function test_products_index_filters_by_slug_search(): void
    {
        $product = Product::where('name', 'Fresh Apples')->first();
        $slug = $product->slug;

        $response = $this->getJson("/api/v1/products?q={$slug}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $slug);
    }

    public function test_products_show_returns_expected_fields(): void
    {
        $product = Product::where('is_active', true)->first();

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'price',
                    'stock',
                    'is_active',
                    'created_at',
                    'producer' => [
                        'id',
                        'name',
                        'slug',
                        'business_name',
                        'location'
                    ]
                ]
            ])
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name', $product->name)
            ->assertJsonPath('data.slug', $product->slug);
    }

    public function test_products_show_returns_404_for_nonexistent_product(): void
    {
        $response = $this->getJson('/api/v1/products/99999');

        $response->assertStatus(404);
    }

    public function test_products_show_returns_404_for_inactive_product(): void
    {
        $inactiveProduct = Product::where('is_active', false)->first();

        $response = $this->getJson("/api/v1/products/{$inactiveProduct->id}");

        $response->assertStatus(404);
    }

    public function test_products_index_excludes_producer_pii(): void
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200);
        
        $productData = $response->json('data.0');
        
        // Verify producer PII fields are not present
        $this->assertArrayNotHasKey('phone', $productData['producer'] ?? []);
        $this->assertArrayNotHasKey('email', $productData['producer'] ?? []);
        $this->assertArrayNotHasKey('user_id', $productData['producer'] ?? []);
    }

    public function test_products_show_excludes_producer_pii(): void
    {
        $product = Product::where('is_active', true)->first();

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200);
        
        $productData = $response->json('data');
        
        // Verify producer PII fields are not present
        $this->assertArrayNotHasKey('phone', $productData['producer'] ?? []);
        $this->assertArrayNotHasKey('email', $productData['producer'] ?? []);
        $this->assertArrayNotHasKey('user_id', $productData['producer'] ?? []);
    }
}