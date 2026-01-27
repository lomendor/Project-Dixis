<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add total_cents and channel columns for commission preview feature.
     * - total_cents: integer representation of total (cents) for commission calculations
     * - channel: B2C/B2B/MARKETPLACE channel for commission rule matching
     */
    public function up(): void
    {
        // Skip if columns already exist (idempotent)
        if (Schema::hasColumn('orders', 'total_cents')) {
            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->bigInteger('total_cents')->nullable()->after('total_amount');
            $table->string('channel', 20)->nullable()->after('total_cents');
        });

        // Backfill total_cents from existing total column (total * 100)
        DB::statement('UPDATE orders SET total_cents = ROUND(total * 100) WHERE total_cents IS NULL AND total IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['total_cents', 'channel']);
        });
    }
};
