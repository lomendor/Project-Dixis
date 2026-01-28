<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Add per-producer free shipping threshold
 *
 * Allows each producer to set their own free shipping threshold.
 * NULL means use the system default (€35.00).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->decimal('free_shipping_threshold_eur', 10, 2)
                ->nullable()
                ->after('uses_custom_shipping_rates')
                ->comment('Per-producer free shipping threshold in EUR. NULL = use system default (€35)');
        });
    }

    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn('free_shipping_threshold_eur');
        });
    }
};
