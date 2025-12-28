<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Pass 53: Order confirmation email for consumers (Greek).
 */
class ConsumerOrderPlaced extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Επιβεβαίωση Παραγγελίας #{$this->order->id} - Dixis",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.consumer-placed',
            with: [
                'order' => $this->order,
                'orderNumber' => $this->order->id,
                'shippingAddress' => $this->formatShippingAddress(),
                'paymentMethod' => $this->formatPaymentMethod(),
                'shippingMethod' => $this->formatShippingMethod(),
                'items' => $this->order->orderItems,
                'subtotal' => number_format($this->order->subtotal, 2),
                'shippingCost' => number_format($this->order->shipping_cost ?? 0, 2),
                'total' => number_format($this->order->total, 2),
            ],
        );
    }

    private function formatShippingAddress(): string
    {
        $address = $this->order->shipping_address;
        if (is_array($address)) {
            return implode(', ', array_filter([
                $address['name'] ?? '',
                $address['line1'] ?? '',
                $address['city'] ?? '',
                $address['postal_code'] ?? '',
            ]));
        }
        return $address ?? '';
    }

    private function formatPaymentMethod(): string
    {
        return match ($this->order->payment_method) {
            'COD', 'cod' => 'Αντικαταβολή',
            'CARD', 'card' => 'Κάρτα',
            default => $this->order->payment_method ?? 'Αντικαταβολή',
        };
    }

    private function formatShippingMethod(): string
    {
        return match ($this->order->shipping_method) {
            'HOME' => 'Παράδοση στο σπίτι',
            'PICKUP' => 'Παραλαβή από κατάστημα',
            'COURIER' => 'Μεταφορική εταιρεία',
            default => $this->order->shipping_method ?? '',
        };
    }
}
