<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test the health check endpoint returns success.
     */
    public function test_health_check_returns_success(): void
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'ok',
                 ])
                 ->assertJsonStructure([
                     'status',
                     'database',
                     'timestamp',
                     'version'
                 ]);
    }
}