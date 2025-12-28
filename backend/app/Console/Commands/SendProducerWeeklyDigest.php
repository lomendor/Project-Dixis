<?php

namespace App\Console\Commands;

use App\Mail\ProducerWeeklyDigest;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\ProducerDigest;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Pass 55: Weekly producer digest command.
 *
 * Usage:
 *   php artisan producers:digest-weekly          # Send digests
 *   php artisan producers:digest-weekly --dry-run # Output counts only, no emails
 */
class SendProducerWeeklyDigest extends Command
{
    protected $signature = 'producers:digest-weekly {--dry-run : Output counts without sending emails}';

    protected $description = 'Send weekly digest emails to producers with order statistics';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        // Check feature flag
        if (!config('notifications.producer_digest_enabled', false)) {
            $this->info('Pass 55: Producer digest feature is disabled (PRODUCER_DIGEST_ENABLED=false)');
            Log::debug('Pass 55: Producer digest disabled, skipping');
            return Command::SUCCESS;
        }

        // Calculate period: rolling 7 days ending yesterday
        $periodEnd = Carbon::yesterday()->toDateString();
        $periodStart = Carbon::yesterday()->subDays(6)->toDateString();

        $this->info("Pass 55: Weekly Producer Digest ({$periodStart} to {$periodEnd})");
        $this->info($dryRun ? '  Mode: DRY-RUN (no emails will be sent)' : '  Mode: LIVE');
        $this->newLine();

        // Get all producers with email
        $producers = Producer::with('user')->get();

        $sent = 0;
        $skipped = 0;
        $noEmail = 0;
        $alreadySent = 0;

        foreach ($producers as $producer) {
            $email = $producer->user?->email ?? $producer->email ?? null;

            if (!$email) {
                $noEmail++;
                if ($dryRun) {
                    $this->warn("  [{$producer->id}] {$producer->business_name}: No email, skipped");
                }
                Log::warning('Pass 55: Producer has no email, skipping digest', [
                    'producer_id' => $producer->id,
                ]);
                continue;
            }

            // Idempotency check
            if (ProducerDigest::alreadySent($producer->id, $periodStart)) {
                $alreadySent++;
                if ($dryRun) {
                    $this->comment("  [{$producer->id}] {$producer->business_name}: Already sent for this period");
                }
                Log::debug('Pass 55: Digest already sent for period, skipping', [
                    'producer_id' => $producer->id,
                    'period_start' => $periodStart,
                ]);
                continue;
            }

            // Build stats for this producer
            $stats = $this->buildProducerStats($producer->id, $periodStart, $periodEnd);
            $stats['period_start'] = $periodStart;
            $stats['period_end'] = $periodEnd;

            if ($dryRun) {
                $this->info("  [{$producer->id}] {$producer->business_name}:");
                $this->line("    Orders: {$stats['orders_count']}, Revenue: €" . number_format($stats['gross_revenue'], 2));
                $this->line("    Pending: {$stats['pending_count']}, Delivered: {$stats['delivered_count']}");
                if (!empty($stats['top_products'])) {
                    $topNames = collect($stats['top_products'])->pluck('name')->join(', ');
                    $this->line("    Top products: {$topNames}");
                }
                $sent++;
                continue;
            }

            // Send email
            try {
                Mail::to($email)->send(new ProducerWeeklyDigest($producer, $stats));

                ProducerDigest::recordSent(
                    $producer->id,
                    $periodStart,
                    $periodEnd,
                    $email,
                    $stats['orders_count'],
                    $stats['gross_revenue']
                );

                $sent++;
                $this->info("  [{$producer->id}] Sent to {$this->maskEmail($email)}");
                Log::info('Pass 55: Producer weekly digest sent', [
                    'producer_id' => $producer->id,
                    'email' => $this->maskEmail($email),
                    'orders_count' => $stats['orders_count'],
                ]);
            } catch (\Exception $e) {
                $skipped++;
                $this->error("  [{$producer->id}] Failed: {$e->getMessage()}");
                Log::error('Pass 55: Failed to send producer digest', [
                    'producer_id' => $producer->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("Summary: Sent={$sent}, Skipped={$skipped}, NoEmail={$noEmail}, AlreadySent={$alreadySent}");

        return Command::SUCCESS;
    }

    /**
     * Build statistics for a producer for the given period.
     */
    protected function buildProducerStats(int $producerId, string $periodStart, string $periodEnd): array
    {
        // Get order items for this producer in the period
        $items = OrderItem::where('producer_id', $producerId)
            ->whereHas('order', function ($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('created_at', [
                    Carbon::parse($periodStart)->startOfDay(),
                    Carbon::parse($periodEnd)->endOfDay(),
                ]);
            })
            ->with('order')
            ->get();

        // Unique orders
        $orderIds = $items->pluck('order_id')->unique();
        $ordersCount = $orderIds->count();

        // Gross revenue (sum of line totals for this producer)
        $grossRevenue = $items->sum('total_price');

        // Pending vs delivered counts
        $orders = $items->pluck('order')->unique('id');
        $pendingCount = $orders->whereIn('status', ['pending', 'confirmed', 'processing'])->count();
        $deliveredCount = $orders->where('status', 'delivered')->count();

        // Top 3 products by quantity
        $topProducts = $items->groupBy('product_id')
            ->map(function ($group) {
                return [
                    'name' => $group->first()->product_name ?? 'Unknown',
                    'quantity' => $group->sum('quantity'),
                ];
            })
            ->sortByDesc('quantity')
            ->take(3)
            ->values()
            ->toArray();

        return [
            'orders_count' => $ordersCount,
            'gross_revenue' => (float) $grossRevenue,
            'pending_count' => $pendingCount,
            'delivered_count' => $deliveredCount,
            'top_products' => $topProducts,
        ];
    }

    /**
     * Mask email for logging (privacy).
     */
    protected function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return '***';
        }
        return substr($parts[0], 0, 2) . '***@' . $parts[1];
    }
}
