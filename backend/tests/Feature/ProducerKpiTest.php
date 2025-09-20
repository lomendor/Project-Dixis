<?php

namespace Tests\Feature;

use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

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
            'role' => 'producer',
        ]);

        // Create producer profile
        $this->producer = Producer::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // Create some products for the producer
        Product::factory()->count(3)->create([
            'producer_id' => $this->producer->id,
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
            'total_products',
            'active_products',
            'total_orders',
            'revenue',
            'unread_messages',
        ]);

        // Assert all values are numeric
        $data = $response->json();
        $this->assertIsInt($data['total_products']);
        $this->assertIsInt($data['active_products']);
        $this->assertIsInt($data['total_orders']);
        $this->assertIsNumeric($data['revenue']);
        $this->assertIsInt($data['unread_messages']);
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

        // With test data, products should be non-zero, others can be zero initially
        $this->assertGreaterThanOrEqual(0, $data['total_orders'], 'Total orders should be >= 0');
        $this->assertGreaterThanOrEqual(0, $data['revenue'], 'Revenue should be >= 0');
        $this->assertGreaterThan(0, $data['total_products'], 'Products should be greater than 0 with test data');
        $this->assertGreaterThanOrEqual(0, $data['active_products'], 'Active products should be >= 0');
        $this->assertGreaterThanOrEqual(0, $data['unread_messages'], 'Unread messages should be >= 0');
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
