<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DbSlowQueries extends Command
{
    protected $signature = 'db:slow-queries {--limit=10}';
    protected $description = 'Show top slow queries via pg_stat_statements';

    public function handle(): int
    {
        $limit = (int)$this->option('limit');
        $limit = max(1, min($limit, 50));

        try {
            $installed = (bool) DB::selectOne("
                SELECT EXISTS(
                  SELECT 1 FROM pg_available_extensions
                  WHERE name='pg_stat_statements' AND installed_version IS NOT NULL
                ) AS ok
            ")->ok;
        } catch (\Throwable $e) {
            $installed = false;
        }

        if (!$installed) {
            $this->warn('pg_stat_statements not installed/available.');
            return 0;
        }

        $rows = DB::select("
            SELECT query, calls, total_time, mean_time, rows
            FROM pg_stat_statements
            WHERE calls > 0
            ORDER BY mean_time DESC
            LIMIT $limit
        ");
        $this->line(json_encode($rows, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
        return 0;
    }
}
