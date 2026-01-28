<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass ORDER-SHIPPING-SPLIT-01: Add lock/quote fields to order_shipping_lines
 *
 * Adds fields required for shipping quote vs lock verification:
 * - zone: The shipping zone used for calculation
 * - weight_grams: Total weight of items from this producer
 * - quoted_at: When the quote was first calculated (nullable for legacy)
 * - locked_at: When the shipping was locked at order creation
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_shipping_lines', function (Blueprint $table) {
            // Zone used for shipping calculation
            $table->string('zone', 100)->nullable()->after('shipping_method');

            // Weight in grams for accurate calculation
            $table->unsignedInteger('weight_grams')->nullable()->after('zone');

            // Timestamps for quote vs lock verification
            $table->timestamp('quoted_at')->nullable()->after('free_shipping_applied');
            $table->timestamp('locked_at')->nullable()->after('quoted_at');

            // Index for audit queries
            $table->index('locked_at');
        });
    }

    public function down(): void
    {
        Schema::table('order_shipping_lines', function (Blueprint $table) {
            $table->dropIndex(['locked_at']);
            $table->dropColumn(['zone', 'weight_grams', 'quoted_at', 'locked_at']);
        });
    }
};
