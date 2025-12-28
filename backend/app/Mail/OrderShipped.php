<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Pass 54: Order shipped notification email (Greek).
 */
class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Η παραγγελία #{$this->order->id} στάλθηκε - Dixis",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.shipped',
            with: [
                'order' => $this->order,
                'orderNumber' => $this->order->id,
                'shippingAddress' => $this->formatShippingAddress(),
                'shippingMethod' => $this->formatShippingMethod(),
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
