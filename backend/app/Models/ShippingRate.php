<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pass 50: Shipping rate model for zone/method/weight pricing
 */
class ShippingRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'method',
        'weight_min_kg',
        'weight_max_kg',
        'price_eur',
        'is_active',
    ];

    protected $casts = [
        'weight_min_kg' => 'decimal:2',
        'weight_max_kg' => 'decimal:2',
        'price_eur' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class, 'zone_id');
    }

    /**
     * Find rate for zone, method, and weight
     */
    public static function findRate(int $zoneId, string $method, float $weightKg): ?self
    {
        return static::where('zone_id', $zoneId)
            ->where('method', $method)
            ->where('is_active', true)
            ->where('weight_min_kg', '<=', $weightKg)
            ->where('weight_max_kg', '>=', $weightKg)
            ->first();
    }
}
