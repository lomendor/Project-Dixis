<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Pass 50: Shipping zone model for Greek market pricing
 */
class ShippingZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'postal_prefixes',
        'is_active',
    ];

    protected $casts = [
        'postal_prefixes' => 'array',
        'is_active' => 'boolean',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'zone_id');
    }

    /**
     * Find zone by postal code prefix match
     */
    public static function findByPostalCode(string $postalCode): ?self
    {
        $prefix = substr($postalCode, 0, 2);

        return static::where('is_active', true)
            ->get()
            ->first(function ($zone) use ($prefix) {
                return in_array($prefix, $zone->postal_prefixes ?? []);
            });
    }
}
