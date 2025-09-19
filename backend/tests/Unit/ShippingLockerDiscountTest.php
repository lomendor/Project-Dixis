<?php

namespace Tests\Unit;

use App\Services\ShippingService;
use Tests\TestCase;

class ShippingLockerDiscountTest extends TestCase
{
    private ShippingService $shippingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->shippingService = new ShippingService();
    }

    /** @test */
    public function applies_locker_discount_when_feature_enabled()
    {
        // Enable lockers and set discount
        config(['shipping.enable_lockers' => true]);
        config(['shipping.locker_discount_eur' => 2.0]);

        $billableWeight = 1.5; // kg
        $zoneCode = 'GR_ATTICA'; // Athens

        // Get cost for HOME delivery
        $homeCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'HOME');

        // Get cost for LOCKER delivery
        $lockerCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'LOCKER');

        // Locker should be cheaper
        $this->assertLessThan($homeCost['cost_cents'], $lockerCost['cost_cents']);

        // Discount should be exactly 200 cents (2.00 EUR)
        $expectedDiscount = 200; // 2.00 EUR = 200 cents
        $this->assertEquals($expectedDiscount, $lockerCost['breakdown']['locker_discount_cents']);

        // Verify actual discount applied
        $actualDiscount = $homeCost['cost_cents'] - $lockerCost['cost_cents'];
        $this->assertEquals($expectedDiscount, $actualDiscount);

        // Verify delivery method is included in response
        $this->assertEquals('HOME', $homeCost['delivery_method']);
        $this->assertEquals('LOCKER', $lockerCost['delivery_method']);
    }

    /** @test */
    public function no_discount_when_lockers_disabled()
    {
        // Disable lockers
        config(['shipping.enable_lockers' => false]);
        config(['shipping.locker_discount_eur' => 2.0]); // Set discount but feature disabled

        $billableWeight = 1.5; // kg
        $zoneCode = 'GR_ATTICA'; // Athens

        // Get cost for HOME delivery
        $homeCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'HOME');

        // Get cost for LOCKER delivery (should be same as HOME when disabled)
        $lockerCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'LOCKER');

        // Should be same cost
        $this->assertEquals($homeCost['cost_cents'], $lockerCost['cost_cents']);

        // No discount should be applied
        $this->assertEquals(0, $lockerCost['breakdown']['locker_discount_cents']);

        // Delivery method should still be set correctly
        $this->assertEquals('HOME', $homeCost['delivery_method']);
        $this->assertEquals('LOCKER', $lockerCost['delivery_method']);
    }

    /** @test */
    public function discount_cannot_make_cost_negative()
    {
        // Enable lockers with very high discount
        config(['shipping.enable_lockers' => true]);
        config(['shipping.locker_discount_eur' => 100.0]); // Very high discount

        $billableWeight = 0.5; // Small package
        $zoneCode = 'GR_ATTICA'; // Cheapest zone

        $lockerCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'LOCKER');

        // Cost should never be negative
        $this->assertGreaterThanOrEqual(0, $lockerCost['cost_cents']);
        $this->assertGreaterThanOrEqual(0, $lockerCost['cost_eur']);

        // Discount should be applied (recorded in breakdown)
        $this->assertGreaterThan(0, $lockerCost['breakdown']['locker_discount_cents']);
    }

    /** @test */
    public function discount_works_with_different_zones()
    {
        config(['shipping.enable_lockers' => true]);
        config(['shipping.locker_discount_eur' => 1.5]);

        $billableWeight = 2.0; // kg
        $expectedDiscount = 150; // 1.5 EUR = 150 cents

        $zones = ['GR_ATTICA', 'GR_THESSALONIKI', 'GR_MAINLAND', 'GR_CRETE'];

        foreach ($zones as $zoneCode) {
            $homeCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'HOME');
            $lockerCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'LOCKER');

            // Locker should be cheaper in all zones
            $this->assertLessThanOrEqual($homeCost['cost_cents'], $lockerCost['cost_cents'],
                "Locker should be cheaper or equal in zone {$zoneCode}");

            // Discount should be applied (unless cost goes to 0)
            if ($homeCost['cost_cents'] > $expectedDiscount) {
                $this->assertEquals($expectedDiscount, $lockerCost['breakdown']['locker_discount_cents'],
                    "Discount should be applied in zone {$zoneCode}");
            }
        }
    }

    /** @test */
    public function discount_amount_zero_has_no_effect()
    {
        config(['shipping.enable_lockers' => true]);
        config(['shipping.locker_discount_eur' => 0]); // No discount

        $billableWeight = 1.5; // kg
        $zoneCode = 'GR_ATTICA';

        $homeCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'HOME');
        $lockerCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'LOCKER');

        // Should be same cost
        $this->assertEquals($homeCost['cost_cents'], $lockerCost['cost_cents']);

        // No discount should be recorded
        $this->assertEquals(0, $lockerCost['breakdown']['locker_discount_cents']);
    }

    /** @test */
    public function breakdown_includes_all_expected_fields()
    {
        config(['shipping.enable_lockers' => true]);
        config(['shipping.locker_discount_eur' => 1.0]);

        $billableWeight = 2.5; // kg
        $zoneCode = 'GR_ATTICA';

        $lockerCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'LOCKER');

        // Check all breakdown fields are present
        $breakdown = $lockerCost['breakdown'];

        $this->assertArrayHasKey('base_rate', $breakdown);
        $this->assertArrayHasKey('extra_weight_kg', $breakdown);
        $this->assertArrayHasKey('extra_cost', $breakdown);
        $this->assertArrayHasKey('island_multiplier', $breakdown);
        $this->assertArrayHasKey('remote_surcharge', $breakdown);
        $this->assertArrayHasKey('billable_weight_kg', $breakdown);
        $this->assertArrayHasKey('locker_discount_cents', $breakdown);
        $this->assertArrayHasKey('base_cost_cents', $breakdown);
        $this->assertArrayHasKey('weight_adjustment_cents', $breakdown);
        $this->assertArrayHasKey('volume_adjustment_cents', $breakdown);
        $this->assertArrayHasKey('zone_multiplier', $breakdown);

        // Check locker discount is properly recorded
        $this->assertEquals(100, $breakdown['locker_discount_cents']); // 1.0 EUR = 100 cents

        // Check data types
        $this->assertIsFloat($breakdown['base_rate']);
        $this->assertIsFloat($breakdown['extra_weight_kg']);
        $this->assertIsFloat($breakdown['extra_cost']);
        $this->assertIsFloat($breakdown['island_multiplier']);
        $this->assertIsFloat($breakdown['remote_surcharge']);
        $this->assertIsFloat($breakdown['billable_weight_kg']);
        $this->assertIsInt($breakdown['locker_discount_cents']);
        $this->assertIsInt($breakdown['base_cost_cents']);
        $this->assertIsInt($breakdown['weight_adjustment_cents']);
        $this->assertIsInt($breakdown['volume_adjustment_cents']);
        $this->assertIsFloat($breakdown['zone_multiplier']);
    }

    /** @test */
    public function delivery_method_defaults_to_home()
    {
        $billableWeight = 1.0; // kg
        $zoneCode = 'GR_ATTICA';

        // Call without delivery method (should default to HOME)
        $cost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode);

        $this->assertEquals('HOME', $cost['delivery_method']);
        $this->assertEquals(0, $cost['breakdown']['locker_discount_cents']);
    }

    /** @test */
    public function handles_invalid_delivery_method()
    {
        $billableWeight = 1.0; // kg
        $zoneCode = 'GR_ATTICA';

        // Call with invalid delivery method
        $cost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode, 'INVALID');

        // Should still work but no discount applied
        $this->assertEquals('INVALID', $cost['delivery_method']);
        $this->assertEquals(0, $cost['breakdown']['locker_discount_cents']);
    }
}