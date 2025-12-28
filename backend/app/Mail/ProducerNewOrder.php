<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Producer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Pass 53: New order notification for producers (Greek).
 * Contains ONLY items belonging to this specific producer.
 */
class ProducerNewOrder extends Mailable
{
    use Queueable, SerializesModels;

    public Collection $producerItems;

    public function __construct(
        public Order $order,
        public Producer $producer
    ) {
        // Filter order items to only include this producer's products
        $this->producerItems = $order->orderItems->filter(
            fn ($item) => $item->producer_id === $producer->id
        );
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Νέα Παραγγελία #{$this->order->id} - Dixis",
        );
    }

    public function content(): Content
    {
        $producerSubtotal = $this->producerItems->sum('total_price');

        return new Content(
            view: 'emails.orders.producer-new-order',
            with: [
                'order' => $this->order,
                'producer' => $this->producer,
                'orderNumber' => $this->order->id,
                'items' => $this->producerItems,
                'itemCount' => $this->producerItems->count(),
                'producerSubtotal' => number_format($producerSubtotal, 2),
                'shippingAddress' => $this->formatShippingAddress(),
                'shippingMethod' => $this->formatShippingMethod(),
                'customerName' => $this->getCustomerName(),
            ],
        );
    }

    private function formatShippingAddress(): string
    {
        $address = $this->order->shipping_address;
        if (is_array($address)) {
            return implode(', ', array_filter([
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

    private function getCustomerName(): string
    {
        $address = $this->order->shipping_address;
        if (is_array($address) && isset($address['name'])) {
            return $address['name'];
        }
        return 'Πελάτης';
    }
}
