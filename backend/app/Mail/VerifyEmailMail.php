<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Pass EMAIL-VERIFY-01: Email verification mail (Greek).
 */
class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $verifyUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Επιβεβαίωση Email - Dixis',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.auth.verify-email',
            with: [
                'user' => $this->user,
                'verifyUrl' => $this->verifyUrl,
            ],
        );
    }
}
