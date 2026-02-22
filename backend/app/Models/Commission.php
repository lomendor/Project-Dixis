<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_id',
        'producer_id',
        'channel',
        'order_gross',
        'platform_fee',
        'platform_fee_vat',
        'producer_payout',
        'currency',
        'settlement_id', // Pass PAYOUT-02: link to settlement batch
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

    /**
     * Pass PAYOUT-02: Get the settlement this commission belongs to.
     */
    public function settlement()
    {
        return $this->belongsTo(CommissionSettlement::class, 'settlement_id');
    }

    /**
     * Scope: unsettled commissions (not yet assigned to a settlement).
     */
    public function scopeUnsettled($query)
    {
        return $query->whereNull('settlement_id');
    }
}
