<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * B2B PIVOT: Annual business subscription.
 *
 * Single tier — admin-configurable price via DixisSetting.
 * Active subscription → 0% commission on B2B orders.
 * No subscription → 7% commission on B2B orders.
 */
class Subscription extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'business_id',
        'stripe_checkout_session_id',
        'stripe_payment_intent_id',
        'status',
        'amount_cents',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'amount_cents' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->expires_at
            && $this->expires_at->isFuture();
    }

    /**
     * Scope: only active, non-expired subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('expires_at', '>', now());
    }

    /**
     * Scope: pending payment subscriptions.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}
