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

        // PostgreSQL: Add new enum values using ALTER TYPE
        // Check if values exist before adding (idempotent)
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            // Get the enum type name - Laravel creates it as orders_payment_status
            // Add 'unpaid' before 'pending' if it doesn't exist
            DB::statement("DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'unpaid' AND enumtypid = 'orders_payment_status'::regtype) THEN
                    ALTER TYPE orders_payment_status ADD VALUE IF NOT EXISTS 'unpaid' BEFORE 'pending';
                END IF;
            EXCEPTION
                WHEN others THEN NULL;
            END $$;");

            // Add 'refunded' after 'failed' if it doesn't exist
            DB::statement("DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'refunded' AND enumtypid = 'orders_payment_status'::regtype) THEN
                    ALTER TYPE orders_payment_status ADD VALUE IF NOT EXISTS 'refunded' AFTER 'failed';
                END IF;
            EXCEPTION
                WHEN others THEN NULL;
            END $$;");

            // Change default to 'unpaid'
            DB::statement("ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'unpaid'");
        } else {
            // MySQL/SQLite: Use MODIFY COLUMN syntax
            DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('unpaid', 'pending', 'paid', 'failed', 'refunded') DEFAULT 'unpaid'");
        }

        // Set existing NULL payment_method values to 'cod' (backwards compatibility)
        DB::statement("UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL");
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL doesn't support removing enum values easily
            // Just change default back to 'pending'
            DB::statement("ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'pending'");
        } else {
            // MySQL: Revert enum
            DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending'");
        }

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
