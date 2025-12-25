<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProducerKpiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_kpi_requires_authentication_returns_401(): void
    {
        $res = $this->getJson('/api/v1/producer/dashboard/kpi', ['Accept' => 'application/json']);
        $res->assertStatus(401);
    }

    public function test_kpi_with_producer_token_returns_200(): void
    {
        // Create producer user with producer profile
        $producer = User::factory()->create([
            'email' => 'producer@example.com',
            'role' => 'producer',
        ]);

        // Create producer profile
        \App\Models\Producer::factory()->create([
            'user_id' => $producer->id,
            'name' => 'Test Producer',
            'business_name' => 'Test Producer Business',
        ]);

        Sanctum::actingAs($producer);

        $res = $this->getJson('/api/v1/producer/dashboard/kpi', ['Accept' => 'application/json']);
        $res->assertStatus(200)->assertJsonStructure(['total_products', 'active_products', 'total_orders', 'revenue', 'unread_messages']);
    }

    public function test_kpi_with_consumer_token_returns_403(): void
    {
        // Create consumer user (no producer profile)
        $consumer = User::factory()->create([
            'email' => 'consumer@example.com',
            'role' => 'consumer',
        ]);

        Sanctum::actingAs($consumer);

        $res = $this->getJson('/api/v1/producer/dashboard/kpi', ['Accept' => 'application/json']);
        $res->assertStatus(403)->assertJson(['message' => 'Producer profile not found']);
    }

    public function test_top_products_requires_authentication_returns_401(): void
    {
        $res = $this->getJson('/api/v1/producer/dashboard/top-products', ['Accept' => 'application/json']);
        $res->assertStatus(401);
    }

    public function test_top_products_with_producer_token_returns_200(): void
    {
        // Create producer user with producer profile
        $producer = User::factory()->create([
            'email' => 'producer2@example.com',
            'role' => 'producer',
        ]);

        // Create producer profile
        \App\Models\Producer::factory()->create([
            'user_id' => $producer->id,
            'name' => 'Test Producer 2',
            'business_name' => 'Test Producer Business 2',
        ]);

        Sanctum::actingAs($producer);

        $res = $this->getJson('/api/v1/producer/dashboard/top-products', ['Accept' => 'application/json']);
        $res->assertStatus(200)->assertJsonStructure(['top_products']);
    }

    public function test_top_products_with_consumer_token_returns_403(): void
    {
        // Create consumer user (no producer profile)
        $consumer = User::factory()->create([
            'email' => 'consumer2@example.com',
            'role' => 'consumer',
        ]);

        Sanctum::actingAs($consumer);

        $res = $this->getJson('/api/v1/producer/dashboard/top-products', ['Accept' => 'application/json']);
        $res->assertStatus(403)->assertJson(['message' => 'Producer profile not found']);
    }
}
