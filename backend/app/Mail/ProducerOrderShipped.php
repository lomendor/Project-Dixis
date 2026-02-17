<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Producer;
use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * T2-02: Notify producer when their items in an order are shipped/delivered.
 * Contains ONLY items belonging to this specific producer.
 */
class ProducerOrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    public Collection $producerItems;

    public function __construct(
        public Order $order,
        public Producer $producer,
        public string $eventStatus = 'shipped'
    ) {
        $this->producerItems = $order->orderItems->filter(
            fn ($item) => $item->producer_id === $producer->id
        );
    }

    public function envelope(): Envelope
    {
        $verb = $this->eventStatus === 'delivered' ? 'παραδόθηκε' : 'στάλθηκε';
        return new Envelope(
            subject: "Η παραγγελία #{$this->order->id} {$verb} - Dixis",
        );
    }

    public function content(): Content
    {
        $producerSubtotal = $this->producerItems->sum('total_price');

        return new Content(
            view: 'emails.producers.order-shipped',
            with: [
                'order' => $this->order,
                'producer' => $this->producer,
                'orderNumber' => $this->order->id,
                'items' => $this->producerItems,
                'itemCount' => $this->producerItems->count(),
                'producerSubtotal' => number_format($producerSubtotal, 2),
                'isDelivered' => $this->eventStatus === 'delivered',
                'customerName' => $this->getCustomerName(),
            ],
        );
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
