<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Producer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ShippingProviderIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Order $testOrder;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        Role::create(['name' => 'admin']);

        // Define admin-access gate
        Gate::define('admin-access', function ($user) {
            return $user->hasRole('admin');
        });

        // Create admin user
        $this->admin = User::factory()->create();
        $this->admin->syncRoles(['admin']);

        // Create test order
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

    public function test_create_label_with_default_provider()
    {
        // Ensure default configuration
        config(['services.courier.provider' => 'none']);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");


        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tracking_code',
                    'label_url',
                    'carrier_code',
                    'status',
                ],
            ]);

        $this->assertTrue($response->json('success'));
        $this->assertNotEmpty($response->json('data.tracking_code'));
        $this->assertNotEmpty($response->json('data.label_url'));
        $this->assertEquals('labeled', $response->json('data.status'));
    }

    public function test_create_label_with_acs_provider_configured()
    {
        // Configure ACS provider with credentials
        config([
            'services.courier.provider' => 'acs',
            'services.acs.api_key' => 'test_api_key',
            'services.acs.client_id' => 'test_client_id',
            'services.acs.client_secret' => 'test_client_secret',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tracking_code',
                    'label_url',
                    'carrier_code',
                    'status',
                ],
            ]);

        $this->assertTrue($response->json('success'));

        // ACS provider should generate ACS-style tracking code
        $trackingCode = $response->json('data.tracking_code');
        $this->assertMatchesRegularExpression('/^ACS\d{9}$/', $trackingCode);
        $this->assertEquals('ACS', $response->json('data.carrier_code'));
        $this->assertEquals('labeled', $response->json('data.status'));
    }

    public function test_create_label_with_acs_provider_unhealthy_fallback()
    {
        // Configure ACS provider but without credentials (unhealthy)
        config([
            'services.courier.provider' => 'acs',
            'services.acs.api_key' => '',
            'services.acs.client_id' => '',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tracking_code',
                    'label_url',
                    'carrier_code',
                    'status',
                ],
            ]);

        $this->assertTrue($response->json('success'));

        // Should fallback to internal provider (ELTA or default)
        $trackingCode = $response->json('data.tracking_code');
        $this->assertStringStartsWith('DX', $trackingCode); // Internal provider prefix
    }

    public function test_get_tracking_with_enhanced_provider_data()
    {
        // First create a label with ACS provider
        config([
            'services.courier.provider' => 'acs',
            'services.acs.api_key' => 'test_api_key',
            'services.acs.client_id' => 'test_client_id',
            'services.acs.client_secret' => 'test_client_secret',
        ]);

        $labelResponse = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");

        $trackingCode = $labelResponse->json('data.tracking_code');

        // Now test tracking
        $response = $this->getJson("/api/v1/shipping/tracking/{$trackingCode}");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tracking_code',
                    'status',
                    'carrier_code',
                    'shipped_at',
                    'delivered_at',
                    'estimated_delivery',
                    'events',
                ],
            ]);

        $this->assertTrue($response->json('success'));
        $this->assertEquals($trackingCode, $response->json('data.tracking_code'));
        $this->assertEquals('ACS', $response->json('data.carrier_code'));
        $this->assertIsArray($response->json('data.events'));
    }

    public function test_get_tracking_with_default_provider()
    {
        // Create label with default provider
        config(['services.courier.provider' => 'none']);

        $labelResponse = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");

        $trackingCode = $labelResponse->json('data.tracking_code');

        // Now test tracking
        $response = $this->getJson("/api/v1/shipping/tracking/{$trackingCode}");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tracking_code',
                    'status',
                    'carrier_code',
                    'shipped_at',
                    'delivered_at',
                    'estimated_delivery',
                    'events',
                ],
            ]);

        $this->assertTrue($response->json('success'));
        $this->assertEquals($trackingCode, $response->json('data.tracking_code'));
        $this->assertStringStartsWith('DX', $trackingCode);
    }

    public function test_label_creation_authorization_required()
    {
        // Test without authentication
        $response = $this->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");
        $response->assertUnauthorized();

        // Test with regular user (not admin)
        $user = User::factory()->create();
        $response = $this->actingAs($user)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");
        $response->assertForbidden();
    }

    public function test_tracking_access_control()
    {
        // Create label first
        config(['services.courier.provider' => 'none']);

        $labelResponse = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");

        $trackingCode = $labelResponse->json('data.tracking_code');

        // Test public access (no auth required for tracking by code)
        $response = $this->getJson("/api/v1/shipping/tracking/{$trackingCode}");
        $response->assertOk();

        // Test order owner access
        $orderOwner = $this->testOrder->user;
        $response = $this->actingAs($orderOwner)
            ->getJson("/api/v1/shipping/tracking/{$trackingCode}");
        $response->assertOk();

        // Test admin access
        $response = $this->actingAs($this->admin)
            ->getJson("/api/v1/shipping/tracking/{$trackingCode}");
        $response->assertOk();
    }

    public function test_provider_idempotency()
    {
        config([
            'services.courier.provider' => 'acs',
            'services.acs.api_key' => 'test_api_key',
            'services.acs.client_id' => 'test_client_id',
        ]);

        // Create label first time
        $response1 = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");

        // Create label second time
        $response2 = $this->actingAs($this->admin)
            ->postJson("/api/v1/shipping/labels/{$this->testOrder->id}");

        // Should return the same data
        $this->assertEquals($response1->json('data'), $response2->json('data'));
        $this->assertEquals(
            $response1->json('data.tracking_code'),
            $response2->json('data.tracking_code')
        );
    }

    public function test_quote_endpoint_unaffected_by_provider_change()
    {
        // Configure ACS provider
        config([
            'services.courier.provider' => 'acs',
            'services.acs.api_key' => 'test_api_key',
            'services.acs.client_id' => 'test_client_id',
        ]);

        // Create quote request
        $quoteData = [
            'items' => [
                [
                    'product_id' => $this->testOrder->orderItems->first()->product_id,
                    'quantity' => 2,
                ],
            ],
            'postal_code' => '11527',
        ];

        $response = $this->postJson('/api/v1/shipping/quote', $quoteData);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'cost_cents',
                    'cost_eur',
                    'zone_code',
                    'zone_name',
                    'carrier_code',
                    'estimated_delivery_days',
                    'breakdown',
                ],
            ]);

        // Quote should work regardless of courier provider configuration
        $this->assertTrue($response->json('success'));
        $this->assertIsNumeric($response->json('data.cost_eur'));
    }
}