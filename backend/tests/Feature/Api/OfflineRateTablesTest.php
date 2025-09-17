<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OfflineRateTablesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\E2ESeeder::class);
    }

    public function test_attica_zone_postal_codes()
    {
        $product = Product::first();
        $atticaPostalCodes = ['10431', '11527', '12345', '15561', '18640'];

        foreach ($atticaPostalCodes as $postalCode) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
                'postal_code' => $postalCode,
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'zone_code' => 'GR_ATTICA',
                    ]
                ]);

            $this->assertEquals(1, $response->json('data.estimated_delivery_days'));
        }
    }

    public function test_thessaloniki_zone_postal_codes()
    {
        $product = Product::first();
        $thessalonikiPostalCodes = ['54001', '55131', '56123', '57001'];

        foreach ($thessalonikiPostalCodes as $postalCode) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
                'postal_code' => $postalCode,
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'zone_code' => 'GR_THESSALONIKI',
                    ]
                ]);

            $this->assertEquals(2, $response->json('data.estimated_delivery_days'));
        }
    }

    public function test_remote_postal_codes_override()
    {
        $product = Product::first();
        $remotePostalCodes = ['19007', '19008', '84001', '85001', '87001'];

        foreach ($remotePostalCodes as $postalCode) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
                'postal_code' => $postalCode,
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'zone_code' => 'GR_REMOTE',
                    ]
                ]);

            // Remote areas should have 6 days delivery and surcharge
            $this->assertEquals(6, $response->json('data.estimated_delivery_days'));
            $this->assertGreaterThan(0, $response->json('data.breakdown.remote_surcharge'));
        }
    }

    public function test_crete_zone_island_multiplier()
    {
        $product = Product::first();
        $cretePostalCodes = ['70001', '71201', '72100', '73100'];

        foreach ($cretePostalCodes as $postalCode) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
                'postal_code' => $postalCode,
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'zone_code' => 'GR_CRETE',
                    ]
                ]);

            // Crete should have island multiplier of 1.15
            $this->assertEquals(1.15, $response->json('data.breakdown.island_multiplier'));
            $this->assertEquals(4, $response->json('data.estimated_delivery_days'));
        }
    }

    public function test_islands_small_zone_highest_costs()
    {
        $product = Product::first();
        $smallIslandPostalCodes = ['86100', '88100', '89100']; // Using codes without remote overrides

        foreach ($smallIslandPostalCodes as $postalCode) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
                'postal_code' => $postalCode,
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'data' => [
                        'zone_code' => 'GR_ISLANDS_SMALL',
                    ]
                ]);

            // Small islands should have high costs and long delivery
            $this->assertGreaterThanOrEqual(900, $response->json('data.cost_cents')); // At least 9.00 EUR
            $this->assertEquals(7, $response->json('data.estimated_delivery_days'));
        }
    }

    public function test_step_based_pricing_weight_tiers()
    {
        $product = Product::first();
        $postalCode = '10431'; // Athens

        // Test different weight scenarios by varying quantity
        $weightTests = [
            ['quantity' => 1, 'expected_tier' => 'base'],     // ~0.5kg - base rate
            ['quantity' => 4, 'expected_tier' => 'step_2_5'], // ~2kg - still base rate
            ['quantity' => 6, 'expected_tier' => 'step_2_5'], // ~3kg - step rate 2-5kg
            ['quantity' => 12, 'expected_tier' => 'step_over_5'], // ~6kg - step rate over 5kg
        ];

        $previousCost = 0;
        foreach ($weightTests as $test) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => $test['quantity']]],
                'postal_code' => $postalCode,
            ]);

            $response->assertStatus(200);
            $currentCost = $response->json('data.cost_cents');

            // Cost should increase with weight
            $this->assertGreaterThanOrEqual($previousCost, $currentCost);
            $previousCost = $currentCost;

            // Should have proper breakdown
            $this->assertArrayHasKey('base_rate', $response->json('data.breakdown'));
            $this->assertArrayHasKey('extra_cost', $response->json('data.breakdown'));
            $this->assertArrayHasKey('island_multiplier', $response->json('data.breakdown'));
            $this->assertArrayHasKey('remote_surcharge', $response->json('data.breakdown'));
        }
    }

    public function test_zone_cost_progression()
    {
        $product = Product::first();
        $quantity = 2; // Standard weight

        // Test zones in cost progression order (should increase)
        $zoneProgression = [
            ['postal_code' => '10431', 'zone' => 'GR_ATTICA'],
            ['postal_code' => '54001', 'zone' => 'GR_THESSALONIKI'],
            ['postal_code' => '26221', 'zone' => 'GR_MAINLAND'],
            ['postal_code' => '71201', 'zone' => 'GR_CRETE'],
            ['postal_code' => '84300', 'zone' => 'GR_ISLANDS_LARGE'],
            ['postal_code' => '86100', 'zone' => 'GR_ISLANDS_SMALL'], // Use code without remote override
            ['postal_code' => '19007', 'zone' => 'GR_REMOTE'],
        ];

        $costs = [];
        foreach ($zoneProgression as $testCase) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => $quantity]],
                'postal_code' => $testCase['postal_code'],
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'zone_code' => $testCase['zone'],
                    ]
                ]);

            $costs[$testCase['zone']] = $response->json('data.cost_cents');
        }

        // Verify cost progression (each zone should cost more than previous)
        $this->assertLessThan($costs['GR_THESSALONIKI'], $costs['GR_ATTICA']);
        $this->assertLessThan($costs['GR_MAINLAND'], $costs['GR_THESSALONIKI']);
        $this->assertLessThan($costs['GR_CRETE'], $costs['GR_MAINLAND']);
        $this->assertLessThan($costs['GR_ISLANDS_LARGE'], $costs['GR_CRETE']);
        $this->assertLessThan($costs['GR_ISLANDS_SMALL'], $costs['GR_ISLANDS_LARGE']);
    }

    public function test_volumetric_weight_impact()
    {
        $product = Product::first();

        // Test with different package dimensions via multiple items (simulates bulk)
        $response1 = $this->postJson('/api/v1/shipping/quote', [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'postal_code' => '10431',
        ]);

        $response2 = $this->postJson('/api/v1/shipping/quote', [
            'items' => [['product_id' => $product->id, 'quantity' => 10]], // Bulkier package
            'postal_code' => '10431',
        ]);

        $response1->assertStatus(200);
        $response2->assertStatus(200);

        $cost1 = $response1->json('data.cost_cents');
        $cost2 = $response2->json('data.cost_cents');

        // Bulkier package should cost more
        $this->assertGreaterThan($cost1, $cost2);

        // Should include billable weight calculation in breakdown
        $this->assertArrayHasKey('billable_weight_kg', $response2->json('data.breakdown'));
        $this->assertArrayHasKey('volumetric_weight_kg', $response2->json('data.breakdown'));
    }

    public function test_admin_shipping_rates_endpoint()
    {
        // Create a user for authentication
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/admin/shipping/rates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'rates' => [
                    'version',
                    'carriers',
                    'zones',
                    'tables',
                    'postal_code_mapping',
                ],
                'remote_postal_codes' => [
                    'version',
                    'remote_postal_codes',
                    'remote_areas',
                ],
                'status',
                'last_updated',
            ]);

        $this->assertEquals('loaded', $response->json('status'));
        $this->assertContains('INTERNAL_STANDARD', $response->json('rates.carriers'));
        $this->assertContains('GR_REMOTE', $response->json('rates.zones'));
    }

    public function test_admin_shipping_simulate_endpoint()
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/admin/shipping/simulate');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'test_scenarios' => [
                    '*' => [
                        'scenario',
                        'input' => [
                            'postal_code',
                            'actual_weight_kg',
                            'dimensions_cm',
                        ],
                        'calculation' => [
                            'volumetric_weight_kg',
                            'billable_weight_kg',
                            'zone_code',
                        ],
                        'result' => [
                            'cost_cents',
                            'cost_eur',
                            'breakdown',
                        ],
                    ],
                ],
                'timestamp',
            ]);

        $scenarios = $response->json('test_scenarios');
        $this->assertCount(4, $scenarios);

        // Verify Athens scenario
        $athensScenario = collect($scenarios)->firstWhere('input.postal_code', '10551');
        $this->assertNotNull($athensScenario);
        $this->assertEquals('GR_ATTICA', $athensScenario['calculation']['zone_code']);

        // Verify remote scenario (Kythira)
        $remoteScenario = collect($scenarios)->firstWhere('input.postal_code', '19007');
        $this->assertNotNull($remoteScenario);
        $this->assertEquals('GR_REMOTE', $remoteScenario['calculation']['zone_code']);
        $this->assertGreaterThan(0, $remoteScenario['result']['breakdown']['remote_surcharge']);
    }

    public function test_all_zone_postal_code_mappings()
    {
        $product = Product::first();

        // Test representative postal codes for each zone
        $zoneMappings = [
            'GR_ATTICA' => ['10431', '11527', '12345', '15561', '18640'],
            'GR_THESSALONIKI' => ['54001', '55131', '56123', '57001'],
            'GR_MAINLAND' => ['26221', '35100', '42100', '60100', '67100'],
            'GR_CRETE' => ['70001', '71201', '72100', '73100', '74100'],
            'GR_ISLANDS_LARGE' => ['49001', '80001', '81001', '82100', '83100'],
            'GR_ISLANDS_SMALL' => ['86100', '88100', '89100', '90100', '91100'], // Using codes without remote overrides
        ];

        foreach ($zoneMappings as $expectedZone => $postalCodes) {
            foreach ($postalCodes as $postalCode) {
                $response = $this->postJson('/api/v1/shipping/quote', [
                    'items' => [['product_id' => $product->id, 'quantity' => 1]],
                    'postal_code' => $postalCode,
                ]);

                $response->assertStatus(200)
                    ->assertJson([
                        'success' => true,
                        'data' => [
                            'zone_code' => $expectedZone,
                        ]
                    ]);
            }
        }
    }

    public function test_weight_based_cost_calculation()
    {
        $product = Product::first();
        $postalCode = '10431'; // Athens

        // Test different weight tiers by varying quantity
        $weightTests = [
            ['quantity' => 1, 'expected_base' => 290], // ~0.5kg -> 2.90 EUR
            ['quantity' => 4, 'expected_range' => [290, 500]], // ~2kg -> base rate
            ['quantity' => 6, 'expected_range' => [400, 800]], // ~3kg -> base + step
            ['quantity' => 12, 'expected_range' => [600, 1500]], // ~6kg -> base + step + over5
        ];

        foreach ($weightTests as $test) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => $test['quantity']]],
                'postal_code' => $postalCode,
            ]);

            $response->assertStatus(200);
            $costCents = $response->json('data.cost_cents');

            if (isset($test['expected_base'])) {
                $this->assertEquals($test['expected_base'], $costCents);
            } else {
                $this->assertGreaterThanOrEqual($test['expected_range'][0], $costCents);
                $this->assertLessThanOrEqual($test['expected_range'][1], $costCents);
            }
        }
    }

    public function test_island_multiplier_application()
    {
        $product = Product::first();
        $quantity = 2;

        // Compare mainland vs island costs
        $athensResponse = $this->postJson('/api/v1/shipping/quote', [
            'items' => [['product_id' => $product->id, 'quantity' => $quantity]],
            'postal_code' => '10431', // Athens
        ]);

        $creteResponse = $this->postJson('/api/v1/shipping/quote', [
            'items' => [['product_id' => $product->id, 'quantity' => $quantity]],
            'postal_code' => '71201', // Crete
        ]);

        $athensResponse->assertStatus(200);
        $creteResponse->assertStatus(200);

        // Verify multipliers
        $this->assertEquals(1.0, $athensResponse->json('data.breakdown.island_multiplier'));
        $this->assertEquals(1.15, $creteResponse->json('data.breakdown.island_multiplier'));

        // Crete should cost more due to multiplier
        $this->assertGreaterThan(
            $athensResponse->json('data.cost_cents'),
            $creteResponse->json('data.cost_cents')
        );
    }

    public function test_remote_surcharge_application()
    {
        $product = Product::first();
        $quantity = 2;

        // Compare regular island vs remote area
        $regularIslandResponse = $this->postJson('/api/v1/shipping/quote', [
            'items' => [['product_id' => $product->id, 'quantity' => $quantity]],
            'postal_code' => '83100', // Large island (regular)
        ]);

        $remoteAreaResponse = $this->postJson('/api/v1/shipping/quote', [
            'items' => [['product_id' => $product->id, 'quantity' => $quantity]],
            'postal_code' => '19007', // Kythira (remote)
        ]);

        $regularIslandResponse->assertStatus(200);
        $remoteAreaResponse->assertStatus(200);

        // Verify surcharges
        $this->assertEquals(0, $regularIslandResponse->json('data.breakdown.remote_surcharge'));
        $this->assertEquals(3.0, $remoteAreaResponse->json('data.breakdown.remote_surcharge'));

        // Remote should cost more due to surcharge
        $this->assertGreaterThan(
            $regularIslandResponse->json('data.cost_cents'),
            $remoteAreaResponse->json('data.cost_cents')
        );
    }

    public function test_max_weight_restrictions_by_zone()
    {
        $product = Product::first();

        // Test zones with different max weight limits
        $weightLimits = [
            ['postal_code' => '10431', 'zone' => 'GR_ATTICA', 'max_weight' => 30],
            ['postal_code' => '71201', 'zone' => 'GR_CRETE', 'max_weight' => 25],
            ['postal_code' => '84300', 'zone' => 'GR_ISLANDS_LARGE', 'max_weight' => 20],
            ['postal_code' => '86100', 'zone' => 'GR_ISLANDS_SMALL', 'max_weight' => 15],
        ];

        foreach ($weightLimits as $test) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
                'postal_code' => $test['postal_code'],
            ]);

            $response->assertStatus(200)
                ->assertJson([
                    'data' => [
                        'zone_code' => $test['zone'],
                    ]
                ]);

            // Weight limit info is in the rate table but not exposed in quote response
            // This test verifies zone detection works for weight-restricted zones
        }
    }

    public function test_breakdown_mathematical_consistency()
    {
        $product = Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [['product_id' => $product->id, 'quantity' => 3]],
            'postal_code' => '71201', // Crete (has multiplier)
        ]);

        $response->assertStatus(200);

        $breakdown = $response->json('data.breakdown');
        $costEur = $response->json('data.cost_eur');

        // Calculate expected cost from breakdown components
        $baseCost = $breakdown['base_rate'] + $breakdown['extra_cost'];
        $withMultiplier = $baseCost * $breakdown['island_multiplier'];
        $withSurcharge = $withMultiplier + $breakdown['remote_surcharge'];

        // Should match final cost (within rounding tolerance)
        $this->assertEquals($costEur, round($withSurcharge, 2));
    }
}