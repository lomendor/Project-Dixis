<?php

namespace App\Services;

use App\Mail\ConsumerOrderPlaced;
use App\Mail\OrderDelivered;
use App\Mail\OrderShipped;
use App\Mail\ProducerNewOrder;
use App\Models\Order;
use App\Models\OrderNotification;
use App\Models\Producer;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Pass 53: Order email notification service.
 *
 * Features:
 * - Feature flag (EMAIL_NOTIFICATIONS_ENABLED)
 * - Idempotent sending (no double-sends)
 * - Greek content for EL market
 * - Graceful failure (missing emails don't crash)
 */
class OrderEmailService
{
    /**
     * Pass 54: Send notification when order status changes to shipped/delivered.
     * Called after status update commits.
     */
    public function sendOrderStatusNotification(Order $order, string $newStatus): void
    {
        if (!$this->isEnabled()) {
            Log::debug('Pass 54: Email notifications disabled, skipping', [
                'order_id' => $order->id,
                'status' => $newStatus,
            ]);
            return;
        }

        // Only send for shipped and delivered statuses
        if (!in_array($newStatus, ['shipped', 'delivered'])) {
            return;
        }

        $email = $this->getConsumerEmail($order);
        if (!$email) {
            Log::warning('Pass 54: No consumer email available, skipping status notification', [
                'order_id' => $order->id,
                'status' => $newStatus,
            ]);
            return;
        }

        $event = "order_{$newStatus}";

        // Idempotency check
        if (OrderNotification::alreadySent($order->id, 'consumer', null, $event)) {
            Log::debug("Pass 54: Consumer {$event} already sent, skipping", [
                'order_id' => $order->id,
            ]);
            return;
        }

        try {
            $mailable = $newStatus === 'shipped'
                ? new OrderShipped($order)
                : new OrderDelivered($order);

            Mail::to($email)->send($mailable);

            OrderNotification::recordSent(
                $order->id,
                'consumer',
                null,
                $email,
                $event
            );

            Log::info("Pass 54: Consumer {$event} notification sent", [
                'order_id' => $order->id,
                'email' => $this->maskEmail($email),
            ]);
        } catch (\Exception $e) {
            Log::error("Pass 54: Failed to send {$event} notification", [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            // Don't throw - graceful failure
        }
    }

    /**
     * Send all notifications for a newly placed order.
     * Called after order creation transaction commits.
     */
    public function sendOrderPlacedNotifications(Order $order): void
    {
        if (!$this->isEnabled()) {
            Log::debug('Pass 53: Email notifications disabled, skipping', [
                'order_id' => $order->id,
            ]);
            return;
        }

        // Eager load what we need
        $order->load('orderItems.producer');

        // A) Consumer confirmation email
        $this->sendConsumerConfirmation($order);

        // B) Producer notification emails (one per producer)
        $this->sendProducerNotifications($order);
    }

    /**
     * Send confirmation email to consumer.
     */
    protected function sendConsumerConfirmation(Order $order): void
    {
        $email = $this->getConsumerEmail($order);
        if (!$email) {
            Log::warning('Pass 53: No consumer email available, skipping confirmation', [
                'order_id' => $order->id,
            ]);
            return;
        }

        // Idempotency check
        if (OrderNotification::alreadySent($order->id, 'consumer', null, 'order_placed')) {
            Log::debug('Pass 53: Consumer order_placed already sent, skipping', [
                'order_id' => $order->id,
            ]);
            return;
        }

        try {
            Mail::to($email)->send(new ConsumerOrderPlaced($order));

            OrderNotification::recordSent(
                $order->id,
                'consumer',
                null,
                $email,
                'order_placed'
            );

            Log::info('Pass 53: Consumer order confirmation sent', [
                'order_id' => $order->id,
                'email' => $this->maskEmail($email),
            ]);
        } catch (\Exception $e) {
            Log::error('Pass 53: Failed to send consumer confirmation', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            // Don't throw - graceful failure
        }
    }

    /**
     * Send notification to each producer with items in this order.
     */
    protected function sendProducerNotifications(Order $order): void
    {
        // Group order items by producer
        $producerIds = $order->orderItems
            ->pluck('producer_id')
            ->unique()
            ->filter(); // Remove nulls

        foreach ($producerIds as $producerId) {
            $producer = Producer::with('user')->find($producerId);
            if (!$producer) {
                Log::warning('Pass 53: Producer not found, skipping notification', [
                    'order_id' => $order->id,
                    'producer_id' => $producerId,
                ]);
                continue;
            }

            $email = $producer->user?->email ?? $producer->email ?? null;
            if (!$email) {
                Log::warning('Pass 53: Producer has no email, skipping notification', [
                    'order_id' => $order->id,
                    'producer_id' => $producerId,
                ]);
                continue;
            }

            // Idempotency check
            if (OrderNotification::alreadySent($order->id, 'producer', $producerId, 'order_placed')) {
                Log::debug('Pass 53: Producer order_placed already sent, skipping', [
                    'order_id' => $order->id,
                    'producer_id' => $producerId,
                ]);
                continue;
            }

            try {
                Mail::to($email)->send(new ProducerNewOrder($order, $producer));

                OrderNotification::recordSent(
                    $order->id,
                    'producer',
                    $producerId,
                    $email,
                    'order_placed'
                );

                Log::info('Pass 53: Producer notification sent', [
                    'order_id' => $order->id,
                    'producer_id' => $producerId,
                    'email' => $this->maskEmail($email),
                ]);
            } catch (\Exception $e) {
                Log::error('Pass 53: Failed to send producer notification', [
                    'order_id' => $order->id,
                    'producer_id' => $producerId,
                    'error' => $e->getMessage(),
                ]);
                // Don't throw - graceful failure
            }
        }
    }

    /**
     * Get consumer email from order or shipping address.
     */
    protected function getConsumerEmail(Order $order): ?string
    {
        // Try user email first
        if ($order->user?->email) {
            return $order->user->email;
        }

        // Try shipping address email
        $address = $order->shipping_address;
        if (is_array($address) && isset($address['email'])) {
            return $address['email'];
        }

        return null;
    }

    /**
     * Check if email notifications are enabled.
     */
    protected function isEnabled(): bool
    {
        return config('notifications.email_enabled', false);
    }

    /**
     * Mask email for logging (privacy).
     */
    protected function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return '***';
        }
        $local = $parts[0];
        $domain = $parts[1];
        $masked = substr($local, 0, 2) . '***@' . $domain;
        return $masked;
    }
}
