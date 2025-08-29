<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingQuoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_shipping_quote_for_athens_metro()
    {
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 2.0,
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
            ]);

        $data = $response->json();
        
        // Athens metro should have specific characteristics
        $this->assertEquals('athens_metro', $data['zone']);
        $this->assertEquals('Athens Express', $data['carrier']);
        $this->assertEquals(1, $data['etaDays']);
        $this->assertEquals(3.5, $data['cost']); // Base cost for 2kg in Athens metro
        $this->assertEquals('11527', $data['details']['zip']);
    }

    public function test_shipping_quote_for_thessaloniki()
    {
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '54622',
            'city' => 'Thessaloniki',
            'weight' => 1.5,
            'volume' => 0.005
        ]);

        $response->assertStatus(200);

        $data = $response->json();
        
        // Thessaloniki should have different characteristics
        $this->assertEquals('thessaloniki', $data['zone']);
        $this->assertEquals('Northern Courier', $data['carrier']);
        $this->assertEquals(2, $data['etaDays']);
        $this->assertEquals(4.0, $data['cost']); // Base cost for light package in Thessaloniki
    }

    public function test_shipping_quote_for_islands()
    {
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '84100',
            'city' => 'Hermoupolis',
            'weight' => 5.0,
            'volume' => 0.02
        ]);

        $response->assertStatus(200);

        $data = $response->json();
        
        // Islands should be more expensive and slower
        $this->assertEquals('islands', $data['zone']);
        $this->assertEquals('Island Logistics', $data['carrier']);
        $this->assertEquals(4, $data['etaDays']);
        // 8.0 base * 1.2 weight multiplier * 1.1 volume multiplier = 10.56
        $this->assertEquals(10.56, $data['cost']);
    }

    public function test_shipping_quote_with_heavy_package()
    {
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 12.0, // Heavy package
            'volume' => 0.08   // Large volume
        ]);

        $response->assertStatus(200);

        $data = $response->json();
        
        // Heavy package should cost more
        // 3.5 base * 2.0 weight multiplier * 1.3 volume multiplier = 9.1
        $this->assertEquals(9.1, $data['cost']);
    }

    public function test_shipping_quote_validation_errors()
    {
        // Missing required fields
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527'
            // Missing city, weight, volume
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['city', 'weight', 'volume']);

        // Invalid data types
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 'not-a-number',
            'volume' => 'also-not-a-number'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['weight', 'volume']);

        // Out of range values
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '11527',
            'city' => 'Athens',
            'weight' => 150.0, // Too heavy
            'volume' => 0.0     // Too small
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['weight', 'volume']);
    }

    public function test_shipping_quote_unknown_postal_code()
    {
        $response = $this->postJson('/api/v1/shipping/quote', [
            'zip' => '99999', // Unknown postal code
            'city' => 'Unknown City',
            'weight' => 2.0,
            'volume' => 0.01
        ]);

        $response->assertStatus(200);

        $data = $response->json();
        
        // Should default to 'remote' zone
        $this->assertEquals('remote', $data['zone']);
        $this->assertEquals('Rural Delivery', $data['carrier']);
        $this->assertEquals(3, $data['etaDays']);
        $this->assertEquals(7.0, $data['cost']); // Base remote cost
    }
}