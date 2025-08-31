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
     * Aggressive approach: clean invalid data completely
     */
    private function fixOrdersConstraints(): void
    {
        // Drop all existing constraints first to avoid conflicts
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check");
        
        // Clean ALL invalid data that would violate new constraints
        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'delivered', 'cancelled'];
        $validPaymentStatuses = ['pending', 'paid', 'completed', 'failed', 'refunded'];
        
        // Delete orders with invalid status (aggressive cleanup)
        $deletedOrders = DB::table('orders')
            ->whereNotIn('status', $validStatuses)
            ->orWhereNotIn('payment_status', $validPaymentStatuses)
            ->delete();
            
        if ($deletedOrders > 0) {
            echo "🧹 Cleaned {$deletedOrders} orders with invalid status/payment_status values\n";
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
