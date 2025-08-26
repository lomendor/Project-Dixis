<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

#[\PHPUnit\Framework\Attributes\CoversClass(\App\Http\Controllers\Controller::class)]
class HealthTest extends TestCase
{
    public function test_health_endpoint_returns_success(): void
    {
        $res = $this->getJson('/api/health');
        $res->assertStatus(200)->assertJsonStructure(['status']);
    }
}
