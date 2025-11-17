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
        $result = $service->calculateFee($order);

        $this->assertIsArray($result, 'calculateFee should return an array');
        $this->assertArrayHasKey('commission_cents', $result);
        $this->assertEquals(0, $result['commission_cents'], 'Should return zero commission when flag is OFF');
        $this->assertNull($result['rule_id']);
        $this->assertEquals('Feature flag OFF', $result['breakdown']);
    }

    public function test_returns_structured_response()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 10000,
        ]);

        $service = new CommissionService();
        
        // Test with flag OFF
        $result = $service->calculateFee($order);
        $this->assertArrayHasKey('commission_cents', $result);
        $this->assertArrayHasKey('rule_id', $result);
        $this->assertArrayHasKey('breakdown', $result);
        $this->assertEquals(0, $result['commission_cents']);
        $this->assertNull($result['rule_id']);

        // Test with flag ON (no rules match, should still return zero)
        Feature::activate('commission_engine_v1');
        $result = $service->calculateFee($order);
        $this->assertEquals(0, $result['commission_cents']);
        $this->assertNull($result['rule_id']);
        $this->assertEquals('No applicable rule', $result['breakdown']);
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
        $smallResult = $service->calculateFee($smallOrder);
        $this->assertEquals(0, $smallResult['commission_cents']);

        // Test with large order
        $largeOrder = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 100000, // €1000
        ]);
        $largeResult = $service->calculateFee($largeOrder);
        $this->assertEquals(0, $largeResult['commission_cents']);
    }

    public function test_resolve_rule_returns_null_when_flag_off()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'total' => 10000,
        ]);

        $service = new CommissionService();
        $rule = $service->resolveRuleFor($order);

        $this->assertNull($rule, 'resolveRuleFor should return null when flag is OFF');
    }
}
