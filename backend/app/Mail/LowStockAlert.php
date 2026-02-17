<?php

namespace App\Mail;

use App\Models\Producer;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * T1-03: Low stock alert email sent to producers when product stock
 * drops to or below the LOW_STOCK_THRESHOLD (5 units).
 */
class LowStockAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Product $product,
        public Producer $producer
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Χαμηλό απόθεμα: {$this->product->name} - Dixis",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.producers.low-stock-alert',
            with: [
                'productName' => $this->product->name,
                'currentStock' => $this->product->stock,
                'producerName' => $this->producer->business_name ?? $this->producer->name,
            ],
        );
    }
}
