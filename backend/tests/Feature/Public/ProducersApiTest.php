<?php

namespace Tests\Feature\Public;

use App\Models\Producer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('api')]
class ProducersApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test producers
        Producer::factory()->create([
            'name' => 'Green Valley Farm',
            'is_active' => true,
        ]);

        Producer::factory()->create([
            'name' => 'Mountain Harvest',
            'is_active' => true,
        ]);

        Producer::factory()->create([
            'name' => 'Inactive Farm',
            'is_active' => false,
        ]);
    }

    public function test_producers_index_returns_paginated_json(): void
    {
        $response = $this->getJson('/api/v1/producers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'business_name',
                        'description',
                        'location',
                        'website',
                        'is_active',
                        'created_at',
                    ],
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(2, 'data'); // Only active producers
    }

    public function test_producers_index_excludes_pii(): void
    {
        $response = $this->getJson('/api/v1/producers');

        $response->assertStatus(200);

        $producerData = $response->json('data.0');

        // Verify PII fields are not present
        $this->assertArrayNotHasKey('phone', $producerData);
        $this->assertArrayNotHasKey('email', $producerData);
        $this->assertArrayNotHasKey('user_id', $producerData);
    }

    public function test_producers_index_filters_by_name_search(): void
    {
        $response = $this->getJson('/api/v1/producers?q=Green');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Green Valley Farm');
    }

    public function test_producers_index_filters_by_slug_search(): void
    {
        $producer = Producer::where('name', 'Mountain Harvest')->first();
        $slug = $producer->slug;

        $response = $this->getJson("/api/v1/producers?q={$slug}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $slug);
    }

    public function test_producers_show_returns_expected_fields(): void
    {
        $producer = Producer::where('is_active', true)->first();

        $response = $this->getJson("/api/v1/producers/{$producer->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'business_name',
                    'description',
                    'location',
                    'website',
                    'is_active',
                    'created_at',
                ],
            ])
            ->assertJsonPath('data.id', $producer->id)
            ->assertJsonPath('data.name', $producer->name)
            ->assertJsonPath('data.slug', $producer->slug);
    }

    public function test_producers_show_excludes_pii(): void
    {
        $producer = Producer::where('is_active', true)->first();

        $response = $this->getJson("/api/v1/producers/{$producer->id}");

        $response->assertStatus(200);

        $producerData = $response->json('data');

        // Verify PII fields are not present
        $this->assertArrayNotHasKey('phone', $producerData);
        $this->assertArrayNotHasKey('email', $producerData);
        $this->assertArrayNotHasKey('user_id', $producerData);
    }

    public function test_producers_show_returns_404_for_nonexistent_producer(): void
    {
        $response = $this->getJson('/api/v1/producers/99999');

        $response->assertStatus(404);
    }

    public function test_producers_show_returns_404_for_inactive_producer(): void
    {
        $inactiveProducer = Producer::where('is_active', false)->first();

        $response = $this->getJson("/api/v1/producers/{$inactiveProducer->id}");

        $response->assertStatus(404);
    }

    public function test_producers_index_supports_pagination(): void
    {
        $response = $this->getJson('/api/v1/producers?per_page=1');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data',
                'links' => [
                    'first',
                    'last',
                    'prev',
                    'next',
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);
    }
}
