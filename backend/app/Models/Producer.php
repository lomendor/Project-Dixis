<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Producer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'business_name', 
        'tax_id',
        'tax_office',
        'description',
        'location',
        'address',
        'city',
        'postal_code',
        'region',
        'phone',
        'email',
        'website',
        'latitude',
        'longitude',
        'social_media',
        'verified',
        'uses_custom_shipping_rates',
        'status',
        'user_id',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7', 
        'social_media' => 'array',
        'verified' => 'boolean',
        'uses_custom_shipping_rates' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'is_verified',
    ];

    /**
     * Accessor/mutator for is_verified (maps to verified column).
     */
    protected function isVerified(): Attribute
    {
        return Attribute::make(
            get: fn () => (bool) $this->verified,
            set: fn ($value) => ['verified' => (bool) $value],
        );
    }

    /**
     * Get the user that owns the producer.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the products for the producer.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}