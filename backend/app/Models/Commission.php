<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $fillable = [
        'order_id',
        'producer_id',
        'channel',
        'order_gross',
        'platform_fee',
        'platform_fee_vat',
        'producer_payout',
        'currency',
    ];

    protected $casts = [
        'order_gross' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'platform_fee_vat' => 'decimal:2',
        'producer_payout' => 'decimal:2',
    ];

    /**
     * Get the order that owns the commission.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
