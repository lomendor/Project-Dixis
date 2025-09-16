<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'payment_status',
        'payment_method',
        'payment_intent_id',
        'refund_id',
        'refunded_amount_cents',
        'refunded_at',
        'shipping_method',
        'currency',
        'subtotal',
        'shipping_cost',
        'total',
        // Legacy fields - keep for backward compatibility
        'tax_amount',
        'shipping_amount',
        'total_amount',
        'shipping_address',
        'billing_address',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
        'refunded_at' => 'datetime',
        // Legacy fields - keep for backward compatibility
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'shipping_address' => 'array',
        'billing_address' => 'array',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
