<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Producer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PublicProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_products_list_ok(): void
    {
        // Create producer and product for testing
        $producer = User::factory()->create(['role' => 'producer']);
        $producerProfile = Producer::factory()->create(['user_id' => $producer->id]);
        Product::factory()->create([
            'producer_id' => $producerProfile->id,
            'is_active' => true
        ]);

        $res = $this->getJson('/api/v1/public/products', ['Accept'=>'application/json']);
        $res->assertStatus(200)->assertJsonStructure(['data' => [['id','name']]]);
    }
}
