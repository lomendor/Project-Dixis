<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Pass ADMIN-NOTIFY-01: Admin notification for new orders (Greek).
 *
 * Sends a summary email to the admin when a new order is placed.
 * Includes order total, item count, payment method, and a link
 * to the admin dashboard.
 */
class AdminNewOrder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Νέα Παραγγελία #{$this->order->id} — €"
                . number_format($this->order->total, 2) . " — Dixis",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.admin-new-order',
            with: [
                'order' => $this->order,
                'orderNumber' => $this->order->id,
                'itemCount' => $this->order->orderItems->count(),
                'paymentMethod' => $this->formatPaymentMethod(),
                'total' => number_format($this->order->total, 2),
                'customerName' => $this->getCustomerName(),
                'customerEmail' => $this->getCustomerEmail(),
                'adminUrl' => config('app.url') . '/admin/orders/' . $this->order->id,
            ],
        );
    }

    private function formatPaymentMethod(): string
    {
        return match ($this->order->payment_method) {
            'COD', 'cod' => 'Αντικαταβολή',
            'CARD', 'card' => 'Κάρτα',
            default => $this->order->payment_method ?? 'Αντικαταβολή',
        };
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

    private function getCustomerEmail(): string
    {
        if ($this->order->user?->email) {
            return $this->order->user->email;
        }
        $address = $this->order->shipping_address;
        if (is_array($address) && isset($address['email'])) {
            return $address['email'];
        }
        return '-';
    }
}
