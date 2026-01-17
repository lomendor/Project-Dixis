<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Pass 60.1: Test email command.
 *
 * Usage:
 *   php artisan dixis:email:test --to=your@email.com                    # Send test email
 *   php artisan dixis:email:test --to=your@email.com --dry-run          # Validate config only
 *   php artisan dixis:email:test --to=your@email.com --subject="Custom" # Custom subject
 */
class TestEmail extends Command
{
    protected $signature = 'dixis:email:test
        {--to= : Recipient email address (required)}
        {--subject= : Custom subject line}
        {--dry-run : Validate configuration without sending}';

    protected $description = 'Send a test email to verify email configuration';

    public function handle(): int
    {
        $to = $this->option('to');
        $subject = $this->option('subject') ?? 'Test Email from Dixis';
        $dryRun = $this->option('dry-run');

        // Validate --to option
        if (empty($to)) {
            $this->error('The --to option is required. Usage: php artisan dixis:email:test --to=your@email.com');
            return Command::FAILURE;
        }

        // Basic email validation
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error("Invalid email address: {$to}");
            return Command::FAILURE;
        }

        // Get configuration
        $emailEnabled = config('notifications.email_enabled', false);
        $mailer = config('mail.default', 'log');
        $fromAddress = config('mail.from.address', 'info@dixis.gr');
        $fromName = config('mail.from.name', 'Dixis');

        // Mask FROM address for display (privacy)
        $maskedFrom = $this->maskEmail($fromAddress);

        if ($dryRun) {
            $this->info('[DRY RUN] Email configuration validation:');
            $this->newLine();

            // Check feature flag
            $flagStatus = $emailEnabled ? 'enabled' : 'disabled';
            $flagStyle = $emailEnabled ? 'info' : 'comment';
            $this->line("  EMAIL_NOTIFICATIONS_ENABLED: <{$flagStyle}>{$flagStatus}</{$flagStyle}>");

            // Check mailer
            $this->line("  Mailer: <info>{$mailer}</info>");

            // Check configuration based on mailer
            $configured = $this->isMailerConfigured($mailer);
            $configStatus = $configured ? '<info>valid</info>' : '<error>missing keys</error>';
            $this->line("  Configuration: {$configStatus}");

            // FROM address
            $fromOk = !empty($fromAddress) && $fromAddress !== 'hello@example.com';
            $fromStatus = $fromOk ? '<info>configured</info>' : '<comment>using default</comment>';
            $this->line("  FROM address: {$fromStatus}");

            $this->newLine();

            if (!$emailEnabled) {
                $this->warn('[DRY RUN] EMAIL_NOTIFICATIONS_ENABLED is false. Set to true before sending.');
                $this->line("[DRY RUN] Would send to: {$to}");
            } elseif (!$configured) {
                $this->warn("[DRY RUN] Mailer '{$mailer}' is not fully configured.");
                $this->line("[DRY RUN] Would send to: {$to}");
            } else {
                $this->info('[DRY RUN] Email configuration is valid.');
                $this->line("[DRY RUN] Would send to: {$to}");
                $this->line("[DRY RUN] From: {$fromName} <{$maskedFrom}>");
                $this->line("[DRY RUN] Subject: {$subject}");
            }

            return Command::SUCCESS;
        }

        // Not dry-run: check if email is enabled
        if (!$emailEnabled) {
            $this->error('Email notifications are disabled (EMAIL_NOTIFICATIONS_ENABLED=false).');
            $this->line('Use --dry-run to validate configuration without sending.');
            return Command::FAILURE;
        }

        // Check if mailer is configured
        if (!$this->isMailerConfigured($mailer)) {
            $this->error("Mailer '{$mailer}' is not fully configured.");
            $this->line('Use --dry-run to see configuration details.');
            return Command::FAILURE;
        }

        // Send actual email
        $this->info("Sending test email to: {$to}");

        try {
            Mail::raw("This is a test email from Dixis.\n\nIf you received this, your email configuration is working correctly.\n\nMailer: {$mailer}\nSent at: " . now()->toISOString(), function ($message) use ($to, $subject) {
                $message->to($to)
                    ->subject($subject);
            });

            $this->newLine();
            $this->info("[OK] Test email sent successfully to {$to}");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to send test email: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Check if the given mailer is properly configured.
     */
    protected function isMailerConfigured(string $mailer): bool
    {
        if ($mailer === 'resend') {
            return !empty(config('services.resend.key'));
        }

        if ($mailer === 'smtp') {
            $host = config('mail.mailers.smtp.host');
            $user = config('mail.mailers.smtp.username');
            return !empty($host) && $host !== '127.0.0.1' && !empty($user);
        }

        // Log, array, and other dev mailers are always "configured"
        if (in_array($mailer, ['log', 'array', 'failover', 'roundrobin'])) {
            return true;
        }

        return false;
    }

    /**
     * Mask email for display (privacy).
     */
    protected function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return '***';
        }
        $local = $parts[0];
        $domain = $parts[1];
        $masked = substr($local, 0, 1) . '***';
        return "{$masked}@{$domain}";
    }
}
