<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProducerKpiAuthTest extends TestCase
{
    use RefreshDatabase;
    public function test_kpi_requires_authentication_returns_401(): void
    {
        $res = $this->getJson('/api/v1/producer/dashboard/kpi', ['Accept'=>'application/json']);
        $res->assertStatus(401);
    }

    public function test_kpi_with_producer_token_returns_200(): void
    {
        // Create producer user with producer profile
        $producer = User::factory()->create([
            'email' => 'producer@example.com',
            'role' => 'producer'
        ]);
        
        // Create producer profile
        \App\Models\Producer::factory()->create([
            'user_id' => $producer->id,
            'name' => 'Test Producer',
            'business_name' => 'Test Producer Business'
        ]);

        Sanctum::actingAs($producer);

        $res = $this->getJson('/api/v1/producer/dashboard/kpi', ['Accept'=>'application/json']);
        $res->assertStatus(200)->assertJsonStructure(['total_products','active_products','total_orders','revenue','unread_messages']);
    }
}
