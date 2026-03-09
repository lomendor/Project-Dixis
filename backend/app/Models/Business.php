<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * B2B PIVOT: Business buyer profile.
 *
 * Restaurants, hotels, delis that buy wholesale from producers.
 * Mirrors the Producer model pattern: User hasOne Business.
 * Requires admin approval before accessing B2B products.
 */
class Business extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'tax_id',
        'tax_office',
        'business_type',
        'contact_person',
        'phone',
        'email',
        'website',
        'address',
        'city',
        'postal_code',
        'region',
        'status',
        'rejection_reason',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Status constants — same pattern as Producer.
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_REJECTED = 'rejected';

    /**
     * Business type constants.
     */
    public const TYPE_RESTAURANT = 'restaurant';
    public const TYPE_HOTEL = 'hotel';
    public const TYPE_DELI = 'deli';
    public const TYPE_CATERING = 'catering';
    public const TYPE_OTHER = 'other';

    /**
     * Get the user that owns this business profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * B2B PIVOT: Subscriptions for this business.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Check if business is approved and active.
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if business is pending approval.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}
