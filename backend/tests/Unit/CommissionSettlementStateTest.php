<?php

namespace Tests\Unit;

use App\Models\CommissionSettlement;
use App\Models\Producer;
use Tests\TestCase;

/**
 * Model-level state guards on settlement transitions (money-touching code).
 * The admin controller also checks status (422), but the model must refuse
 * invalid transitions regardless of caller.
 */
class CommissionSettlementStateTest extends TestCase
{
    private function makeSettlement(string $status): CommissionSettlement
    {
        return CommissionSettlement::create([
            'producer_id' => Producer::factory()->create()->id,
            'period_start' => '2026-05-01',
            'period_end' => '2026-05-31',
            'total_sales_cents' => 10000,
            'commission_cents' => 1200,
            'net_payout_cents' => 8800,
            'order_count' => 3,
            'status' => $status,
        ]);
    }

    public function test_pending_settlement_can_be_marked_paid(): void
    {
        $settlement = $this->makeSettlement(CommissionSettlement::STATUS_PENDING);

        $settlement->markAsPaid('bank transfer ref 123');

        $settlement->refresh();
        $this->assertSame(CommissionSettlement::STATUS_PAID, $settlement->status);
        $this->assertNotNull($settlement->paid_at);
    }

    public function test_paid_settlement_cannot_be_paid_again(): void
    {
        $settlement = $this->makeSettlement(CommissionSettlement::STATUS_PAID);

        $this->expectException(\DomainException::class);
        $settlement->markAsPaid();
    }

    public function test_cancelled_settlement_cannot_be_paid(): void
    {
        $settlement = $this->makeSettlement(CommissionSettlement::STATUS_CANCELLED);

        $this->expectException(\DomainException::class);
        $settlement->markAsPaid();
    }

    public function test_paid_settlement_cannot_be_cancelled(): void
    {
        $settlement = $this->makeSettlement(CommissionSettlement::STATUS_PAID);

        $this->expectException(\DomainException::class);
        $settlement->markAsCancelled('too late');
    }
}
