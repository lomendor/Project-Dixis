<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration {
    public function up(): void {
        try {
            DB::statement("CREATE EXTENSION IF NOT EXISTS pg_stat_statements");
        } catch (\Throwable $e) {
            Log::warning("pg_stat_statements enable failed (non-fatal): ".$e->getMessage());
        }
    }
    public function down(): void {
        // Δεν κάνουμε DROP EXTENSION σε down (μπορεί να το χρησιμοποιούν άλλα)
    }
};
