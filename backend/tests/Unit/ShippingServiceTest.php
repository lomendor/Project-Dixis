<?php

namespace Tests\Unit;

use App\Services\ShippingService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippingServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShippingService $shippingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->shippingService = new ShippingService();
    }

    public function test_volumetric_weight_calculation_precision()
    {
        // Test exact calculations with different precision requirements
        $testCases = [
            // [length, width, height, expected_volumetric_weight]
            [10, 10, 10, 0.2],      // 1000 / 5000 = 0.2 kg
            [25, 20, 15, 1.5],      // 7500 / 5000 = 1.5 kg
            [30, 25, 20, 3.0],      // 15000 / 5000 = 3.0 kg
            [5, 5, 5, 0.025],       // 125 / 5000 = 0.025 kg
            [100, 50, 30, 30.0],    // 150000 / 5000 = 30.0 kg
        ];

        foreach ($testCases as [$length, $width, $height, $expected]) {
            $result = $this->shippingService->computeVolumetricWeight($length, $width, $height);
            $this->assertEquals($expected, $result,
                "Volumetric weight for {$length}x{$width}x{$height} should be {$expected} kg"
            );
        }
    }

    public function test_volumetric_weight_edge_cases()
    {
        // Test zero dimensions
        $this->assertEquals(0.0, $this->shippingService->computeVolumetricWeight(0, 10, 10));
        $this->assertEquals(0.0, $this->shippingService->computeVolumetricWeight(10, 0, 10));
        $this->assertEquals(0.0, $this->shippingService->computeVolumetricWeight(10, 10, 0));

        // Test very small dimensions
        $this->assertEquals(0.0002, $this->shippingService->computeVolumetricWeight(1, 1, 1));

        // Test decimal dimensions
        $this->assertEquals(0.04, $this->shippingService->computeVolumetricWeight(10.5, 9.5, 2.0));
    }

    public function test_billable_weight_edge_cases()
    {
        // Test zero weights
        $this->assertEquals(0.0, $this->shippingService->computeBillableWeight(0.0, 0.0));

        // Test negative weights (should handle gracefully)
        $this->assertEquals(0.0, $this->shippingService->computeBillableWeight(-1.0, 2.0));
        $this->assertEquals(0.0, $this->shippingService->computeBillableWeight(2.0, -1.0));

        // Test very small differences
        $this->assertEquals(1.001, $this->shippingService->computeBillableWeight(1.001, 1.000));
        $this->assertEquals(1.001, $this->shippingService->computeBillableWeight(1.000, 1.001));
    }

    public function test_zone_detection_comprehensive()
    {
        $zoneTestCases = [
            // Athens Metro - comprehensive range
            ['10431', 'GR_ATTICA'], ['11527', 'GR_ATTICA'], ['12345', 'GR_ATTICA'],
            ['15561', 'GR_ATTICA'], ['16777', 'GR_ATTICA'], ['17778', 'GR_ATTICA'],

            // Thessaloniki - all variations
            ['54001', 'GR_THESSALONIKI'], ['54622', 'GR_THESSALONIKI'], ['54999', 'GR_THESSALONIKI'],
            ['55000', 'GR_THESSALONIKI'], ['55102', 'GR_THESSALONIKI'], ['55555', 'GR_THESSALONIKI'],
            ['56000', 'GR_THESSALONIKI'], ['56789', 'GR_THESSALONIKI'], ['56999', 'GR_THESSALONIKI'],

            // Crete - comprehensive coverage
            ['70000', 'GR_CRETE'], ['71202', 'GR_CRETE'], ['72100', 'GR_CRETE'],
            ['73000', 'GR_CRETE'], ['73100', 'GR_CRETE'], ['74100', 'GR_CRETE'],

            // Large Islands
            ['80000', 'GR_ISLANDS_LARGE'], ['81000', 'GR_ISLANDS_LARGE'], ['82000', 'GR_ISLANDS_LARGE'],
            ['83000', 'GR_ISLANDS_LARGE'], ['84100', 'GR_ISLANDS_LARGE'], ['85100', 'GR_ISLANDS_LARGE'],

            // Small Islands
            ['86000', 'GR_ISLANDS_SMALL'], ['87000', 'GR_ISLANDS_SMALL'], ['88000', 'GR_ISLANDS_SMALL'],

            // Mainland - various codes
            ['20000', 'GR_MAINLAND'], ['26500', 'GR_MAINLAND'], ['30000', 'GR_MAINLAND'],
            ['38221', 'GR_MAINLAND'], ['40000', 'GR_MAINLAND'], ['50000', 'GR_MAINLAND'],
            ['60000', 'GR_MAINLAND'], ['65000', 'GR_MAINLAND'], ['90000', 'GR_MAINLAND'],
        ];

        foreach ($zoneTestCases as [$postalCode, $expectedZone]) {
            $zone = $this->invokePrivateMethod($this->shippingService, 'detectZone', [$postalCode]);
            $this->assertEquals($expectedZone, $zone,
                "Postal code {$postalCode} should map to zone {$expectedZone}"
            );
        }
    }

    public function test_zone_detection_invalid_codes()
    {
        $invalidCodes = [
            // Invalid format
            '1234',     // Too short
            '123456',   // Too long
            'ABCDE',    // Letters
            '00000',    // Invalid Greek postal code
            '99999',    // Invalid Greek postal code
            '',         // Empty
            '12345ABCD' // Mixed format
        ];

        foreach ($invalidCodes as $invalidCode) {
            $zone = $this->invokePrivateMethod($this->shippingService, 'detectZone', [$invalidCode]);
            $this->assertEquals('GR_MAINLAND', $zone,
                "Invalid postal code '{$invalidCode}' should default to GR_MAINLAND"
            );
        }
    }

    public function test_weight_tier_classification()
    {
        $tierTestCases = [
            // [weight, expected_tier_name, base_rate_multiplier]
            [0.5, 'tier_0_2kg', 1.0],
            [1.5, 'tier_0_2kg', 1.0],
            [2.0, 'tier_0_2kg', 1.0],
            [2.1, 'tier_2_5kg', 1.2],
            [3.5, 'tier_2_5kg', 1.2],
            [5.0, 'tier_2_5kg', 1.2],
            [5.1, 'tier_above_5kg', 'per_kg'],
            [10.0, 'tier_above_5kg', 'per_kg'],
            [25.5, 'tier_above_5kg', 'per_kg'],
        ];

        foreach ($tierTestCases as [$weight, $expectedTier, $expectedMultiplier]) {
            $tier = $this->invokePrivateMethod($this->shippingService, 'getWeightTier', [$weight]);

            $this->assertArrayHasKey('tier', $tier);
            $this->assertEquals($expectedTier, $tier['tier']);

            if ($expectedMultiplier !== 'per_kg') {
                $this->assertArrayHasKey('multiplier', $tier);
                $this->assertEquals($expectedMultiplier, $tier['multiplier']);
            }
        }
    }

    public function test_producer_profile_loading()
    {
        $validProfiles = ['flat_rate', 'free_shipping', 'premium_producer', 'local_producer'];

        foreach ($validProfiles as $profile) {
            $profileData = $this->invokePrivateMethod($this->shippingService, 'loadProducerProfile', [$profile]);

            $this->assertIsArray($profileData);
            $this->assertArrayHasKey('name', $profileData);
            $this->assertArrayHasKey('type', $profileData);
        }

        // Test invalid profile defaults to standard
        $invalidProfile = $this->invokePrivateMethod($this->shippingService, 'loadProducerProfile', ['invalid_profile']);
        $this->assertEquals('standard', $invalidProfile['type']);
    }

    public function test_cost_calculation_precision()
    {
        // Test that costs are calculated to proper precision (cents)
        $mockOrder = $this->createMockOrder(2.5, 'single_item');

        // Calculate cost for different zones to test precision
        $zones = ['GR_ATTICA', 'GR_THESSALONIKI', 'GR_CRETE'];

        foreach ($zones as $zone) {
            $cost = $this->invokePrivateMethod(
                $this->shippingService,
                'calculateCostForZone',
                [$mockOrder, $zone, 2.5]
            );

            // Cost should be in cents (integer)
            $this->assertIsInt($cost);
            $this->assertGreaterThan(0, $cost);

            // Should be reasonable range (€2-15 = 200-1500 cents)
            $this->assertGreaterThanOrEqual(200, $cost);
            $this->assertLessThanOrEqual(1500, $cost);
        }
    }

    public function test_tracking_code_generation()
    {
        $trackingCodes = [];

        // Generate 100 tracking codes to test uniqueness
        for ($i = 0; $i < 100; $i++) {
            $code = $this->invokePrivateMethod($this->shippingService, 'generateTrackingCode', ['ELTA']);

            // Should be 12 characters (ELTA + 8 digit number)
            $this->assertEquals(12, strlen($code));
            $this->assertStringStartsWith('ELTA', $code);

            // Should be unique
            $this->assertNotContains($code, $trackingCodes);
            $trackingCodes[] = $code;
        }

        // Test different carriers
        $carriers = ['ACS', 'SPEEDEX'];
        foreach ($carriers as $carrier) {
            $code = $this->invokePrivateMethod($this->shippingService, 'generateTrackingCode', [$carrier]);
            $this->assertStringStartsWith($carrier, $code);
        }
    }

    public function test_estimated_delivery_calculation()
    {
        $deliveryTestCases = [
            ['GR_ATTICA', 1],
            ['GR_THESSALONIKI', 2],
            ['GR_MAINLAND', 2],
            ['GR_CRETE', 4],
            ['GR_ISLANDS_LARGE', 5],
            ['GR_ISLANDS_SMALL', 7],
        ];

        foreach ($deliveryTestCases as [$zone, $expectedDays]) {
            $days = $this->invokePrivateMethod($this->shippingService, 'getEstimatedDeliveryDays', [$zone]);
            $this->assertEquals($expectedDays, $days);
        }
    }

    public function test_breakdown_calculation_completeness()
    {
        $mockOrder = $this->createMockOrder(3.0, 'multiple_items');

        $breakdown = $this->invokePrivateMethod(
            $this->shippingService,
            'calculateCostBreakdown',
            [$mockOrder, 'GR_ATTICA', 3.0, null]
        );

        $requiredKeys = [
            'base_cost_cents',
            'weight_adjustment_cents',
            'volume_adjustment_cents',
            'zone_multiplier',
            'producer_discount_cents',
            'total_cost_cents'
        ];

        foreach ($requiredKeys as $key) {
            $this->assertArrayHasKey($key, $breakdown, "Breakdown should include {$key}");
        }

        // Verify mathematical consistency
        $calculatedTotal = $breakdown['base_cost_cents']
                         + $breakdown['weight_adjustment_cents']
                         + $breakdown['volume_adjustment_cents']
                         - $breakdown['producer_discount_cents'];

        $this->assertEquals($breakdown['total_cost_cents'], $calculatedTotal,
            'Breakdown total should equal sum of components'
        );
    }

    private function createMockOrder(float $weight, string $type): object
    {
        return (object) [
            'id' => 1,
            'total_weight_kg' => $weight,
            'total_volume_cm3' => $weight * 1000, // Approximate volume
            'item_count' => $type === 'single_item' ? 1 : 3,
            'subtotal_cents' => 2000, // €20.00
            'user_id' => 1
        ];
    }

    private function invokePrivateMethod($object, $methodName, array $parameters = [])
    {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs($object, $parameters);
    }
}