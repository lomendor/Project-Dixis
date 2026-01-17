<?php

namespace Tests\Feature\Console;

use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Pass 60.1: Tests for dixis:email:test Artisan command.
 *
 * These tests use Mail::fake() to avoid actually sending emails in CI.
 */
#[\PHPUnit\Framework\Attributes\CoversClass(\App\Console\Commands\TestEmail::class)]
class TestEmailCommandTest extends TestCase
{
    /**
     * Test that command fails without --to option.
     */
    public function test_command_requires_to_option(): void
    {
        $this->artisan('dixis:email:test')
            ->assertFailed();
    }

    /**
     * Test that command validates email format.
     */
    public function test_command_validates_email_format(): void
    {
        $this->artisan('dixis:email:test', ['--to' => 'invalid-email'])
            ->assertFailed();
    }

    /**
     * Test that dry-run mode works and shows configuration status.
     */
    public function test_dry_run_mode_shows_configuration(): void
    {
        $this->artisan('dixis:email:test', [
            '--to' => 'test@example.com',
            '--dry-run' => true,
        ])
            ->assertSuccessful();
    }

    /**
     * Test that command refuses to send when EMAIL_NOTIFICATIONS_ENABLED=false.
     */
    public function test_command_refuses_when_email_disabled(): void
    {
        // Ensure email is disabled
        config(['notifications.email_enabled' => false]);

        $this->artisan('dixis:email:test', ['--to' => 'test@example.com'])
            ->assertFailed();
    }

    /**
     * Test that dry-run works even when email is disabled.
     */
    public function test_dry_run_works_when_email_disabled(): void
    {
        config(['notifications.email_enabled' => false]);

        $this->artisan('dixis:email:test', [
            '--to' => 'test@example.com',
            '--dry-run' => true,
        ])
            ->assertSuccessful();
    }

    /**
     * Test that command sends email when enabled (using Mail::fake).
     */
    public function test_command_sends_email_when_enabled(): void
    {
        Mail::fake();

        // Enable email with log mailer (always configured)
        config(['notifications.email_enabled' => true]);
        config(['mail.default' => 'log']);

        $this->artisan('dixis:email:test', ['--to' => 'test@example.com'])
            ->assertSuccessful();
    }

    /**
     * Test custom subject option with dry-run.
     */
    public function test_custom_subject_option(): void
    {
        $this->artisan('dixis:email:test', [
            '--to' => 'test@example.com',
            '--subject' => 'Custom Subject',
            '--dry-run' => true,
        ])
            ->assertSuccessful();
    }
}
