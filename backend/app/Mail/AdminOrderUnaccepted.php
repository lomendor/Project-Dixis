<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Producer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * FIX-ORDER-ESCALATION-01: Admin alert when a producer hasn't accepted an order
 * within 2 minutes. Includes producer phone so admin can call directly.
 */
class AdminOrderUnaccepted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public Producer $producer,
        public int $minutesPending,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "⚠️ Παραγγελία #{$this->order->id} — Ο παραγωγός δεν αποδέχτηκε ({$this->minutesPending} λεπτά)",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.admin-order-unaccepted',
            with: [
                'order' => $this->order,
                'orderNumber' => $this->order->id,
                'producer' => $this->producer,
                'producerName' => $this->producer->name,
                'producerPhone' => $this->producer->phone ?? 'Δεν υπάρχει τηλέφωνο',
                'producerEmail' => $this->producer->user?->email ?? $this->producer->email ?? '-',
                'minutesPending' => $this->minutesPending,
                'total' => number_format($this->order->total_amount, 2),
                'customerName' => $this->getCustomerName(),
                'adminUrl' => 'https://dixis.gr/admin/orders',
            ],
        );
    }

    private function getCustomerName(): string
    {
        if ($this->order->user?->name) {
            return $this->order->user->name;
        }
        $address = $this->order->shipping_address;
        if (is_array($address) && isset($address['name'])) {
            return $address['name'];
        }
        return 'Guest';
    }
}
