<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Mark seed/test users to prevent login in production.
 *
 * Usage:
 *   php artisan users:mark-seed                    # Mark all @example.com users
 *   php artisan users:mark-seed --dry-run          # Preview without changes
 *   php artisan users:mark-seed --email=test@foo   # Mark specific email
 *   php artisan users:mark-seed --unmark           # Remove is_seed flag
 */
class MarkSeedUsers extends Command
{
    protected $signature = 'users:mark-seed
        {--dry-run : Preview changes without applying}
        {--email= : Mark specific email address}
        {--unmark : Remove is_seed flag instead of setting it}';

    protected $description = 'Mark seed/test user accounts (blocks login)';

    /**
     * Patterns that identify seed/test accounts.
     */
    protected array $seedPatterns = [
        '%@example.com',
        '%@example.org',
        '%@test.com',
        '%@demo.dixis.gr',
    ];

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $specificEmail = $this->option('email');
        $unmark = $this->option('unmark');

        $action = $unmark ? 'Unmarking' : 'Marking';
        $this->info("[{$action} seed users] " . ($dryRun ? '(DRY RUN)' : ''));

        // Build query
        $query = User::query();

        if ($specificEmail) {
            $query->where('email', $specificEmail);
        } else {
            $query->where(function ($q) {
                foreach ($this->seedPatterns as $pattern) {
                    $q->orWhere('email', 'LIKE', $pattern);
                }
            });
        }

        $users = $query->get(['id', 'email', 'name', 'is_seed']);

        if ($users->isEmpty()) {
            $this->warn('No matching users found.');
            return Command::SUCCESS;
        }

        $this->newLine();
        $this->table(
            ['ID', 'Email', 'Name', 'Current is_seed'],
            $users->map(fn ($u) => [$u->id, $u->email, $u->name, $u->is_seed ? 'true' : 'false'])
        );
        $this->newLine();

        if ($dryRun) {
            $this->info("[DRY RUN] Would " . ($unmark ? 'unmark' : 'mark') . " {$users->count()} user(s).");
            return Command::SUCCESS;
        }

        // Apply changes
        $newValue = !$unmark;
        $updated = User::whereIn('id', $users->pluck('id'))->update(['is_seed' => $newValue]);

        $this->info("[OK] Updated {$updated} user(s): is_seed = " . ($newValue ? 'true' : 'false'));

        return Command::SUCCESS;
    }
}
