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
        // Database-agnostic FK constraint handling
        $driver = DB::connection()->getDriverName();
        
        // Add FK to orders table
        Schema::table('orders', function (Blueprint $table) use ($driver) {
            // Drop constraint if exists (database-agnostic)
            if ($driver === 'pgsql') {
                DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_foreign');
            } else {
                // For SQLite and others, use try-catch
                try {
                    DB::statement('ALTER TABLE orders DROP FOREIGN KEY orders_user_id_foreign');
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
            }
            
            // Add FK constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add FKs to order_items table  
        Schema::table('order_items', function (Blueprint $table) use ($driver) {
            // Drop constraints if exist (database-agnostic)
            if ($driver === 'pgsql') {
                DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_foreign');
                DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign');
            } else {
                // For SQLite and others, use try-catch
                try {
                    DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_order_id_foreign');
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
                try {
                    DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_product_id_foreign');
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
        // Database-agnostic FK constraint handling
        $driver = DB::connection()->getDriverName();
        
        // Drop FK constraints from order_items table
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_foreign');
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign');
        } else {
            // For SQLite and others, use try-catch
            try {
                DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_order_id_foreign');
            } catch (\Exception $e) {
                // Constraint doesn't exist, continue
            }
            try {
                DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_product_id_foreign');
            } catch (\Exception $e) {
                // Constraint doesn't exist, continue
            }
        }
        
        // Drop FK constraint from orders table
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_foreign');
        } else {
            // For SQLite and others, use try-catch
            try {
                DB::statement('ALTER TABLE orders DROP FOREIGN KEY orders_user_id_foreign');
            } catch (\Exception $e) {
                // Constraint doesn't exist, continue
            }
        }
    }
};
