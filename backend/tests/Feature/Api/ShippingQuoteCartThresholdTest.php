<?php

namespace Tests\Feature\Api;

use App\Models\Producer;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-Producer Threshold in Quote-Cart API
 *
 * Tests that the quote-cart API response includes threshold_eur per producer.
 */
class ShippingQuoteCartThresholdTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function quote_cart_includes_threshold_eur_per_producer(): void
    {
        // Create producer with custom threshold
        $producer = Producer::factory()->create([
            'free_shipping_threshold_eur' => 25.00,
        ]);

        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 20.00, // Below €25 threshold
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/public/shipping/quote-cart', [
            'postal_code' => '10551', // GR_ATTICA zone
            'method' => 'HOME',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'producers' => [
                '*' => [
                    'producer_id',
                    'producer_name',
                    'subtotal',
                    'shipping_cost',
                    'is_free',
                    'free_reason',
                    'threshold_eur', // New field
                    'zone',
                    'weight_grams',
                ],
            ],
            'total_shipping',
            'quoted_at',
            'currency',
            'zone_name',
            'method',
        ]);

        $data = $response->json();

        // Verify threshold_eur is returned
        $this->assertEquals(25.00, $data['producers'][0]['threshold_eur']);
        $this->assertGreaterThan(0, $data['producers'][0]['shipping_cost']);
        $this->assertFalse($data['producers'][0]['is_free']);
    }

    /** @test */
    public function quote_cart_uses_system_default_for_null_threshold(): void
    {
        // Create producer with NULL threshold (uses system default €35)
        $producer = Producer::factory()->create([
            'free_shipping_threshold_eur' => null,
        ]);

        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 20.00, // Below default €35 threshold
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/public/shipping/quote-cart', [
            'postal_code' => '10551',
            'method' => 'HOME',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);

        $data = $response->json();

        // Verify system default threshold (€35) is returned
        $this->assertEquals(35.00, $data['producers'][0]['threshold_eur']);
    }

    /** @test */
    public function quote_cart_shows_free_shipping_when_above_custom_threshold(): void
    {
        // Create producer with custom €20 threshold
        $producer = Producer::factory()->create([
            'free_shipping_threshold_eur' => 20.00,
        ]);

        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 25.00, // Above €20 threshold = free shipping
            'stock' => 10,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/public/shipping/quote-cart', [
            'postal_code' => '10551',
            'method' => 'HOME',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);

        $data = $response->json();

        // Verify free shipping applied
        $this->assertEquals(20.00, $data['producers'][0]['threshold_eur']);
        $this->assertEquals(0.00, $data['producers'][0]['shipping_cost']);
        $this->assertTrue($data['producers'][0]['is_free']);
        $this->assertEquals('threshold', $data['producers'][0]['free_reason']);
    }
}
