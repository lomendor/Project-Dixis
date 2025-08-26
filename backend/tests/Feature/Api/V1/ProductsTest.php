<?php

namespace Tests\Feature\Api\V1;

use PHPUnit\Framework\Attributes\Group;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Producer;
use App\Models\Product;

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
}