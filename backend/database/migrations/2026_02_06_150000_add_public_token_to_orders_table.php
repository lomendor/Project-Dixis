<?php

/**
 * Pass TRACKING-DISPLAY-01: Add public_token for customer tracking URLs
 *
 * This token allows customers to track their order without authentication.
 * Format: UUID v4 (36 chars with hyphens)
 *
 * @see docs/AGENT/PASSES/SUMMARY-Pass-TRACKING-DISPLAY-01.md
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add nullable column
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('public_token')->nullable()->after('id');
        });

        // Step 2: Backfill existing orders with UUIDs
        DB::table('orders')
            ->whereNull('public_token')
            ->orderBy('id')
            ->chunk(100, function ($orders) {
                foreach ($orders as $order) {
                    DB::table('orders')
                        ->where('id', $order->id)
                        ->update(['public_token' => Str::uuid()->toString()]);
                }
            });

        // Step 3: Add unique index (after backfill to avoid conflicts)
        Schema::table('orders', function (Blueprint $table) {
            $table->unique('public_token');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['public_token']);
            $table->dropColumn('public_token');
        });
    }
};
