<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only create indexes if the columns exist
        if (Schema::hasColumn('producers', 'tax_id')) {
            try {
                // Try to create unique index on LOWER(tax_id) - idempotent with try-catch
                DB::statement('CREATE UNIQUE INDEX producers_tax_id_unique_lower_idx ON producers (LOWER(tax_id))');
            } catch (\Exception $e) {
                // Index might already exist, or syntax not supported - ignore
            }
        }

        if (Schema::hasColumn('producers', 'latitude') && Schema::hasColumn('producers', 'longitude')) {
            try {
                // Try to create composite index on (latitude, longitude) - idempotent with try-catch
                DB::statement('CREATE INDEX producers_latitude_longitude_idx ON producers (latitude, longitude)');
            } catch (\Exception $e) {
                // Index might already exist - ignore
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes if they exist - use try-catch for cross-DB compatibility
        try {
            DB::statement('DROP INDEX producers_latitude_longitude_idx');
        } catch (\Exception $e) {
            // Index might not exist - ignore
        }

        try {
            DB::statement('DROP INDEX producers_tax_id_unique_lower_idx');
        } catch (\Exception $e) {
            // Index might not exist - ignore
        }
    }
};
