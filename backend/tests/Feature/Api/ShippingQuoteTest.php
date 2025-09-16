<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingQuoteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\E2ESeeder::class);
    }

    public function test_shipping_quote_for_athens_metro()
    {
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
            'postal_code' => '11527',
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
                    'breakdown',
                ],
            ]);

        $this->assertTrue($response->json('success'));
        $this->assertIsNumeric($response->json('data.cost_cents'));
        $this->assertGreaterThan(0, $response->json('data.cost_cents'));
        $this->assertEquals('GR_ATTICA', $response->json('data.zone_code'));
    }

    public function test_shipping_quote_for_thessaloniki()
    {
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'postal_code' => '54623',
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        $this->assertEquals('GR_THESSALONIKI', $response->json('data.zone_code'));
        $this->assertLessThanOrEqual(3, $response->json('data.estimated_delivery_days'));
    }

    public function test_shipping_quote_for_islands()
    {
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'postal_code' => '84600',
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        // Islands should have higher costs and longer delivery times
        $this->assertGreaterThanOrEqual(4, $response->json('data.estimated_delivery_days'));
    }

    public function test_shipping_quote_with_heavy_package()
    {
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5, // Higher quantity simulates heavy package
                ],
            ],
            'postal_code' => '11527',
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        $this->assertEquals('GR_ATTICA', $response->json('data.zone_code'));
        $this->assertGreaterThan(0, $response->json('data.cost_cents'));
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
            'postal_code' => '11527',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items']);

        // Invalid postal code (too short)
        $product = \App\Models\Product::first();
        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'postal_code' => '123', // Too short
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['postal_code']);
    }

    public function test_shipping_quote_unknown_postal_code()
    {
        $product = \App\Models\Product::first();

        $response = $this->postJson('/api/v1/shipping/quote', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'postal_code' => '99999', // Unknown postal code
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        // Should handle unknown postal codes gracefully
        $this->assertIsString($response->json('data.zone_code'));
        $this->assertGreaterThan(0, $response->json('data.cost_cents'));
    }
}
