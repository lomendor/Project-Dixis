<?php

namespace Tests\Feature;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Pass EMAIL-UTF8-01: Test UTF-8 encoding on transactional emails.
 */
class MailEncodingTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_email_has_utf8_charset(): void
    {
        // Create a test user
        $user = User::factory()->create([
            'name' => 'Γιώργος Παπαδόπουλος',
            'email' => 'test@example.com',
        ]);

        $capturedMessage = null;

        // Listen for the MessageSending event to capture the message
        Event::listen(MessageSending::class, function (MessageSending $event) use (&$capturedMessage) {
            $capturedMessage = $event->message;
        });

        // Send the email
        Mail::to($user->email)->send(new ResetPasswordMail($user, 'https://dixis.gr/reset?token=test123'));

        // Verify we captured a message
        $this->assertNotNull($capturedMessage, 'Email message was not captured');

        // Check for X-Dixis-Charset header (our custom marker)
        $headers = $capturedMessage->getHeaders();
        $this->assertTrue(
            $headers->has('X-Dixis-Charset'),
            'X-Dixis-Charset header should be present'
        );
        $this->assertEquals(
            'UTF-8',
            $headers->get('X-Dixis-Charset')->getBodyAsString(),
            'X-Dixis-Charset should be UTF-8'
        );

        // Verify subject contains Greek text (not mojibake)
        $subject = $capturedMessage->getSubject();
        $this->assertStringContainsString(
            'Επαναφορά Κωδικού',
            $subject,
            'Subject should contain Greek text intact'
        );

        // Verify HTML body contains Greek text
        $htmlBody = $capturedMessage->getHtmlBody();
        $this->assertStringContainsString(
            'Επαναφορά Κωδικού',
            $htmlBody,
            'HTML body should contain Greek text intact'
        );
        $this->assertStringContainsString(
            'Γεια σας',
            $htmlBody,
            'HTML body should contain Greek greeting intact'
        );
    }

    public function test_email_templates_use_utf8_meta_charset(): void
    {
        // Create a test user
        $user = User::factory()->create();

        $capturedMessage = null;

        Event::listen(MessageSending::class, function (MessageSending $event) use (&$capturedMessage) {
            $capturedMessage = $event->message;
        });

        Mail::to($user->email)->send(new ResetPasswordMail($user, 'https://dixis.gr/reset?token=test123'));

        $this->assertNotNull($capturedMessage);

        $htmlBody = $capturedMessage->getHtmlBody();

        // Verify the HTML template includes UTF-8 meta charset
        $this->assertStringContainsString(
            '<meta charset="UTF-8">',
            $htmlBody,
            'HTML template should have UTF-8 meta charset'
        );

        // Verify lang="el" for Greek
        $this->assertStringContainsString(
            'lang="el"',
            $htmlBody,
            'HTML template should have Greek language attribute'
        );
    }

    public function test_greek_characters_preserved_in_email_body(): void
    {
        $user = User::factory()->create([
            'name' => 'Μαρία Αντωνίου',
        ]);

        $capturedMessage = null;

        Event::listen(MessageSending::class, function (MessageSending $event) use (&$capturedMessage) {
            $capturedMessage = $event->message;
        });

        Mail::to($user->email)->send(new ResetPasswordMail($user, 'https://dixis.gr/reset?token=abc'));

        $this->assertNotNull($capturedMessage);

        $htmlBody = $capturedMessage->getHtmlBody();

        // Test various Greek characters are preserved
        $greekTexts = [
            'Επαναφορά Κωδικού',           // Title
            'Λάβαμε αίτημα',               // Body text
            'κωδικού πρόσβασης',           // Body text
            'Dixis',                        // Brand name
            'Τοπικά Προϊόντα',             // Footer
        ];

        foreach ($greekTexts as $text) {
            $this->assertStringContainsString(
                $text,
                $htmlBody,
                "Greek text '{$text}' should be preserved in email body"
            );
        }
    }
}
