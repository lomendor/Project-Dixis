<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'carrier_code',
        'tracking_code',
        'label_url',
        'status',
        'billable_weight_kg',
        'zone_code',
        'shipping_cost_eur',
        'tracking_events',
        'shipped_at',
        'delivered_at',
        'notes',
    ];

    protected $casts = [
        'billable_weight_kg' => 'decimal:2',
        'shipping_cost_eur' => 'decimal:2',
        'tracking_events' => 'array',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the order that owns the shipment.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if shipment is in a completed state
     */
    public function isCompleted(): bool
    {
        return in_array($this->status, ['delivered', 'failed']);
    }

    /**
     * Check if shipment is trackable
     */
    public function isTrackable(): bool
    {
        return !empty($this->tracking_code) && $this->status !== 'pending';
    }

    /**
     * Get the estimated delivery date
     */
    public function getEstimatedDeliveryAttribute(): ?\Carbon\Carbon
    {
        if (!$this->shipped_at) {
            return null;
        }

        // Default to 3 days from shipped date
        $estimatedDays = 3;

        // Adjust based on zone (if available)
        if ($this->zone_code) {
            $zoneDays = [
                'GR_ATTICA' => 1,
                'GR_THESSALONIKI' => 2,
                'GR_MAINLAND' => 3,
                'GR_CRETE' => 4,
                'GR_ISLANDS_LARGE' => 5,
                'GR_ISLANDS_SMALL' => 7,
            ];

            $estimatedDays = $zoneDays[$this->zone_code] ?? 3;
        }

        return $this->shipped_at->addDays($estimatedDays);
    }
}
