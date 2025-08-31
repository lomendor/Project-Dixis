<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
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
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'completed', 'failed', 'refunded'))");

        // Update status enum to include 'confirmed' and 'delivered'
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'delivered', 'cancelled'))");
    }

    /**
     * Fix existing data that violates the new constraints
     */
    private function fixOrdersConstraints(): void
    {
        // Map old status values to new valid values
        $statusMappings = [
            'paid' => 'completed',  // paid orders are considered completed
        ];

        foreach ($statusMappings as $oldStatus => $newStatus) {
            DB::table('orders')
                ->where('status', $oldStatus)
                ->update(['status' => $newStatus]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original constraints
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed'))");

        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled'))");
    }
};
