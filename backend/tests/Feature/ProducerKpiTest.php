<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

#[Group('mvp')]
class ProducerKpiTest extends TestCase
{
    use RefreshDatabase;
    
    protected $user;
    protected $producer;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create producer user with role
        $this->user = User::factory()->create([
            'email' => 'kpi-producer@test.com',
            'role' => 'producer'
        ]);
        
        // Create producer profile
        $this->producer = Producer::factory()->create([
            'user_id' => $this->user->id
        ]);
        
        // Create some products for the producer
        Product::factory()->count(3)->create([
            'producer_id' => $this->producer->id
        ]);
    }

    /**
     * Test KPI endpoint returns correct structure for authenticated producer.
     */
    public function test_kpi_endpoint_returns_correct_structure()
    {
        // Authenticate as producer user
        Sanctum::actingAs($this->user);

        // Make request to KPI endpoint
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');

        // Assert successful response
        $response->assertStatus(200);

        // Assert response structure contains required KPI fields
        $response->assertJsonStructure([
            'orders',
            'revenue',
            'products',
            'payouts'
        ]);

        // Assert all values are numeric
        $data = $response->json();
        $this->assertIsInt($data['orders']);
        $this->assertIsNumeric($data['revenue']);
        $this->assertIsInt($data['products']);
        $this->assertIsNumeric($data['payouts']);
    }

    /**
     * Test KPI endpoint requires authentication.
     */
    public function test_kpi_endpoint_requires_authentication()
    {
        // Make request without authentication
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');

        // Should return 401 Unauthorized
        $response->assertStatus(401);
    }

    /**
     * Test KPI endpoint with test data returns non-zero values.
     */
    public function test_kpi_endpoint_returns_test_data()
    {
        // Authenticate as producer user
        Sanctum::actingAs($this->user);

        // Make request to KPI endpoint
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');

        // Assert successful response
        $response->assertStatus(200);

        $data = $response->json();
        
        // With test data, these should be non-zero
        $this->assertGreaterThan(0, $data['orders'], 'Orders should be greater than 0 with test data');
        $this->assertGreaterThan(0, $data['revenue'], 'Revenue should be greater than 0 with test data');
        $this->assertGreaterThan(0, $data['products'], 'Products should be greater than 0 with test data');
        $this->assertGreaterThan(0, $data['payouts'], 'Payouts should be greater than 0 with test data');
    }

    /**
     * Test API endpoint accessibility and response time.
     */
    public function test_kpi_endpoint_performance()
    {
        Sanctum::actingAs($this->user);
        
        $startTime = microtime(true);
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');
        $endTime = microtime(true);
        
        $responseTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
        
        // Assert response is under 1 second (1000ms)
        $this->assertLessThan(1000, $responseTime, 'KPI endpoint should respond within 1 second');
        
        // Assert successful response
        $response->assertStatus(200);
    }
}