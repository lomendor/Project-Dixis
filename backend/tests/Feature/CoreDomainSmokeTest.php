<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;

class CoreDomainSmokeTest extends TestCase
{
    use RefreshDatabase;
    
    /**
     * Test health check endpoint returns 200
     */
    public function test_health_check_returns_success(): void
    {
        $response = $this->get('/api/health');
        
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'database' => 'connected',
            ]);
    }
    
    /**
     * Test products index returns 200 with JSON array
     */
    public function test_products_index_returns_json_array(): void
    {
        // Create test data
        $producer = Producer::factory()->create();
        Product::factory()->create(['producer_id' => $producer->id]);
        Product::factory()->create(['producer_id' => $producer->id]);
        
        $response = $this->get('/api/v1/products');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
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
                'current_page',
                'per_page',
                'total'
            ]);
    }
    
    /**
     * Test create order happy path returns 201
     */
    public function test_create_order_happy_path(): void
    {
        // Create test data
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 10.00,
            'stock' => 100,
        ]);
        
        $orderData = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ]
            ],
            'shipping_method' => 'HOME',
            'notes' => 'Test order',
        ];
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders', $orderData);
        
        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'user_id',
                'subtotal',
                'tax_amount',
                'shipping_amount',
                'total_amount',
                'payment_status',
                'status',
                'order_items' => [
                    '*' => [
                        'id',
                        'product_id',
                        'quantity',
                        'unit_price',
                        'total_price',
                        'product_name',
                    ]
                ]
            ]);
    }
}
