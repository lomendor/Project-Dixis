<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pass 53: Idempotency tracking for order email notifications.
 * Prevents double-sends on retries.
 */
class OrderNotification extends Model
{
    protected $fillable = [
        'order_id',
        'recipient_type',
        'recipient_id',
        'recipient_email',
        'event',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if this notification has already been sent.
     */
    public static function alreadySent(
        int $orderId,
        string $recipientType,
        ?int $recipientId,
        string $event
    ): bool {
        return self::where('order_id', $orderId)
            ->where('recipient_type', $recipientType)
            ->where('recipient_id', $recipientId)
            ->where('event', $event)
            ->exists();
    }

    /**
     * Record that a notification was sent.
     */
    public static function recordSent(
        int $orderId,
        string $recipientType,
        ?int $recipientId,
        string $email,
        string $event
    ): self {
        return self::create([
            'order_id' => $orderId,
            'recipient_type' => $recipientType,
            'recipient_id' => $recipientId,
            'recipient_email' => $email,
            'event' => $event,
            'sent_at' => now(),
        ]);
    }
}
