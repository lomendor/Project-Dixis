<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Pass 54: Order delivered notification email (Greek).
 */
class OrderDelivered extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Η παραγγελία #{$this->order->id} παραδόθηκε - Dixis",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.delivered',
            with: [
                'order' => $this->order,
                'orderNumber' => $this->order->id,
            ],
        );
    }
}
