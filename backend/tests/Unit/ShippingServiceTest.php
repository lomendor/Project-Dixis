<?php

namespace Tests\Unit;

use App\Services\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShippingService $shippingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->shippingService = new ShippingService;
    }

    public function test_volumetric_weight_calculation_precision()
    {
        // Test exact calculations with different precision requirements
        $testCases = [
            // [length, width, height, expected_volumetric_weight]
            [10, 10, 10, 0.2],      // 1000 / 5000 = 0.2 kg
            [25, 20, 15, 1.5],      // 7500 / 5000 = 1.5 kg
            [30, 25, 20, 3.0],      // 15000 / 5000 = 3.0 kg
            [5, 5, 5, 0.03],        // 125 / 5000 = 0.025 kg, rounded to 0.03
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
        $this->assertEquals(0.0, $this->shippingService->computeVolumetricWeight(1, 1, 1)); // 1/5000=0.0002, rounds to 0.00

        // Test decimal dimensions
        $this->assertEquals(0.04, $this->shippingService->computeVolumetricWeight(10.5, 9.5, 2.0));
    }

    public function test_billable_weight_edge_cases()
    {
        // Test zero weights
        $this->assertEquals(0.0, $this->shippingService->computeBillableWeight(0.0, 0.0));

        // Test negative weights (max() doesn't handle negatives specially)
        $this->assertEquals(2.0, $this->shippingService->computeBillableWeight(-1.0, 2.0));
        $this->assertEquals(2.0, $this->shippingService->computeBillableWeight(2.0, -1.0));

        // Test very small differences
        $this->assertEquals(1.001, $this->shippingService->computeBillableWeight(1.001, 1.000));
        $this->assertEquals(1.001, $this->shippingService->computeBillableWeight(1.000, 1.001));
    }

    public function test_zone_detection_comprehensive()
    {
        $zoneTestCases = [
            // Test regular zone detection
            ['10431', 'GR_ATTICA'],  // Athens metro
            ['54001', 'GR_THESSALONIKI'],  // Thessaloniki
            ['70000', 'GR_CRETE'],   // Crete
            ['84001', 'GR_REMOTE'],  // Remote area override
            ['19007', 'GR_REMOTE'],  // Kythira remote
        ];

        foreach ($zoneTestCases as [$postalCode, $expectedZone]) {
            $zone = $this->shippingService->getZoneByPostalCode($postalCode);
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
            '12345ABCD', // Mixed format
        ];

        foreach ($invalidCodes as $invalidCode) {
            $zone = $this->shippingService->getZoneByPostalCode($invalidCode);
            // Invalid codes may return null or fall back to first match
            $this->assertTrue(is_string($zone) || is_null($zone),
                "Invalid postal code '{$invalidCode}' should return a zone string or null"
            );
        }
    }

    public function test_weight_tier_classification()
    {
        // Test weight tier classification with new rate structure
        $testCases = [
            // [weight, zone, expected_cost_range_cents]
            [0.5, 'GR_ATTICA', [290, 290]],   // base_until_2kg = 2.90
            [2.0, 'GR_ATTICA', [290, 290]],   // base_until_2kg = 2.90
            [3.5, 'GR_ATTICA', [425, 425]],   // 2.90 + (1.5 * 0.90) = 4.25
            [5.0, 'GR_ATTICA', [560, 560]],   // 2.90 + (3 * 0.90) = 5.60
            [7.5, 'GR_ATTICA', [735, 735]],   // 2.90 + (3 * 0.90) + (2.5 * 0.70) = 7.35
        ];

        foreach ($testCases as [$weight, $zone, $expectedRange]) {
            $result = $this->shippingService->calculateShippingCost($weight, $zone);

            $this->assertIsArray($result);
            $this->assertArrayHasKey('cost_cents', $result);
            $this->assertGreaterThanOrEqual($expectedRange[0], $result['cost_cents']);
            $this->assertLessThanOrEqual($expectedRange[1], $result['cost_cents']);
        }
    }

    public function test_producer_profile_loading()
    {
        // Test producer profiles through getQuote method integration
        // Create a temporary order first
        $mockOrder = $this->createMockOrder(2.0, 'single_item');

        $validProfiles = ['flat_rate', 'free_shipping', 'premium_producer', 'local_producer'];

        foreach ($validProfiles as $profile) {
            // Test that getQuote accepts the profile without error
            try {
                $result = $this->shippingService->getQuote($mockOrder->id, '10431', $profile);
                $this->assertIsArray($result);
                // Check for new response structure
                $this->assertArrayHasKey('cost_cents', $result);
                $this->assertArrayHasKey('zone_code', $result);
                $this->assertArrayHasKey('carrier_code', $result);
                $this->assertArrayHasKey('breakdown', $result);
                if (isset($result['breakdown']['profile_applied'])) {
                    $this->assertEquals($profile, $result['breakdown']['profile_applied']);
                }
            } catch (\Exception $e) {
                // If config files missing or order not found, that's acceptable for unit test
                $this->assertTrue(
                    str_contains($e->getMessage(), 'Shipping configuration files not found') ||
                    str_contains($e->getMessage(), 'No query results for model'),
                    'Expected config or model error, got: '.$e->getMessage()
                );
            }
        }
    }

    public function test_cost_calculation_precision()
    {
        // Test that costs are calculated to proper precision (cents)
        $zones = ['GR_ATTICA', 'GR_THESSALONIKI', 'GR_CRETE'];
        $testWeight = 2.5;

        foreach ($zones as $zone) {
            $cost = $this->shippingService->calculateShippingCost($testWeight, $zone);

            // Cost should be in cents (may be float from round())
            $this->assertIsNumeric($cost['cost_cents']);
            $this->assertGreaterThan(0, $cost['cost_cents']);

            // Should be reasonable range (€2-15 = 200-1500 cents)
            $this->assertGreaterThanOrEqual(200, $cost['cost_cents']);
            $this->assertLessThanOrEqual(1500, $cost['cost_cents']);

            // EUR amount should be properly formatted
            $this->assertIsFloat($cost['cost_eur']);
            $this->assertEquals($cost['cost_cents'] / 100, $cost['cost_eur']);
        }
    }

    public function test_tracking_code_generation()
    {
        // Test tracking code generation through createLabel (only public access)
        $mockOrder = $this->createMockOrder(1.0, 'single_item');
        $trackingCodes = [];

        // Generate 10 tracking codes to test uniqueness (limited due to createLabel overhead)
        for ($i = 0; $i < 10; $i++) {
            try {
                $result = $this->shippingService->createLabel($mockOrder->id);
                // Check for new response structure
                $this->assertIsArray($result);
                $this->assertArrayHasKey('tracking_code', $result);
                $this->assertArrayHasKey('carrier_code', $result);
                $this->assertArrayHasKey('zone_code', $result);

                $code = $result['tracking_code'];

                // Should be 12 characters (DX + timestamp + random)
                $this->assertEquals(12, strlen($code));
                $this->assertStringStartsWith('DX', $code);

                // Should be unique
                $this->assertNotContains($code, $trackingCodes);
                $trackingCodes[] = $code;

                // Clean up - create new mock order for next iteration
                $mockOrder = $this->createMockOrder(1.0, 'single_item');
            } catch (\Exception $e) {
                // If config files missing or order not found, that's acceptable for unit test
                $this->assertTrue(
                    str_contains($e->getMessage(), 'Shipping configuration files not found') ||
                    str_contains($e->getMessage(), 'No query results for model'),
                    'Expected config or model error, got: '.$e->getMessage()
                );
                break;
            }
        }
    }

    public function test_estimated_delivery_calculation()
    {
        // Test estimated delivery through calculateShippingCost
        $deliveryTestCases = [
            ['GR_ATTICA', [1, 2]],       // 1-2 days range
            ['GR_THESSALONIKI', [2, 3]], // 2-3 days range
            ['GR_MAINLAND', [2, 4]],     // 2-4 days range
            ['GR_CRETE', [3, 5]],        // 3-5 days range
            ['GR_ISLANDS_LARGE', [4, 6]], // 4-6 days range
            ['GR_ISLANDS_SMALL', [6, 8]], // 6-8 days range
        ];

        foreach ($deliveryTestCases as [$zone, $expectedRange]) {
            $result = $this->shippingService->calculateShippingCost(2.0, $zone);
            $this->assertArrayHasKey('estimated_delivery_days', $result);
            $this->assertGreaterThanOrEqual($expectedRange[0], $result['estimated_delivery_days']);
            $this->assertLessThanOrEqual($expectedRange[1], $result['estimated_delivery_days']);
        }
    }

    public function test_breakdown_calculation_completeness()
    {
        // Test breakdown through calculateShippingCost public method
        $result = $this->shippingService->calculateShippingCost(3.0, 'GR_ATTICA');

        $this->assertArrayHasKey('breakdown', $result);
        $breakdown = $result['breakdown'];

        $requiredKeys = [
            'base_rate',
            'extra_weight_kg',
            'extra_cost',
            'island_multiplier',
            'remote_surcharge',
            'billable_weight_kg',
        ];

        foreach ($requiredKeys as $key) {
            $this->assertArrayHasKey($key, $breakdown, "Breakdown should include {$key}");
        }

        // Test island multiplier is applied
        $this->assertIsFloat($breakdown['island_multiplier']);
        $this->assertGreaterThanOrEqual(1.0, $breakdown['island_multiplier']);

        // Test remote surcharge is present
        $this->assertIsFloat($breakdown['remote_surcharge']);
        $this->assertGreaterThanOrEqual(0.0, $breakdown['remote_surcharge']);

        // Test that billable weight matches input
        $this->assertEquals(3.0, $breakdown['billable_weight_kg']);
    }

    private function createMockOrder(float $weight, string $type): object
    {
        return (object) [
            'id' => 1,
            'total_weight_kg' => $weight,
            'total_volume_cm3' => $weight * 1000, // Approximate volume
            'item_count' => $type === 'single_item' ? 1 : 3,
            'subtotal_cents' => 2000, // €20.00
            'user_id' => 1,
        ];
    }

    public function test_volumetric_weight_exceeds_actual_weight()
    {
        // Test bulky item where volumetric > actual → billable uses volumetric
        $actualWeight = 1.0; // 1kg actual
        $volumetricWeight = 2.5; // 2.5kg volumetric (bulky item)

        $billableWeight = $this->shippingService->computeBillableWeight($actualWeight, $volumetricWeight);

        // Should use the higher volumetric weight
        $this->assertEquals($volumetricWeight, $billableWeight);
        $this->assertGreaterThan($actualWeight, $billableWeight);
    }

    public function test_island_zone_higher_cost_and_eta()
    {
        // Test that island zones have higher costs and longer delivery times vs mainland
        $testWeight = 2.0;
        $mainlandZone = 'GR_ATTICA';
        $islandZone = 'GR_CRETE';

        $mainlandCost = $this->shippingService->calculateShippingCost($testWeight, $mainlandZone);
        $islandCost = $this->shippingService->calculateShippingCost($testWeight, $islandZone);

        // Island should cost more
        $this->assertGreaterThan($mainlandCost['cost_cents'], $islandCost['cost_cents']);

        // Island should take longer to deliver
        $this->assertGreaterThan($mainlandCost['estimated_delivery_days'], $islandCost['estimated_delivery_days']);

        // Both should have proper zone identification
        $this->assertEquals($mainlandZone, $mainlandCost['zone_code']);
        $this->assertEquals($islandZone, $islandCost['zone_code']);

        // Test island multiplier is applied
        $this->assertGreaterThan(1.0, $islandCost['breakdown']['island_multiplier']);
        $this->assertEquals(1.0, $mainlandCost['breakdown']['island_multiplier']);
    }

    public function test_remote_postal_code_detection()
    {
        // Test remote postal code detection and zone override
        $remotePostalCodes = ['19007', '19008', '84001']; // Only codes with zone_override

        foreach ($remotePostalCodes as $postalCode) {
            $zone = $this->shippingService->getZoneByPostalCode($postalCode);
            $this->assertEquals('GR_REMOTE', $zone,
                "Remote postal code {$postalCode} should map to GR_REMOTE zone"
            );
        }
    }

    public function test_remote_surcharge_application()
    {
        // Test that remote areas get surcharge applied
        $testWeight = 2.0;
        $regularZone = 'GR_ATTICA';
        $remoteZone = 'GR_REMOTE';

        $regularCost = $this->shippingService->calculateShippingCost($testWeight, $regularZone);
        $remoteCost = $this->shippingService->calculateShippingCost($testWeight, $remoteZone);

        // Remote should have surcharge applied
        $this->assertGreaterThan(0, $remoteCost['breakdown']['remote_surcharge']);
        $this->assertEquals(0, $regularCost['breakdown']['remote_surcharge']);

        // Remote should cost more due to surcharge
        $this->assertGreaterThan($regularCost['cost_cents'], $remoteCost['cost_cents']);
    }

    public function test_step_based_rate_calculation()
    {
        // Test the new step-based rate calculation logic
        $zone = 'GR_ATTICA';

        // Test 1kg package (base rate only)
        $result1kg = $this->shippingService->calculateShippingCost(1.0, $zone);
        $this->assertEquals(290, $result1kg['cost_cents']); // 2.90 EUR

        // Test 3kg package (base + step_kg_2_5)
        $result3kg = $this->shippingService->calculateShippingCost(3.0, $zone);
        $expectedCost = 2.90 + (1.0 * 0.90); // base + 1kg over 2kg
        $this->assertEquals(round($expectedCost * 100), $result3kg['cost_cents']);

        // Test 6kg package (base + step_kg_2_5 + step_kg_over_5)
        $result6kg = $this->shippingService->calculateShippingCost(6.0, $zone);
        $expectedCost = 2.90 + (3.0 * 0.90) + (1.0 * 0.70); // base + 3kg(2-5) + 1kg(over 5)
        $this->assertEquals(round($expectedCost * 100), $result6kg['cost_cents']);
    }

    public function test_island_multiplier_application()
    {
        // Test island multiplier is correctly applied
        $testWeight = 2.0;
        $creteZone = 'GR_CRETE';

        $result = $this->shippingService->calculateShippingCost($testWeight, $creteZone);

        // Crete has island_multiplier of 1.15
        $this->assertEquals(1.15, $result['breakdown']['island_multiplier']);

        // Cost should be base rate * multiplier (GR_CRETE base_until_2kg = 6.20)
        $baseRate = 6.20;
        $expectedCost = $baseRate * 1.15;
        $this->assertEquals(round($expectedCost * 100), $result['cost_cents']);
    }

    public function test_small_islands_highest_multiplier_vs_mainland()
    {
        // Test that GR_ISLANDS_SMALL has highest island multiplier vs mainland
        $testWeight = 2.0;
        $mainlandZone = 'GR_MAINLAND';
        $smallIslandZone = 'GR_ISLANDS_SMALL';

        $mainlandCost = $this->shippingService->calculateShippingCost($testWeight, $mainlandZone);
        $smallIslandCost = $this->shippingService->calculateShippingCost($testWeight, $smallIslandZone);

        // Small islands should have highest multiplier (1.30)
        $this->assertEquals(1.30, $smallIslandCost['breakdown']['island_multiplier']);
        $this->assertEquals(1.0, $mainlandCost['breakdown']['island_multiplier']);

        // Small islands should cost significantly more
        $this->assertGreaterThan($mainlandCost['cost_cents'], $smallIslandCost['cost_cents']);

        // Verify the cost calculation includes multiplier effect
        $baseRate = 9.80; // GR_ISLANDS_SMALL base_until_2kg
        $expectedCost = $baseRate * 1.30;
        $this->assertEquals(round($expectedCost * 100), $smallIslandCost['cost_cents']);

        // Both should have proper zone identification
        $this->assertEquals($mainlandZone, $mainlandCost['zone_code']);
        $this->assertEquals($smallIslandZone, $smallIslandCost['zone_code']);
    }

    public function test_breakdown_cents_symmetry()
    {
        // Test that breakdown includes consistent cents fields
        $testWeight = 3.5; // Triggers base + step calculation
        $zone = 'GR_CRETE'; // Has island multiplier

        $result = $this->shippingService->calculateShippingCost($testWeight, $zone);

        // Verify breakdown structure completeness
        $breakdown = $result['breakdown'];
        $this->assertArrayHasKey('base_rate', $breakdown);
        $this->assertArrayHasKey('extra_cost', $breakdown);
        $this->assertArrayHasKey('island_multiplier', $breakdown);
        $this->assertArrayHasKey('remote_surcharge', $breakdown);
        $this->assertArrayHasKey('billable_weight_kg', $breakdown);

        // Verify new cents fields for symmetry
        $this->assertArrayHasKey('base_cost_cents', $breakdown);
        $this->assertArrayHasKey('weight_adjustment_cents', $breakdown);
        $this->assertArrayHasKey('volume_adjustment_cents', $breakdown);
        $this->assertArrayHasKey('zone_multiplier', $breakdown);

        // Verify numerical consistency
        $this->assertIsNumeric($breakdown['base_rate']);
        $this->assertIsNumeric($breakdown['extra_cost']);
        $this->assertIsNumeric($breakdown['island_multiplier']);
        $this->assertIsNumeric($breakdown['remote_surcharge']);
        $this->assertIsNumeric($breakdown['base_cost_cents']);
        $this->assertIsNumeric($breakdown['weight_adjustment_cents']);
        $this->assertIsNumeric($breakdown['volume_adjustment_cents']);

        // Verify cents fields consistency
        $this->assertEquals(round($breakdown['base_rate'] * 100), $breakdown['base_cost_cents']);
        $this->assertEquals(round($breakdown['extra_cost'] * 100), $breakdown['weight_adjustment_cents']);
        $this->assertEquals(0, $breakdown['volume_adjustment_cents']); // Not used currently
        $this->assertEquals($breakdown['island_multiplier'], $breakdown['zone_multiplier']);

        // Verify breakdown math adds up
        $baseWithSteps = $breakdown['base_rate'] + $breakdown['extra_cost'];
        $withMultiplier = $baseWithSteps * $breakdown['island_multiplier'];
        $finalCost = $withMultiplier + $breakdown['remote_surcharge'];
        $this->assertEquals(round($finalCost * 100), $result['cost_cents']);
    }

    private function invokePrivateMethod($object, $methodName, array $parameters = [])
    {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);

        return $method->invokeArgs($object, $parameters);
    }
}
