<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pass MP-ORDERS-SHIPPING-V1: Per-producer shipping breakdown
 *
 * Stores shipping cost calculated per producer for multi-producer orders.
 * Each order can have multiple shipping lines (one per producer).
 *
 * @property int $id
 * @property int $order_id
 * @property int $producer_id
 * @property string $producer_name
 * @property float $subtotal
 * @property float $shipping_cost
 * @property string|null $shipping_method
 * @property bool $free_shipping_applied
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class OrderShippingLine extends Model
{
    protected $fillable = [
        'order_id',
        'producer_id',
        'producer_name',
        'subtotal',
        'shipping_cost',
        'shipping_method',
        'free_shipping_applied',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'free_shipping_applied' => 'boolean',
    ];

    /**
     * Get the order this shipping line belongs to.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the producer for this shipping line.
     */
    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }
}
