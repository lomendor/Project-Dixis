<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test health endpoint returns correct structure
     * @group mvp
     */
    public function test_health_endpoint_returns_success(): void
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'database' => 'connected',
            ])
            ->assertJsonStructure([
                'status',
                'database',
                'timestamp',
                'version'
            ]);
    }
}