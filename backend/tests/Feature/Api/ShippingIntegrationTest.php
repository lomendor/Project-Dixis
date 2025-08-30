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
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 2.5,
            'volume' => 0.01
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'carrier',
                    'cost',
                    'etaDays',
                    'zone',
                    'details' => [
                        'zip',
                        'city',
                        'weight',
                        'volume'
                    ]
                ])
                ->assertJson([
                    'carrier' => 'Athens Express',
                    'etaDays' => 1,
                    'zone' => 'athens_metro'
                ]);

        $this->assertIsNumeric($response->json('cost'));
        $this->assertGreaterThan(0, $response->json('cost'));
    }

    public function test_shipping_quote_islands()
    {
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '84600',
            'city' => 'Mykonos',
            'weight' => 1.5,
            'volume' => 0.005
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'carrier' => 'Island Logistics',
                    'etaDays' => 4,
                    'zone' => 'islands'
                ]);
    }

    public function test_shipping_quote_thessaloniki()
    {
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '54623',
            'city' => 'Thessaloniki',
            'weight' => 2.0,
            'volume' => 0.008
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'carrier' => 'Northern Courier',
                    'etaDays' => 2,
                    'zone' => 'thessaloniki'
                ]);
    }

    public function test_shipping_quote_validation_errors()
    {
        // Missing required fields
        $response = $this->postJson('/api/v1/shipping/quote', []);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['zip', 'city', 'weight', 'volume']);

        // Invalid weight (too low)
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 0.05, // Below minimum 0.1
            'volume' => 0.01
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['weight']);

        // Invalid postal code (too short)
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '123', // Too short
            'city' => 'Athens',
            'weight' => 2.0,
            'volume' => 0.01
        ]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['zip']);
    }

    public function test_shipping_quote_cost_calculation()
    {
        // Test weight multiplier effect
        $lightPackage = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 1.0, // Light package
            'volume' => 0.001
        ]);

        $heavyPackage = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 5.0, // Heavy package
            'volume' => 0.001
        ]);

        $lightPackage->assertStatus(200);
        $heavyPackage->assertStatus(200);

        // Heavy package should cost more
        $this->assertGreaterThan(
            $lightPackage->json('cost'),
            $heavyPackage->json('cost'),
            'Heavy packages should cost more than light packages'
        );
    }

    public function test_shipping_quote_throttling()
    {
        // The shipping quote endpoint has throttling: 60 requests per minute
        // We can't easily test the throttling without making 60+ requests,
        // but we can verify the endpoint responds correctly to multiple requests

        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'zip' => '11527',
                'city' => 'Athens',
                'weight' => 2.0,
                'volume' => 0.01
            ]);

            $response->assertStatus(200);
        }
    }

    public function test_shipping_zones_coverage()
    {
        $testCases = [
            // Athens Metro
            ['11234', 'Athens', 'athens_metro', 'Athens Express'],
            ['12567', 'Chalandri', 'athens_metro', 'Athens Express'],
            
            // Thessaloniki
            ['54623', 'Thessaloniki', 'thessaloniki', 'Northern Courier'],
            ['55134', 'Kalamaria', 'thessaloniki', 'Northern Courier'],
            ['56425', 'Pylaia', 'thessaloniki', 'Northern Courier'],
            
            // Islands
            ['84600', 'Mykonos', 'islands', 'Island Logistics'],
            ['85100', 'Rhodes', 'islands', 'Island Logistics'],
            ['80200', 'Crete', 'islands', 'Island Logistics'],
            
            // Major cities (20XXX-28XXX, 30XXX-38XXX)
            ['26500', 'Patras', 'major_cities', 'Greek Post'],
            ['38221', 'Volos', 'major_cities', 'Greek Post'],
            
            // Remote areas (anything else)
            ['45678', 'Remote Town', 'remote', 'Rural Delivery'],
            ['67890', 'Far Village', 'remote', 'Rural Delivery'],
        ];

        foreach ($testCases as [$zip, $city, $expectedZone, $expectedCarrier]) {
            $response = $this->postJson('/api/v1/shipping/quote', [
                'zip' => $zip,
                'city' => $city,
                'weight' => 2.0,
                'volume' => 0.01
            ]);

            $response->assertStatus(200)
                    ->assertJson([
                        'zone' => $expectedZone,
                        'carrier' => $expectedCarrier
                    ], "Failed for $city ($zip) - expected $expectedZone zone");
        }
    }
}