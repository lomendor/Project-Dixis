<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * T2-01: Refund confirmation email sent to customer after
 * a successful Stripe refund is processed.
 */
class RefundConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public float $refundedAmount
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Επιστροφή χρημάτων — Παραγγελία #{$this->order->id} — Dixis",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.refund-confirmation',
            with: [
                'orderId' => $this->order->id,
                'refundedAmount' => number_format($this->refundedAmount, 2),
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
        return $this->order->user?->name ?? 'Πελάτη';
    }
}
