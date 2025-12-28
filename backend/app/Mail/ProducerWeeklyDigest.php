<?php

namespace App\Mail;

use App\Models\Producer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Pass 55: Weekly digest email for producers (Greek).
 */
class ProducerWeeklyDigest extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Producer $producer,
        public array $stats
    ) {}

    public function envelope(): Envelope
    {
        $periodStart = $this->stats['period_start'];
        $periodEnd = $this->stats['period_end'];

        return new Envelope(
            subject: "Εβδομαδιαία Αναφορά ({$periodStart} - {$periodEnd}) - Dixis",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.producers.weekly-digest',
            with: [
                'producer' => $this->producer,
                'producerName' => $this->producer->business_name ?? $this->producer->user?->name ?? 'Παραγωγός',
                'periodStart' => $this->stats['period_start'],
                'periodEnd' => $this->stats['period_end'],
                'ordersCount' => $this->stats['orders_count'],
                'grossRevenue' => number_format($this->stats['gross_revenue'], 2),
                'pendingCount' => $this->stats['pending_count'],
                'deliveredCount' => $this->stats['delivered_count'],
                'topProducts' => $this->stats['top_products'],
            ],
        );
    }
}
