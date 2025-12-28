<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Pass 51: Add payment provider fields for card payments
 *
 * - payment_provider: tracks which provider processed the payment (stripe, etc)
 * - payment_reference: external transaction/session ID from provider
 * - Updates payment_status to support 'unpaid' and 'refunded' states
 *
 * Backwards compatible: existing COD orders remain valid (defaults applied)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Add payment_provider (stripe, etc) - nullable for COD orders
            if (!Schema::hasColumn('orders', 'payment_provider')) {
                $table->string('payment_provider', 50)->nullable()->after('payment_method');
            }

            // Add payment_reference (external transaction ID) - nullable
            if (!Schema::hasColumn('orders', 'payment_reference')) {
                $table->string('payment_reference', 255)->nullable()->after('payment_provider');
            }
        });

        // Update payment_status enum to include 'unpaid' and 'refunded'
        // Note: Using raw SQL because Laravel doesn't support modifying enums easily
        // This is safe because we're only ADDING values, not removing existing ones
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('unpaid', 'pending', 'paid', 'failed', 'refunded') DEFAULT 'unpaid'");

        // Set existing NULL payment_method values to 'cod' (backwards compatibility)
        DB::statement("UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL");
    }

    public function down(): void
    {
        // Revert payment_status back to original enum
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending'");

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'payment_provider')) {
                $table->dropColumn('payment_provider');
            }
            if (Schema::hasColumn('orders', 'payment_reference')) {
                $table->dropColumn('payment_reference');
            }
        });
    }
};
