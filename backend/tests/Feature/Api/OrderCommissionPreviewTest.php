<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Pennant\Feature;
use App\Models\Order;
use App\Models\CommissionRule;

class OrderCommissionPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_404_when_flag_off(): void
    {
        Feature::define('commission_engine_v1', fn() => false);

        $order = Order::factory()->create([
            'total_cents' => 10000,
            'channel' => 'B2C',
        ]);

        $this->getJson("/api/orders/{$order->id}/commission-preview")
            ->assertStatus(404);
    }

    public function test_returns_preview_when_flag_on(): void
    {
        Feature::define('commission_engine_v1', fn() => true);

        // Default active rule 12% για B2C
        CommissionRule::create([
            'scope_channel' => 'B2C',
            'percent' => 12,
            'tier_min_amount_cents' => 0,
            'vat_mode' => 'EXCLUDE',
            'rounding_mode' => 'NEAREST',
            'effective_from' => now()->subMinute(),
            'active' => true,
        ]);

        $order = Order::factory()->create([
            'total_cents' => 10000,
            'channel' => 'B2C',
        ]);

        $res = $this->getJson("/api/orders/{$order->id}/commission-preview")
            ->assertOk()
            ->assertJsonStructure([
                'order_id',
                'commission_preview' => [
                    'commission_cents',
                    'rule_id',
                    'breakdown' => [
                        'percent',
                        'fixed_fee',
                        'vat_mode',
                        'rounding',
                    ],
                ],
            ])
            ->json();

        $this->assertEquals($order->id, $res['order_id']);
        $this->assertEquals(1200, $res['commission_preview']['commission_cents']); // 12% of 10000
    }
}
