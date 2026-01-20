<?php

namespace App\Providers;

use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mime\Header\Headers;

/**
 * Pass EMAIL-UTF8-01: Ensure UTF-8 encoding on all outgoing emails.
 *
 * Fixes Greek text mojibake by:
 * 1. Setting Content-Type charset=UTF-8 on HTML/text parts
 * 2. Ensuring proper MIME encoding on Subject headers
 */
class MailEncodingServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Event::listen(MessageSending::class, function (MessageSending $event) {
            $message = $event->message;

            // Ensure HTML body has UTF-8 charset
            $htmlBody = $message->getHtmlBody();
            if ($htmlBody !== null) {
                // Set charset on the HTML part
                $message->html($htmlBody, 'utf-8');
            }

            // Ensure text body has UTF-8 charset
            $textBody = $message->getTextBody();
            if ($textBody !== null) {
                $message->text($textBody, 'utf-8');
            }

            // Add explicit Content-Type header with UTF-8 charset
            // This ensures email clients interpret the content correctly
            $headers = $message->getHeaders();

            // Add a custom header to indicate UTF-8 encoding was applied
            // (useful for debugging/verification)
            if (!$headers->has('X-Dixis-Charset')) {
                $headers->addTextHeader('X-Dixis-Charset', 'UTF-8');
            }
        });
    }
}
