<?php

namespace App\Mail;

use App\Models\Producer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * PRODUCER-ONBOARD-01: Notify producer when their application is rejected
 */
class ProducerRejected extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Producer $producer
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ενημέρωση αίτησης - Dixis',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.producers.rejected',
            with: [
                'producerName' => $this->producer->business_name ?: $this->producer->name,
                'rejectionReason' => $this->producer->rejection_reason,
                'contactEmail' => 'info@dixis.gr',
            ],
        );
    }
}
