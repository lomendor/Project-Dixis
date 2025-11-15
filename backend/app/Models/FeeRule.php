<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeRule extends Model
{
    protected $fillable = [
        'producer_id',
        'category_id',
        'channel',
        'rate',
        'fee_vat_rate',
        'priority',
        'effective_from',
        'effective_to',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'rate' => 'float',
        'fee_vat_rate' => 'float',
    ];
}
