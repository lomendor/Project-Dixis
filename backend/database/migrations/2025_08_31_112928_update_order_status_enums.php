<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, fix existing data that violates the new constraints
        $this->fixOrdersConstraints();

        // Update payment_status enum to include 'completed' and 'refunded'
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check');
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'completed', 'failed', 'refunded'))");

        // Update status enum to include 'confirmed' and 'delivered'
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'delivered', 'cancelled'))");
    }

    /**
     * Deterministic PostgreSQL fix: Hard-drop all CHECK constraints then normalize data
     * This approach ensures clean slate for constraint rebuilding
     */
    private function fixOrdersConstraints(): void
    {
        // Step 1: Hard-drop ALL existing CHECK constraints on orders table using PostgreSQL DO block
        DB::statement("
            DO $$
            DECLARE r RECORD;
            BEGIN
                FOR r IN SELECT conname FROM pg_constraint 
                WHERE conrelid = 'orders'::regclass AND contype = 'c' AND conname LIKE 'orders_%_check'
                LOOP
                    EXECUTE 'ALTER TABLE orders DROP CONSTRAINT ' || quote_ident(r.conname) || ' CASCADE';
                END LOOP;
            END$$;
        ");

        // Step 2: Normalize existing data to valid enum values
        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'delivered', 'cancelled'];
        $validPaymentStatuses = ['pending', 'paid', 'completed', 'failed', 'refunded'];

        // Update invalid status values to 'pending' (most conservative)
        $updatedStatus = DB::table('orders')
            ->whereNotIn('status', $validStatuses)
            ->update(['status' => 'pending']);

        // Update invalid payment_status values to 'pending' (most conservative)
        $updatedPaymentStatus = DB::table('orders')
            ->whereNotIn('payment_status', $validPaymentStatuses)
            ->update(['payment_status' => 'pending']);

        if ($updatedStatus > 0 || $updatedPaymentStatus > 0) {
            echo "🔧 Normalized {$updatedStatus} status + {$updatedPaymentStatus} payment_status values\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original constraints
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check');
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed'))");

        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled'))");
    }
};
