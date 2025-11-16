<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'rate_percent', 'is_default', 'valid_from', 'valid_to'
    ];

    protected $casts = [
        'rate_percent' => 'decimal:2',
        'is_default' => 'boolean',
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];
}
