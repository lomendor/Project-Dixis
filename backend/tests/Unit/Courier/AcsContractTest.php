<?php

namespace Tests\Unit\Courier;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Producer;
use App\Models\Shipment;
use App\Models\User;
use App\Services\Courier\AcsCourierProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AcsContractTest extends TestCase
{
    use RefreshDatabase;

    private AcsCourierProvider $provider;
    private Order $testOrder;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.acs.api_key' => 'test_api_key',
            'services.acs.client_id' => 'test_client_id',
            'services.acs.client_secret' => 'test_client_secret',
            'services.acs.api_base' => 'https://sandbox-api.acs.gr/v1',
        ]);

        // Don't set up global fakes - let each test set up its own
        Http::preventStrayRequests();

        $this->provider = new AcsCourierProvider();

        // Create test data
        $user = User::factory()->create();
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'weight_per_unit' => 1.0,
        ]);

        $this->testOrder = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'shipping_address' => [
                'street' => 'Test Address 123',
                'city' => 'Athens',
                'postal_code' => '11527',
                'country' => 'GR',
            ],
        ]);

        OrderItem::factory()->create([
            'order_id' => $this->testOrder->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 10.00,
            'total_price' => 20.00,
        ]);
    }

    public function test_provider_returns_correct_code()
    {
        $this->assertEquals('acs', $this->provider->getProviderCode());
    }

    public function test_provider_is_healthy_with_proper_config()
    {
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
        ]);

        $this->assertTrue($this->provider->isHealthy());
    }

    public function test_provider_is_unhealthy_without_api_key()
    {
        config(['services.acs.api_key' => '']);

        $provider = new AcsCourierProvider();

        $this->assertFalse($provider->isHealthy());
    }

    public function test_create_label_returns_expected_structure()
    {
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::response([
                'shipment_id' => 'ACS123456789',
                'tracking_code' => 'ACS123456789',
                'awb_number' => 'ACS123456789',
                'label_pdf_url' => 'https://sandbox-api.acs.gr/v1/labels/ACS123456789.pdf',
                'status' => 'created',
                'estimated_delivery_days' => 2,
            ], 201),
        ]);

        $result = $this->provider->createLabel($this->testOrder->id);

        // Verify response structure matches our interface
        $this->assertArrayHasKey('tracking_code', $result);
        $this->assertArrayHasKey('label_url', $result);
        $this->assertArrayHasKey('carrier_code', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('provider', $result);

        // Verify ACS-specific values
        $this->assertEquals('ACS', $result['carrier_code']);
        $this->assertEquals('labeled', $result['status']);
        $this->assertEquals('acs', $result['provider']);

        // Verify tracking code format (ACS + 9 digits)
        $this->assertMatchesRegularExpression('/^ACS\d{9}$/', $result['tracking_code']);

        // Verify label URL format (real ACS API response)
        $this->assertStringContainsString('sandbox-api.acs.gr', $result['label_url']);
        $this->assertStringEndsWith('.pdf', $result['label_url']);
    }

    public function test_create_label_is_idempotent()
    {
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::response([
                'shipment_id' => 'ACS123456789',
                'tracking_code' => 'ACS123456789',
                'awb_number' => 'ACS123456789',
                'label_pdf_url' => 'https://sandbox-api.acs.gr/v1/labels/ACS123456789.pdf',
                'status' => 'created',
                'estimated_delivery_days' => 2,
            ], 201),
        ]);

        // Create label first time
        $firstResult = $this->provider->createLabel($this->testOrder->id);

        // Create label second time - should return same result
        $secondResult = $this->provider->createLabel($this->testOrder->id);

        $this->assertEquals($firstResult['tracking_code'], $secondResult['tracking_code']);
        $this->assertEquals($firstResult['label_url'], $secondResult['label_url']);
        $this->assertEquals($firstResult['carrier_code'], $secondResult['carrier_code']);
    }

    public function test_get_tracking_returns_expected_structure()
    {
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::response([
                'shipment_id' => 'ACS123456789',
                'tracking_code' => 'ACS123456789',
                'awb_number' => 'ACS123456789',
                'label_pdf_url' => 'https://sandbox-api.acs.gr/v1/labels/ACS123456789.pdf',
                'status' => 'created',
                'estimated_delivery_days' => 2,
            ], 201),
            'sandbox-api.acs.gr/v1/shipments/*' => Http::response([
                'tracking_code' => 'ACS123456789',
                'status' => 'in_transit',
                'estimated_delivery' => now()->addDays(2)->toDateString(),
                'events' => [
                    [
                        'datetime' => now()->subHours(6)->toISOString(),
                        'status' => 'picked_up',
                        'location' => 'Athens Sorting Center',
                        'description' => 'Package picked up from sender',
                    ],
                    [
                        'datetime' => now()->subHours(2)->toISOString(),
                        'status' => 'in_transit',
                        'location' => 'Athens Hub',
                        'description' => 'Package in transit to destination',
                    ],
                ],
            ], 200),
        ]);

        // First create a label to have a tracking code
        $labelResult = $this->provider->createLabel($this->testOrder->id);
        $trackingCode = $labelResult['tracking_code'];

        $result = $this->provider->getTracking($trackingCode);

        // Verify response structure
        $this->assertArrayHasKey('tracking_code', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('carrier_code', $result);
        $this->assertArrayHasKey('carrier_name', $result);
        $this->assertArrayHasKey('tracking_url', $result);
        $this->assertArrayHasKey('order_id', $result);
        $this->assertArrayHasKey('events', $result);
        $this->assertArrayHasKey('estimated_delivery', $result);

        // Verify values
        $this->assertEquals($trackingCode, $result['tracking_code']);
        $this->assertEquals('ACS', $result['carrier_code']);
        $this->assertEquals('ACS Courier', $result['carrier_name']);
        $this->assertEquals($this->testOrder->id, $result['order_id']);

        // Verify tracking URL format
        $this->assertStringContainsString('acscourier.net/track/', $result['tracking_url']);
        $this->assertStringContainsString($trackingCode, $result['tracking_url']);

        // Verify events structure
        $this->assertIsArray($result['events']);
        if (!empty($result['events'])) {
            $firstEvent = $result['events'][0];
            $this->assertArrayHasKey('timestamp', $firstEvent);
            $this->assertArrayHasKey('status', $firstEvent);
            $this->assertArrayHasKey('location', $firstEvent);
            $this->assertArrayHasKey('description', $firstEvent);
        }
    }

    public function test_get_tracking_returns_null_for_nonexistent_code()
    {
        $result = $this->provider->getTracking('NONEXISTENT123');

        $this->assertNull($result);
    }

    public function test_mock_response_matches_expected_acs_format()
    {
        // This test ensures our mock responses match what we expect from real ACS API
        $labelFixture = json_decode(
            file_get_contents(base_path('tests/Fixtures/acs/label_created_response.json')),
            true
        );

        // Verify fixture has expected ACS API structure
        $this->assertArrayHasKey('success', $labelFixture);
        $this->assertArrayHasKey('data', $labelFixture);
        $this->assertTrue($labelFixture['success']);

        $data = $labelFixture['data'];
        $this->assertArrayHasKey('tracking_code', $data);
        $this->assertArrayHasKey('label_url', $data);
        $this->assertArrayHasKey('carrier_code', $data);
        $this->assertArrayHasKey('estimated_delivery_days', $data);

        // Verify tracking code format matches ACS pattern
        $this->assertMatchesRegularExpression('/^ACS\d{9}$/', $data['tracking_code']);
    }

    public function test_tracking_fixture_matches_expected_acs_format()
    {
        $trackingFixture = json_decode(
            file_get_contents(base_path('tests/Fixtures/acs/tracking_response.json')),
            true
        );

        // Verify fixture has expected ACS API structure
        $this->assertArrayHasKey('success', $trackingFixture);
        $this->assertArrayHasKey('data', $trackingFixture);
        $this->assertTrue($trackingFixture['success']);

        $data = $trackingFixture['data'];
        $this->assertArrayHasKey('tracking_code', $data);
        $this->assertArrayHasKey('status', $data);
        $this->assertArrayHasKey('events', $data);
        $this->assertArrayHasKey('estimated_delivery', $data);

        // Verify events structure
        $this->assertIsArray($data['events']);
        if (!empty($data['events'])) {
            $event = $data['events'][0];
            $this->assertArrayHasKey('timestamp', $event);
            $this->assertArrayHasKey('status', $event);
            $this->assertArrayHasKey('location', $event);
            $this->assertArrayHasKey('description', $event);
        }
    }

    public function test_error_fixture_matches_expected_acs_format()
    {
        $errorFixture = json_decode(
            file_get_contents(base_path('tests/Fixtures/acs/error_response.json')),
            true
        );

        // Verify fixture has expected ACS error structure
        $this->assertArrayHasKey('success', $errorFixture);
        $this->assertArrayHasKey('error', $errorFixture);
        $this->assertFalse($errorFixture['success']);

        $error = $errorFixture['error'];
        $this->assertArrayHasKey('code', $error);
        $this->assertArrayHasKey('message', $error);
        $this->assertArrayHasKey('details', $error);

        // Verify error code format
        $this->assertEquals('VALIDATION_ERROR', $error['code']);
    }

    public function test_create_label_includes_idempotency_header()
    {
        // Reset HTTP fake for this specific test
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::response([
                'shipment_id' => 'ACS123456789',
                'tracking_code' => 'ACS123456789',
                'awb_number' => 'ACS123456789',
                'label_pdf_url' => 'https://sandbox-api.acs.gr/v1/labels/ACS123456789.pdf',
                'status' => 'created',
                'estimated_delivery_days' => 2,
            ], 201),
        ]);

        $result = $this->provider->createLabel($this->testOrder->id);

        // Assert that POST requests include the Idempotency-Key header
        Http::assertSent(function ($request) {
            if ($request->method() === 'POST' && str_contains($request->url(), 'shipments')) {
                return $request->hasHeader('Idempotency-Key') &&
                       !empty($request->header('Idempotency-Key')[0]);
            }
            return true; // Allow other requests (like zones)
        });

        // Verify successful response (has tracking_code, not 'success' key)
        $this->assertArrayHasKey('tracking_code', $result);
        $this->assertArrayHasKey('label_url', $result);
    }

    public function test_error_mapping_for_bad_request_422()
    {
        // Create a new order for this test to avoid idempotency issues
        $newOrder = Order::factory()->create([
            'user_id' => $this->testOrder->user_id,
            'total' => 50.00,
            'status' => 'pending',
        ]);

        // Mock 422 error response
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::response([], 422),
        ]);

        $result = $this->provider->createLabel($newOrder->id);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertFalse($result['success']);
        $this->assertEquals('BAD_REQUEST', $result['code']);
        $this->assertEquals(422, $result['http']);
        $this->assertEquals('Invalid request data', $result['message']);
    }

    public function test_error_mapping_for_rate_limit_429()
    {
        // Create a new order for this test to avoid idempotency issues
        $newOrder = Order::factory()->create([
            'user_id' => $this->testOrder->user_id,
            'total' => 60.00,
            'status' => 'pending',
        ]);

        // Mock 429 error with Retry-After header
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::response([], 429, ['Retry-After' => '60']),
        ]);

        $result = $this->provider->createLabel($newOrder->id);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertFalse($result['success']);
        $this->assertEquals('RATE_LIMIT', $result['code']);
        $this->assertEquals(429, $result['http']);
        $this->assertEquals('60', $result['retryAfter']);
    }

    public function test_error_mapping_for_provider_unavailable_500()
    {
        // Create a new order for this test to avoid idempotency issues
        $newOrder = Order::factory()->create([
            'user_id' => $this->testOrder->user_id,
            'total' => 70.00,
            'status' => 'pending',
        ]);

        // Mock 500 server error
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::sequence()
                ->push([], 500) // First attempt fails
                ->push([], 500) // Second attempt fails
                ->push([], 500), // Third attempt fails
        ]);

        $result = $this->provider->createLabel($newOrder->id);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertFalse($result['success']);
        $this->assertEquals('PROVIDER_UNAVAILABLE', $result['code']);
        $this->assertEquals(503, $result['http']);
        $this->assertEquals('Courier service temporarily unavailable', $result['message']);
    }

    public function test_tracking_with_retry_on_server_error()
    {
        // Create a shipment first
        $shipment = Shipment::create([
            'order_id' => $this->testOrder->id,
            'tracking_code' => 'TEST_RETRY_123',
            'carrier_code' => 'ACS',
            'status' => 'in_transit',
        ]);

        // Mock sequence: fail twice, then succeed
        Http::fake([
            'sandbox-api.acs.gr/v1/shipments/TEST_RETRY_123' => Http::sequence()
                ->push([], 500) // First attempt fails
                ->push([], 500) // Second attempt fails
                ->push([
                    'tracking_code' => 'TEST_RETRY_123',
                    'status' => 'delivered',
                    'estimated_delivery' => now()->toDateString(),
                    'events' => [
                        [
                            'datetime' => now()->toISOString(),
                            'status' => 'delivered',
                            'location' => 'Customer Address',
                            'description' => 'Package delivered',
                        ],
                    ],
                ], 200), // Third attempt succeeds
        ]);

        $result = $this->provider->getTracking('TEST_RETRY_123');

        // Should succeed after retries
        $this->assertNotNull($result);
        $this->assertEquals('TEST_RETRY_123', $result['tracking_code'] ?? null);
        $this->assertEquals('delivered', $result['status'] ?? null);

        // Verify that 3 requests were made (original + 2 retries)
        Http::assertSentCount(3);
    }
}