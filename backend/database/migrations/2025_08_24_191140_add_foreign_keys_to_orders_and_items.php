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
            // Database-agnostic FK constraint guard
            if (DB::getDriverName() === 'pgsql') {
                // Postgres: use IF EXISTS
                DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_foreign');
            } else {
                // SQLite/MySQL: use try-catch
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
            }
            
            // Add FK constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add FKs to order_items table  
        Schema::table('order_items', function (Blueprint $table) {
            // Database-agnostic FK constraint guards
            if (DB::getDriverName() === 'pgsql') {
                // Postgres: use IF EXISTS
                DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_foreign');
                DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign');
            } else {
                // SQLite/MySQL: use try-catch
                try {
                    $table->dropForeign(['order_id']);
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
                try {
                    $table->dropForeign(['product_id']);
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
            }
            
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
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['product_id']);
        });
        
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
