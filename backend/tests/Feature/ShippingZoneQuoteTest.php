<?php

namespace Tests\Feature;

use App\Models\ShippingZone;
use App\Models\ShippingRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass 50: Tests for zone-based shipping quote API
 */
class ShippingZoneQuoteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed test zones
        $athens = ShippingZone::create([
            'name' => 'Αττική',
            'postal_prefixes' => ['10', '11', '12'],
            'is_active' => true,
        ]);

        $islands = ShippingZone::create([
            'name' => 'Νησιά',
            'postal_prefixes' => ['84', '85'],
            'is_active' => true,
        ]);

        // Seed rates
        ShippingRate::create([
            'zone_id' => $athens->id,
            'method' => 'HOME',
            'weight_min_kg' => 0,
            'weight_max_kg' => 30,
            'price_eur' => 3.50,
            'is_active' => true,
        ]);

        ShippingRate::create([
            'zone_id' => $athens->id,
            'method' => 'COURIER',
            'weight_min_kg' => 0,
            'weight_max_kg' => 30,
            'price_eur' => 4.50,
            'is_active' => true,
        ]);

        ShippingRate::create([
            'zone_id' => $islands->id,
            'method' => 'HOME',
            'weight_min_kg' => 0,
            'weight_max_kg' => 30,
            'price_eur' => 7.00,
            'is_active' => true,
        ]);

        ShippingRate::create([
            'zone_id' => $islands->id,
            'method' => 'COURIER',
            'weight_min_kg' => 0,
            'weight_max_kg' => 30,
            'price_eur' => 8.50,
            'is_active' => true,
        ]);
    }

    public function test_quote_returns_athens_price_for_athens_postal(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '10564',
            'method' => 'HOME',
        ]);

        $response->assertOk();
        $response->assertJson([
            'price_eur' => 3.50,
            'zone_name' => 'Αττική',
            'method' => 'HOME',
            'source' => 'zone',
            'free_shipping' => false,
        ]);
    }

    public function test_quote_returns_islands_price_for_cyclades_postal(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '84600', // Mykonos
            'method' => 'HOME',
        ]);

        $response->assertOk();
        $response->assertJson([
            'price_eur' => 7.00,
            'zone_name' => 'Νησιά',
            'method' => 'HOME',
            'source' => 'zone',
        ]);
    }

    public function test_quote_returns_courier_price_when_courier_selected(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '10564',
            'method' => 'COURIER',
        ]);

        $response->assertOk();
        $response->assertJson([
            'price_eur' => 4.50,
            'method' => 'COURIER',
            'source' => 'zone',
        ]);
    }

    public function test_pickup_is_always_free(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '10564',
            'method' => 'PICKUP',
        ]);

        $response->assertOk();
        $response->assertJson([
            'price_eur' => 0.00,
            'free_shipping' => true,
            'source' => 'pickup',
        ]);
    }

    public function test_free_shipping_for_orders_over_threshold(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '10564',
            'method' => 'HOME',
            'subtotal' => 40.00, // Over €35 threshold
        ]);

        $response->assertOk();
        $response->assertJson([
            'price_eur' => 0.00,
            'free_shipping' => true,
            'source' => 'threshold',
        ]);
    }

    public function test_fallback_price_for_unknown_zone(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '99999', // No zone matches this
            'method' => 'HOME',
        ]);

        $response->assertOk();
        $response->assertJson([
            'price_eur' => 3.50, // Fallback price
            'zone_name' => null,
            'source' => 'fallback',
        ]);
    }

    public function test_validation_rejects_invalid_postal(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '123', // Too short
            'method' => 'HOME',
        ]);

        $response->assertStatus(422);
    }

    public function test_validation_rejects_invalid_method(): void
    {
        $response = $this->postJson('/api/v1/public/shipping/quote', [
            'postal_code' => '10564',
            'method' => 'INVALID',
        ]);

        $response->assertStatus(422);
    }
}
