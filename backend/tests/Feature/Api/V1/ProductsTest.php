<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Producer;
use App\Models\Product;

class ProductsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test products index endpoint
     * @group mvp
     */
    public function test_products_index_returns_json_array(): void
    {
        // Create test data
        $producer = Producer::factory()->create();
        Product::factory()->create(['producer_id' => $producer->id, 'is_active' => true]);
        Product::factory()->create(['producer_id' => $producer->id, 'is_active' => true]);

        $response = $this->get('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'price',
                        'unit',
                        'status',
                        'producer' => [
                            'id',
                            'name',
                        ]
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

    /**
     * Test products show endpoint
     * @group mvp
     */
    public function test_products_show_returns_product_details(): void
    {
        // Create test data
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id, 'is_active' => true]);

        $response = $this->get("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'slug',
                'price',
                'unit',
                'status',
                'producer' => [
                    'id',
                    'name',
                ]
            ])
            ->assertJson([
                'id' => $product->id,
                'name' => $product->name,
            ]);
    }
}