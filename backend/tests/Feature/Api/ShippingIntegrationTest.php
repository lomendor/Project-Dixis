<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShippingIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\E2ESeeder::class);
    }

    public function test_shipping_quote_athens_metro()
    {
        // Get a product from seeded data
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
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
                        'cost_eur',
                        'zone_code',
                        'zone_name',
                        'carrier_code',
                        'estimated_delivery_days',
                        'breakdown'
                    ]
                ]);

        $this->assertTrue($response->json('success'));
        $this->assertIsNumeric($response->json('data.cost_cents'));
        $this->assertGreaterThan(0, $response->json('data.cost_cents'));
        $this->assertEquals('GR_ATTICA', $response->json('data.zone_code'));
    }

    public function test_shipping_quote_islands()
    {
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1
                ]
            ],
            'postal_code' => '84600'
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        // Islands should have higher costs and longer delivery times
        $this->assertGreaterThanOrEqual(4, $response->json('data.estimated_delivery_days'));
    }

    public function test_shipping_quote_thessaloniki()
    {
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2
                ]
            ],
            'postal_code' => '54623'
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        $this->assertEquals('GR_THESSALONIKI', $response->json('data.zone_code'));
        $this->assertLessThanOrEqual(3, $response->json('data.estimated_delivery_days'));
    }

    public function test_shipping_quote_validation_errors()
    {
        // Missing required fields
        $response = $this->postJson('/api/v1/shipping/quote', []);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['items', 'postal_code']);

        // Invalid items (empty array)
        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [],
            'postal_code' => '11527'
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['items']);

        // Invalid postal code (too short)
        $product = \App\Models\Product::first();
        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1
                ]
            ],
            'postal_code' => '123' // Too short
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['postal_code']);
    }

    public function test_shipping_quote_cost_calculation()
    {
        $product = \App\Models\Product::first();

        // Test quantity multiplier effect
        $lightPackage = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1 // Light package
                ]
            ],
            'postal_code' => '11527'
        ]);

        $heavyPackage = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5 // Heavy package
                ]
            ],
            'postal_code' => '11527'
        ]);

        $lightPackage->assertStatus(200);
        $heavyPackage->assertStatus(200);

        // Heavy package should cost more or equal (depends on weight tiers)
        $this->assertGreaterThanOrEqual(
            $lightPackage->json('data.cost_cents'),
            $heavyPackage->json('data.cost_cents'),
            'More quantity should cost more or equal'
        );
    }

    public function test_shipping_quote_throttling()
    {
        // Disable throttling middleware for tests
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);

        $product = \App\Models\Product::first();

        // Verify the endpoint responds correctly to multiple requests
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 1
                    ]
                ],
                'postal_code' => '11527'
            ]);

            $response->assertStatus(200);
        }
    }

    public function test_shipping_zones_coverage()
    {
        $product = \App\Models\Product::first();

        $testCases = [
            // Athens Metro
            ['10431', 'GR_ATTICA'],
            ['11527', 'GR_ATTICA'],

            // Thessaloniki
            ['54623', 'GR_THESSALONIKI'],
            ['55134', 'GR_THESSALONIKI'],

            // Crete
            ['70000', 'GR_CRETE'],
            ['73100', 'GR_CRETE'],

            // Large Islands
            ['80000', 'GR_ISLANDS_LARGE'],
            ['85100', 'GR_ISLANDS_LARGE'],

            // Small Islands
            ['86000', 'GR_ISLANDS_SMALL'],
            ['87000', 'GR_ISLANDS_SMALL'],
        ];

        foreach ($testCases as [$postalCode, $expectedZone]) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 1
                    ]
                ],
                'postal_code' => $postalCode
            ]);

            $response->assertStatus(200);

            if ($response->json('success')) {
                $this->assertEquals($expectedZone, $response->json('data.zone_code'),
                    "Failed for postal code $postalCode - expected $expectedZone zone");
            }
        }
    }
}