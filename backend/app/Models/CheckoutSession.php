<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Pass MP-ORDERS-SCHEMA-01: CheckoutSession Model
 *
 * Parent entity for multi-producer checkout. Links N child orders
 * to a single Stripe PaymentIntent.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string|null $stripe_payment_intent_id
 * @property string $subtotal
 * @property string $shipping_total
 * @property string $total
 * @property string $status
 * @property string $currency
 * @property int $order_count
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class CheckoutSession extends Model
{
    use HasFactory;

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAYMENT_PROCESSING = 'payment_processing';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'stripe_payment_intent_id',
        'subtotal',
        'shipping_total',
        'total',
        'status',
        'currency',
        'order_count',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_total' => 'decimal:2',
        'total' => 'decimal:2',
        'order_count' => 'integer',
    ];

    /**
     * Get the user that owns the checkout session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all child orders for this checkout session.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Check if the checkout session is multi-producer.
     */
    public function isMultiProducer(): bool
    {
        return $this->order_count > 1;
    }

    /**
     * Check if payment has been confirmed.
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Mark the session and all child orders as paid.
     */
    public function markAsPaid(): void
    {
        $this->update(['status' => self::STATUS_PAID]);

        $this->orders()->update([
            'payment_status' => 'paid',
        ]);
    }

    /**
     * Mark the session and all child orders as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => self::STATUS_FAILED]);

        $this->orders()->update([
            'payment_status' => 'failed',
        ]);
    }

    /**
     * Recalculate totals from child orders.
     */
    public function recalculateTotals(): void
    {
        $orders = $this->orders()->get();

        $this->update([
            'subtotal' => $orders->sum('subtotal'),
            'shipping_total' => $orders->sum('shipping_cost'),
            'total' => $orders->sum('total'),
            'order_count' => $orders->count(),
        ]);
    }
}
