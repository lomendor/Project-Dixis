<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Producer;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shipment;
use App\Services\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingEngineV1Test extends TestCase
{
    use RefreshDatabase;

    private ShippingService $shippingService;
    private User $testUser;
    private Product $testProduct;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shippingService = app(ShippingService::class);

        // Create test data
        $this->testUser = User::factory()->create([
            'email' => 'testuser@example.com',
            'role' => 'consumer'
        ]);

        $producer = Producer::factory()->create(['name' => 'Test Producer']);
        $category = Category::factory()->create(['name' => 'Test Category']);

        $this->testProduct = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 10.00,
            'producer_id' => $producer->id,
            'weight_per_unit' => 1.0
        ]);
    }

    public function test_volumetric_weight_calculation()
    {
        // Test standard volumetric weight formula: (L × W × H) / 5000
        $volumetricWeight = $this->shippingService->computeVolumetricWeight(30, 20, 15);

        // 30 × 20 × 15 = 9000 cm³
        // 9000 / 5000 = 1.8 kg
        $this->assertEquals(1.8, $volumetricWeight);

        // Test small package
        $smallVolumetric = $this->shippingService->computeVolumetricWeight(10, 10, 5);
        $this->assertEquals(0.1, $smallVolumetric); // 500 / 5000 = 0.1 kg

        // Test large package
        $largeVolumetric = $this->shippingService->computeVolumetricWeight(50, 40, 30);
        $this->assertEquals(12.0, $largeVolumetric); // 60000 / 5000 = 12.0 kg
    }

    public function test_billable_weight_calculation()
    {
        // Billable weight should be max(actual, volumetric)

        // Case 1: Actual weight higher
        $billable1 = $this->shippingService->computeBillableWeight(5.0, 2.0);
        $this->assertEquals(5.0, $billable1);

        // Case 2: Volumetric weight higher
        $billable2 = $this->shippingService->computeBillableWeight(1.0, 3.5);
        $this->assertEquals(3.5, $billable2);

        // Case 3: Equal weights
        $billable3 = $this->shippingService->computeBillableWeight(2.5, 2.5);
        $this->assertEquals(2.5, $billable3);
    }

    public function test_greek_zone_detection()
    {
        $testCases = [
            // Athens Metro
            ['11527', 'GR_ATTICA'],
            ['12345', 'GR_ATTICA'],

            // Thessaloniki
            ['54622', 'GR_THESSALONIKI'],
            ['55102', 'GR_THESSALONIKI'],

            // Crete
            ['71202', 'GR_CRETE'],
            ['73100', 'GR_CRETE'],

            // Large Islands
            ['84100', 'GR_ISLANDS_LARGE'],
            ['85100', 'GR_ISLANDS_LARGE'],

            // Mainland (fallback)
            ['26500', 'GR_MAINLAND'],
            ['38221', 'GR_MAINLAND']
        ];

        foreach ($testCases as [$postalCode, $expectedZone]) {
            $zone = $this->shippingService->getZoneByPostalCode($postalCode);
            $this->assertEquals($expectedZone, $zone, "Postal code {$postalCode} should map to {$expectedZone}");
        }
    }

    public function test_zone_based_pricing()
    {
        // Create test order
        $order = $this->createTestOrder(2.0); // 2kg total

        $testZones = [
            'GR_ATTICA' => ['11527', 3.50],
            'GR_THESSALONIKI' => ['54622', 4.00],
            'GR_CRETE' => ['71202', 8.00],
            'GR_ISLANDS_LARGE' => ['84100', 12.00],
            'GR_MAINLAND' => ['26500', 5.50]
        ];

        foreach ($testZones as $zoneCode => [$postalCode, $expectedBaseCost]) {
            $quote = $this->shippingService->getQuote($order->id, $postalCode);

            $this->assertArrayHasKey('cost_cents', $quote);
            $this->assertArrayHasKey('zone_code', $quote);
            $this->assertEquals($zoneCode, $quote['zone_code']);

            // For 2kg package in 0-2kg tier, cost should be close to base rate
            $costEur = $quote['cost_cents'] / 100;
            $this->assertGreaterThanOrEqual($expectedBaseCost * 0.9, $costEur);
            $this->assertLessThanOrEqual($expectedBaseCost * 1.5, $costEur);
        }
    }

    public function test_weight_tier_pricing()
    {
        $testWeights = [
            1.5 => 'tier_0_2kg',    // Light package
            3.5 => 'tier_2_5kg',    // Medium package
            8.0 => 'tier_above_5kg' // Heavy package
        ];

        foreach ($testWeights as $weight => $expectedTier) {
            $order = $this->createTestOrder($weight);
            $quote = $this->shippingService->getQuote($order->id, '11527'); // Athens

            $this->assertArrayHasKey('breakdown', $quote);

            // Heavier packages should cost more
            $costEur = $quote['cost_cents'] / 100;
            $this->assertGreaterThan(0, $costEur);

            if ($weight > 5.0) {
                // Above 5kg should use per-kg pricing
                $this->assertGreaterThan(6.0, $costEur);
            }
        }
    }

    public function test_producer_profile_overrides()
    {
        $order = $this->createTestOrder(2.0);

        // Test different producer profiles
        $profiles = [
            'flat_rate' => 5.00,
            'free_shipping' => 0.00, // Free shipping profile
            'premium_producer' => null, // Should use standard calculation
            'local_producer' => null   // Should use local rates
        ];

        foreach ($profiles as $profile => $expectedCost) {
            $quote = $this->shippingService->getQuote($order->id, '11527', $profile);

            $this->assertArrayHasKey('cost_cents', $quote);
            $costEur = $quote['cost_cents'] / 100;

            if ($expectedCost !== null) {
                $this->assertEquals($expectedCost, $costEur, "Profile {$profile} should have cost {$expectedCost}");
            } else {
                $this->assertGreaterThan(0, $costEur, "Profile {$profile} should have positive cost");
            }
        }
    }

    public function test_shipping_label_creation()
    {
        $order = $this->createTestOrder(2.0);

        $label = $this->shippingService->createLabel($order->id);

        $this->assertArrayHasKey('tracking_code', $label);
        $this->assertArrayHasKey('label_url', $label);
        $this->assertArrayHasKey('carrier_code', $label);

        // Verify shipment record was created
        $shipment = Shipment::where('order_id', $order->id)->first();
        $this->assertNotNull($shipment);
        $this->assertEquals($label['tracking_code'], $shipment->tracking_code);
        $this->assertEquals('labeled', $shipment->status);
    }

    public function test_api_shipping_quote_endpoint()
    {
        $this->actingAs($this->testUser);

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $this->testProduct->id,
                    'quantity' => 2
                ]
            ],
            'postal_code' => '11527'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'cost_cents',
                    'zone_code',
                    'carrier_code',
                    'estimated_delivery_days',
                    'breakdown'
                ]
            ]);

        $data = $response->json()['data'];
        $this->assertEquals('GR_ATTICA', $data['zone_code']);
        $this->assertGreaterThan(0, $data['cost_cents']);
    }

    public function test_api_shipping_quote_validation()
    {
        $this->actingAs($this->testUser);

        // Missing required fields
        $response = $this->postJson('/api/v1/shipping/quote', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items', 'postal_code']);

        // Invalid postal code
        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                ['product_id' => $this->testProduct->id, 'quantity' => 1]
            ],
            'postal_code' => '123' // Too short
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['postal_code']);

        // Invalid product
        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                ['product_id' => 99999, 'quantity' => 1] // Non-existent product
            ],
            'postal_code' => '11527'
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.product_id']);
    }

    public function test_api_create_label_endpoint()
    {
        $adminUser = User::factory()->create(['role' => 'admin']);
        $this->actingAs($adminUser);

        $order = $this->createTestOrder(2.0);

        $response = $this->postJson("/api/v1/shipping/labels/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tracking_code',
                    'label_url',
                    'carrier_code'
                ]
            ]);

        // Verify shipment was created
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'status' => 'labeled'
        ]);
    }

    public function test_api_create_label_authorization()
    {
        // Regular user should not be able to create labels
        $this->actingAs($this->testUser);

        $order = $this->createTestOrder(2.0);

        $response = $this->postJson("/api/v1/shipping/labels/{$order->id}");
        $response->assertStatus(403); // Forbidden
    }

    public function test_api_tracking_endpoint()
    {
        $order = $this->createTestOrder(2.0);
        $shipment = Shipment::factory()->create([
            'order_id' => $order->id,
            'tracking_code' => 'TEST123456789',
            'status' => 'in_transit'
        ]);

        $response = $this->getJson("/api/v1/shipping/tracking/{$shipment->tracking_code}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tracking_code',
                    'status',
                    'carrier_code'
                ]
            ]);

        $data = $response->json()['data'];
        $this->assertEquals('TEST123456789', $data['tracking_code']);
        $this->assertEquals('in_transit', $data['status']);
    }

    public function test_shipping_cost_calculation_edge_cases()
    {
        // Test zero weight (should use minimum)
        $order = $this->createTestOrder(0.0);
        $quote = $this->shippingService->getQuote($order->id, '11527');
        $this->assertGreaterThan(0, $quote['cost_cents']);

        // Test very heavy package
        $heavyOrder = $this->createTestOrder(50.0);
        $heavyQuote = $this->shippingService->getQuote($heavyOrder->id, '11527');
        $this->assertGreaterThan($quote['cost_cents'], $heavyQuote['cost_cents']);

        // Test invalid postal code (should default to mainland)
        $invalidQuote = $this->shippingService->getQuote($order->id, '00000');
        $this->assertEquals('GR_MAINLAND', $invalidQuote['zone_code']);
    }

    private function createTestOrder(float $totalWeight): Order
    {
        $order = Order::factory()->create([
            'user_id' => $this->testUser->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 20.00,
            'total' => 20.00
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->testProduct->id,
            'quantity' => (int) ceil($totalWeight), // Approximate quantity based on weight
            'unit_price' => $this->testProduct->price,
            'total_price' => $this->testProduct->price * ceil($totalWeight),
            'product_name' => $this->testProduct->name,
            'product_unit' => $this->testProduct->unit ?? 'piece'
        ]);

        return $order;
    }

    private function invokePrivateMethod($object, $methodName, array $parameters = [])
    {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs($object, $parameters);
    }
}