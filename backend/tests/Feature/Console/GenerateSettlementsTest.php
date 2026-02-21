<?php

namespace Tests\Feature\Console;

use App\Models\Commission;
use App\Models\CommissionSettlement;
use App\Models\Order;
use App\Models\Producer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for dixis:generate-settlements Artisan command.
 *
 * Verifies that settlement generation correctly:
 * - Includes delivered, non-refunded orders
 * - Excludes fully-refunded orders
 * - Excludes partially-refunded orders (with warning)
 */
#[\PHPUnit\Framework\Attributes\CoversClass(\App\Console\Commands\GenerateSettlements::class)]
class GenerateSettlementsTest extends TestCase
{
    use RefreshDatabase;

    private Producer $producer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->producer = Producer::factory()->create();
    }

    /**
     * Helper: create a delivered order with commission, delivered N days ago.
     */
    private function createDeliveredOrderWithCommission(
        array $orderOverrides = [],
        array $commissionOverrides = [],
        int $deliveredDaysAgo = 30,
    ): Commission {
        $order = Order::factory()->create(array_merge([
            'status' => 'delivered',
            'payment_status' => 'paid',
            'total' => 100.00,
            'updated_at' => now()->subDays($deliveredDaysAgo),
        ], $orderOverrides));

        return Commission::factory()->create(array_merge([
            'order_id' => $order->id,
            'producer_id' => $this->producer->id,
            'order_gross' => 100.00,
            'platform_fee' => 12.00,
            'platform_fee_vat' => 2.88,
            'producer_payout' => 88.00,
        ], $commissionOverrides));
    }

    public function test_normal_delivered_order_included_in_settlement(): void
    {
        $commission = $this->createDeliveredOrderWithCommission();

        $this->artisan('dixis:generate-settlements', ['--hold-days' => 14])
            ->assertSuccessful();

        $this->assertDatabaseCount('commission_settlements', 1);

        $settlement = CommissionSettlement::first();
        $this->assertEquals($this->producer->id, $settlement->producer_id);
        $this->assertEquals(10000, $settlement->total_sales_cents);
        $this->assertEquals(1200, $settlement->commission_cents);
        $this->assertEquals(8800, $settlement->net_payout_cents);
        $this->assertEquals(1, $settlement->order_count);

        // Commission should be linked to settlement
        $commission->refresh();
        $this->assertEquals($settlement->id, $commission->settlement_id);
    }

    public function test_fully_refunded_order_excluded_from_settlement(): void
    {
        $this->createDeliveredOrderWithCommission([
            'refund_id' => 're_full_123',
            'refunded_amount_cents' => 10000, // full refund of €100
            'refunded_at' => now()->subDays(5),
        ]);

        $this->artisan('dixis:generate-settlements', ['--hold-days' => 14])
            ->assertSuccessful()
            ->expectsOutputToContain('No eligible commissions found');

        $this->assertDatabaseCount('commission_settlements', 0);
    }

    public function test_partially_refunded_order_excluded_with_warning(): void
    {
        $this->createDeliveredOrderWithCommission([
            'refund_id' => 're_partial_456',
            'refunded_amount_cents' => 3000, // partial: €30 of €100
            'refunded_at' => now()->subDays(5),
        ]);

        $this->artisan('dixis:generate-settlements', ['--hold-days' => 14])
            ->assertSuccessful()
            ->expectsOutputToContain('No eligible commissions found');

        // No settlement created (partial refunds are excluded for safety)
        $this->assertDatabaseCount('commission_settlements', 0);
    }

    public function test_mixed_orders_only_clean_ones_settled(): void
    {
        // Order A: normal — should be included
        $cleanCommission = $this->createDeliveredOrderWithCommission();

        // Order B: fully refunded — excluded
        $this->createDeliveredOrderWithCommission([
            'refund_id' => 're_full_789',
            'refunded_amount_cents' => 10000,
            'refunded_at' => now()->subDays(5),
        ]);

        // Order C: partially refunded — excluded
        $this->createDeliveredOrderWithCommission([
            'refund_id' => 're_partial_012',
            'refunded_amount_cents' => 2500,
            'refunded_at' => now()->subDays(3),
        ]);

        $this->artisan('dixis:generate-settlements', ['--hold-days' => 14])
            ->assertSuccessful()
            ->expectsOutputToContain('partially-refunded order(s) excluded');

        // Only 1 settlement created (for the clean order)
        $this->assertDatabaseCount('commission_settlements', 1);

        $settlement = CommissionSettlement::first();
        $this->assertEquals(1, $settlement->order_count);
        $this->assertEquals(8800, $settlement->net_payout_cents);

        // Only the clean commission is linked
        $cleanCommission->refresh();
        $this->assertEquals($settlement->id, $cleanCommission->settlement_id);
    }
}
