<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Pass PAYOUT-02: Settlement model for producer payout batches.
 *
 * Each record represents one settlement period for one producer.
 * Aggregates all eligible Commission records within (period_start, period_end].
 */
class CommissionSettlement extends Model
{
    protected $fillable = [
        'producer_id',
        'period_start',
        'period_end',
        'total_sales_cents',
        'commission_cents',
        'net_payout_cents',
        'order_count',
        'status',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'total_sales_cents' => 'integer',
        'commission_cents' => 'integer',
        'net_payout_cents' => 'integer',
        'order_count' => 'integer',
        'paid_at' => 'datetime',
    ];

    /* --- Constants --- */

    const STATUS_PENDING = 'PENDING';
    const STATUS_PAID = 'PAID';
    const STATUS_CANCELLED = 'CANCELLED';

    /* --- Relationships --- */

    public function producer()
    {
        return $this->belongsTo(Producer::class);
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class, 'settlement_id');
    }

    /* --- Scopes --- */

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    /* --- Accessors (EUR from cents) --- */

    public function getTotalSalesAttribute(): float
    {
        return $this->total_sales_cents / 100;
    }

    public function getCommissionAmountAttribute(): float
    {
        return $this->commission_cents / 100;
    }

    public function getNetPayoutAttribute(): float
    {
        return $this->net_payout_cents / 100;
    }

    /* --- Helpers --- */

    public function markAsPaid(?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_at' => now(),
            'notes' => $notes,
        ]);
    }

    public function markAsCancelled(?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $notes,
        ]);
    }
}
