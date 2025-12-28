<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pass 55: Idempotency tracking for producer weekly digests.
 * Prevents double-sends for the same period.
 */
class ProducerDigest extends Model
{
    protected $fillable = [
        'producer_id',
        'period_start',
        'period_end',
        'recipient_email',
        'orders_count',
        'gross_revenue',
        'sent_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'sent_at' => 'datetime',
        'gross_revenue' => 'decimal:2',
    ];

    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }

    /**
     * Check if digest already sent for this producer and period.
     */
    public static function alreadySent(int $producerId, string $periodStart): bool
    {
        return self::where('producer_id', $producerId)
            ->where('period_start', $periodStart)
            ->exists();
    }

    /**
     * Record that a digest was sent.
     */
    public static function recordSent(
        int $producerId,
        string $periodStart,
        string $periodEnd,
        string $email,
        int $ordersCount,
        float $grossRevenue
    ): self {
        return self::create([
            'producer_id' => $producerId,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'recipient_email' => $email,
            'orders_count' => $ordersCount,
            'gross_revenue' => $grossRevenue,
            'sent_at' => now(),
        ]);
    }
}
