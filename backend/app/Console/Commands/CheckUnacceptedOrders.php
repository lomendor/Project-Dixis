<?php

namespace App\Console\Commands;

use App\Mail\AdminOrderUnaccepted;
use App\Models\Order;
use App\Models\OrderNotification;
use App\Models\Producer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * FIX-ORDER-ESCALATION-01: Check for orders pending >2 minutes without producer acceptance.
 *
 * Sends an admin alert email with the producer's phone number so the admin
 * can call them directly. Uses OrderNotification idempotency to avoid
 * sending duplicate alerts for the same order+producer.
 *
 * Runs every minute via scheduler.
 */
class CheckUnacceptedOrders extends Command
{
    protected $signature = 'orders:check-unaccepted {--minutes=2 : Minutes before escalation}';
    protected $description = 'Alert admin about orders not accepted by producers within threshold';

    public function handle(): int
    {
        if (!config('notifications.email_enabled', false)) {
            $this->line('Email notifications disabled, skipping.');
            return 0;
        }

        $threshold = (int) $this->option('minutes');
        $adminEmail = config('notifications.admin_notify_email');

        if (!$adminEmail) {
            $this->error('No admin email configured (ADMIN_NOTIFY_EMAIL).');
            return 1;
        }

        // Find orders that are still "pending" and older than threshold
        // Exclude test/old orders — only look at last 24h to avoid alerting on ancient data
        $pendingOrders = Order::where('status', 'pending')
            ->where('created_at', '<=', now()->subMinutes($threshold))
            ->where('created_at', '>=', now()->subHours(24))
            ->with(['orderItems.producer'])
            ->get();

        if ($pendingOrders->isEmpty()) {
            $this->line('No unaccepted orders found.');
            return 0;
        }

        $alertsSent = 0;

        foreach ($pendingOrders as $order) {
            // Get producers for this order
            $producerIds = $order->orderItems
                ->pluck('producer_id')
                ->unique()
                ->filter();

            foreach ($producerIds as $producerId) {
                $producer = Producer::find($producerId);
                if (!$producer) {
                    continue;
                }

                // Idempotency: don't alert twice for same order+producer
                $event = 'order_unaccepted_escalation';
                if (OrderNotification::alreadySent($order->id, 'admin', $producerId, $event)) {
                    continue;
                }

                $minutesPending = (int) now()->diffInMinutes($order->created_at);

                try {
                    Mail::to($adminEmail)->send(new AdminOrderUnaccepted(
                        $order,
                        $producer,
                        $minutesPending,
                    ));

                    OrderNotification::recordSent(
                        $order->id,
                        'admin',
                        $producerId,
                        $adminEmail,
                        $event
                    );

                    $alertsSent++;

                    Log::info('FIX-ORDER-ESCALATION-01: Admin alerted about unaccepted order', [
                        'order_id' => $order->id,
                        'producer_id' => $producerId,
                        'producer_name' => $producer->name,
                        'minutes_pending' => $minutesPending,
                    ]);

                    $this->line("Alert sent: Order #{$order->id} — {$producer->name} ({$minutesPending}m)");
                } catch (\Exception $e) {
                    Log::error('FIX-ORDER-ESCALATION-01: Failed to send escalation alert', [
                        'order_id' => $order->id,
                        'producer_id' => $producerId,
                        'error' => $e->getMessage(),
                    ]);
                    $this->error("Failed: Order #{$order->id} — {$e->getMessage()}");
                }
            }
        }

        $this->info("Done. {$alertsSent} alert(s) sent.");
        return 0;
    }
}
