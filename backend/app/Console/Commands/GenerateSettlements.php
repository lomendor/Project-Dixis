<?php

namespace App\Console\Commands;

use App\Models\Commission;
use App\Models\CommissionSettlement;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Pass PAYOUT-02: Monthly settlement generation for producer payouts.
 *
 * Aggregates unsettled Commission records per producer into a
 * CommissionSettlement batch. Designed to run monthly (1st of month)
 * via scheduler, or manually via artisan.
 *
 * Eligibility: Commission must be linked to a delivered order AND
 * the order must have been delivered >= $holdDays ago (default 14)
 * AND the order must NOT have any refund (refund_id is null).
 * Both full and partial refunds are excluded from auto-settlement.
 * Partially refunded orders are flagged separately for admin review.
 *
 * Owner decisions applied:
 * - Frequency: Monthly (1st of each month)
 * - Minimum payout: €20
 * - Hold period: 14 days after delivery
 */
class GenerateSettlements extends Command
{
    protected $signature = 'dixis:generate-settlements
        {--period= : Settlement period end date (YYYY-MM-DD), defaults to last day of previous month}
        {--hold-days=14 : Days after delivery before commission is eligible}
        {--min-payout=20 : Minimum payout in EUR (below this, deferred to next period)}
        {--dry-run : Preview without creating records}';

    protected $description = 'Generate monthly settlement batches for producer payouts';

    public function handle(): int
    {
        $holdDays = (int) $this->option('hold-days');
        $minPayoutEur = (float) $this->option('min-payout');
        $dryRun = (bool) $this->option('dry-run');

        // Determine settlement period
        $periodEnd = $this->option('period')
            ? \Carbon\Carbon::parse($this->option('period'))
            : now()->subMonth()->endOfMonth();
        $periodStart = $periodEnd->copy()->startOfMonth();

        // Eligibility cutoff: orders delivered at least $holdDays ago
        $eligibleBefore = now()->subDays($holdDays);

        $this->info("Settlement period: {$periodStart->toDateString()} → {$periodEnd->toDateString()}");
        $this->info("Hold period: {$holdDays} days (eligible if delivered before {$eligibleBefore->toDateString()})");
        $this->info("Min payout: €{$minPayoutEur}");
        if ($dryRun) {
            $this->warn('DRY RUN — no records will be created');
        }
        $this->newLine();

        // Find unsettled commissions with delivered orders within the hold window.
        // Exclude ALL refunded orders (refund_id is set for both full and partial refunds).
        $eligibleCommissions = Commission::unsettled()
            ->whereHas('order', function ($q) use ($eligibleBefore) {
                $q->where('status', 'delivered')
                  ->where('updated_at', '<=', $eligibleBefore)
                  ->whereNull('refund_id');
            })
            ->with('order') // eager load for partial refund check below
            ->get();

        if ($eligibleCommissions->isEmpty()) {
            $this->info('No eligible commissions found for this period.');
            return 0;
        }

        // Separately detect partially-refunded orders that were excluded above.
        // (whereNull('refund_id') excludes ALL refunds; partial refunds need admin review
        //  because the non-refunded portion may still warrant a reduced payout.)
        $excludedRefunded = Commission::unsettled()
            ->whereHas('order', function ($q) use ($eligibleBefore) {
                $q->where('status', 'delivered')
                  ->where('updated_at', '<=', $eligibleBefore)
                  ->whereNotNull('refund_id');
            })
            ->with('order')
            ->get();

        $partialRefunds = $excludedRefunded->filter(function ($c) {
            if (! $c->order) {
                return false;
            }
            $totalCents = (int) round($c->order->total * 100);
            return ($c->order->refunded_amount_cents ?? 0) < $totalCents;
        });

        if ($partialRefunds->isNotEmpty()) {
            $this->warn("{$partialRefunds->count()} partially-refunded order(s) excluded. Review for manual payout:");
            foreach ($partialRefunds as $c) {
                $refundedEur = ($c->order->refunded_amount_cents ?? 0) / 100;
                $this->warn("  Order #{$c->order_id}: refunded EUR {$refundedEur} of EUR {$c->order->total}");
            }
            $this->newLine();
        }

        // Group by producer
        $byProducer = $eligibleCommissions->groupBy('producer_id');

        $this->info("Found {$eligibleCommissions->count()} eligible commissions across {$byProducer->count()} producers");
        $this->newLine();

        $created = 0;
        $deferred = 0;

        foreach ($byProducer as $producerId => $commissions) {
            $totalSalesCents = (int) round($commissions->sum('order_gross') * 100);
            $commissionCents = (int) round($commissions->sum('platform_fee') * 100);
            $netPayoutCents = (int) round($commissions->sum('producer_payout') * 100);
            $orderCount = $commissions->count();
            $netPayoutEur = $netPayoutCents / 100;

            // Check minimum payout threshold
            if ($netPayoutEur < $minPayoutEur) {
                $this->line("  Producer #{$producerId}: €{$netPayoutEur} ({$orderCount} orders) — <comment>DEFERRED (below €{$minPayoutEur} minimum)</comment>");
                $deferred++;
                continue;
            }

            $this->line("  Producer #{$producerId}: €{$netPayoutEur} payout ({$orderCount} orders, €" . ($commissionCents / 100) . " commission)");

            if (!$dryRun) {
                DB::transaction(function () use ($producerId, $periodStart, $periodEnd, $totalSalesCents, $commissionCents, $netPayoutCents, $orderCount, $commissions) {
                    $settlement = CommissionSettlement::create([
                        'producer_id' => $producerId,
                        'period_start' => $periodStart,
                        'period_end' => $periodEnd,
                        'total_sales_cents' => $totalSalesCents,
                        'commission_cents' => $commissionCents,
                        'net_payout_cents' => $netPayoutCents,
                        'order_count' => $orderCount,
                        'status' => CommissionSettlement::STATUS_PENDING,
                    ]);

                    // Link commissions to this settlement
                    Commission::whereIn('id', $commissions->pluck('id'))
                        ->update(['settlement_id' => $settlement->id]);
                });
            }

            $created++;
        }

        $this->newLine();
        $this->info("Done! Created: {$created} settlements, Deferred: {$deferred} (below minimum)");

        if ($dryRun) {
            $this->warn('This was a dry run — run without --dry-run to create records.');
        }

        return 0;
    }
}
