<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send notification for order placed event
     */
    public function sendOrderPlacedNotification(Order $order): void
    {
        $buyer = $order->user;
        $producer = $order->orderItems->first()->product->user ?? null;

        // Send to buyer
        $this->createNotification($buyer, 'order_placed', [
            'order_id' => $order->id,
            'total_amount' => $order->total_amount,
            'order_number' => $order->id,
            'message' => 'Η παραγγελία σας #{order_id} καταχωρήθηκε επιτυχώς!',
        ]);

        $this->sendEmail($buyer->email, 'order_placed_buyer', [
            'user_name' => $buyer->name,
            'order_id' => $order->id,
            'total_amount' => number_format($order->total_amount, 2),
        ]);

        // Send to producer if exists
        if ($producer) {
            $this->createNotification($producer, 'order_placed', [
                'order_id' => $order->id,
                'buyer_name' => $buyer->name,
                'total_amount' => $order->total_amount,
                'message' => 'Νέα παραγγελία από {buyer_name} - #{order_id}',
            ]);

            $this->sendEmail($producer->email, 'order_placed_producer', [
                'user_name' => $producer->name,
                'buyer_name' => $buyer->name,
                'order_id' => $order->id,
                'total_amount' => number_format($order->total_amount, 2),
            ]);
        }
    }

    /**
     * Send notification for order shipped event
     */
    public function sendOrderShippedNotification(Order $order): void
    {
        $buyer = $order->user;

        $this->createNotification($buyer, 'order_shipped', [
            'order_id' => $order->id,
            'tracking_number' => $order->tracking_number ?? null,
            'message' => 'Η παραγγελία σας #{order_id} έχει αποσταλεί!',
        ]);

        $this->sendEmail($buyer->email, 'order_shipped', [
            'user_name' => $buyer->name,
            'order_id' => $order->id,
            'tracking_number' => $order->tracking_number ?? 'N/A',
        ]);
    }

    /**
     * Send notification for refund issued event
     */
    public function sendRefundIssuedNotification(Order $order, float $refundAmount): void
    {
        $buyer = $order->user;

        $this->createNotification($buyer, 'refund_issued', [
            'order_id' => $order->id,
            'refund_amount' => $refundAmount,
            'message' => 'Έγινε επιστροφή €{refund_amount} για την παραγγελία #{order_id}',
        ]);

        $this->sendEmail($buyer->email, 'refund_issued', [
            'user_name' => $buyer->name,
            'order_id' => $order->id,
            'refund_amount' => number_format($refundAmount, 2),
        ]);
    }

    /**
     * Create an in-app notification
     */
    private function createNotification(User $user, string $type, array $payload): void
    {
        try {
            Notification::create([
                'user_id' => $user->id,
                'type' => $type,
                'payload' => $payload,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create notification', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send email notification using configured provider
     */
    private function sendEmail(string $email, string $template, array $data): void
    {
        try {
            // Use Laravel's queue system for better performance
            // Mail::to($email)->queue(new NotificationMail($template, $data));

            // For now, log the email data (can be replaced with actual email sending)
            Log::info('Email notification', [
                'to' => $email,
                'template' => $template,
                'data' => $data,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'email' => $email,
                'template' => $template,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get unread notifications for a user
     */
    public function getUnreadNotifications(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $user->notifications()
            ->unread()
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get unread notifications count for a user
     */
    public function getUnreadCount(User $user): int
    {
        return $user->notifications()->unread()->count();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(User $user): void
    {
        $user->notifications()->unread()->update(['read_at' => now()]);
    }
}
