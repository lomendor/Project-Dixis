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
        // Add FK to orders table
        Schema::table('orders', function (Blueprint $table) {
            // Drop constraint if exists (idempotent)
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_foreign');
            
            // Add FK constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add FKs to order_items table  
        Schema::table('order_items', function (Blueprint $table) {
            // Drop constraints if exist (idempotent)
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_foreign');
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign');
            
            // Add FK constraints
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop FK constraints from order_items table
        DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_foreign');
        DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign');
        
        // Drop FK constraint from orders table
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_foreign');
    }
};
