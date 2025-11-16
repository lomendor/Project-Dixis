<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\CommissionService;
use App\Models\Order;
use App\Models\User;
use Laravel\Pennant\Feature;

class CommissionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure flag is OFF by default for each test
        Feature::deactivate('commission_engine_v1');
    }

    public function test_returns_zero_when_flag_is_off()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 10000, // €100
        ]);

        $service = new CommissionService();
        $fee = $service->calculateFee($order);

        $this->assertEquals(0, $fee, 'Should return zero commission when flag is OFF');
    }

    public function test_breakdown_shows_flag_status()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 10000,
        ]);

        $service = new CommissionService();
        
        // Test with flag OFF
        $breakdown = $service->getCommissionBreakdown($order);
        $this->assertArrayHasKey('flag_active', $breakdown);
        $this->assertFalse($breakdown['flag_active']);
        $this->assertEquals(0, $breakdown['total_cents']);

        // Test with flag ON (skeleton returns zero regardless)
        Feature::activate('commission_engine_v1');
        $breakdown = $service->getCommissionBreakdown($order);
        $this->assertTrue($breakdown['flag_active']);
        $this->assertEquals(0, $breakdown['total_cents']); // Still zero in skeleton phase
    }

    public function test_breakdown_includes_applied_rules()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 10000,
        ]);

        $service = new CommissionService();
        $breakdown = $service->getCommissionBreakdown($order);

        $this->assertArrayHasKey('applied_rules', $breakdown);
        $this->assertIsArray($breakdown['applied_rules']);
        $this->assertEmpty($breakdown['applied_rules']); // Empty in skeleton phase
    }

    public function test_handles_different_order_amounts()
    {
        $user = User::factory()->create();
        $service = new CommissionService();

        // Test with small order
        $smallOrder = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 1000, // €10
        ]);
        $this->assertEquals(0, $service->calculateFee($smallOrder));

        // Test with large order
        $largeOrder = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 100000, // €1000
        ]);
        $this->assertEquals(0, $service->calculateFee($largeOrder));
    }
}
