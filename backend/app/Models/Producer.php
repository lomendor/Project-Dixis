<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'business_name',
        'tax_id',
        'tax_office',
        'food_license_number',
        'agreement_accepted_at',
        'iban',
        'bank_account_holder',
        'description',
        'image_url',
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
        'free_shipping_threshold_eur',
        'status',
        'user_id',
        'is_active',
        'rejection_reason',
        // Onboarding V2
        'onboarding_completed_at',
        'product_categories',
        'tax_registration_doc_url',
        'efet_notification_doc_url',
        'haccp_declaration_doc_url',
        'haccp_declaration_accepted',
        'beekeeper_registry_number',
        'cpnp_notification_number',
        'responsible_person_name',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'social_media' => 'array',
        'verified' => 'boolean',
        'uses_custom_shipping_rates' => 'boolean',
        'free_shipping_threshold_eur' => 'decimal:2',
        'is_active' => 'boolean',
        'agreement_accepted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        // Onboarding V2
        'onboarding_completed_at' => 'datetime',
        'product_categories' => 'array',
        'haccp_declaration_accepted' => 'boolean',
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

    /**
     * Pass PAYOUT-02: Get commissions for this producer.
     */
    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }

    /**
     * Pass PAYOUT-02: Get settlement batches for this producer.
     */
    public function settlements()
    {
        return $this->hasMany(CommissionSettlement::class);
    }
}
