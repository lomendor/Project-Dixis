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
        
        // Add FKs to cart_items table
        Schema::table('cart_items', function (Blueprint $table) use ($driver) {
            // Drop constraints if exist (database-agnostic)
            if ($driver === 'pgsql') {
                DB::statement('ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_foreign');
                DB::statement('ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_foreign');
            } else {
                // For SQLite and others, use try-catch
                try {
                    DB::statement('ALTER TABLE cart_items DROP FOREIGN KEY cart_items_user_id_foreign');
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
                try {
                    DB::statement('ALTER TABLE cart_items DROP FOREIGN KEY cart_items_product_id_foreign');
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
            }
            
            // Add FK constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
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
        
        // Drop FK constraints from cart_items table
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_foreign');
            DB::statement('ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_foreign');
        } else {
            // For SQLite and others, use try-catch
            try {
                DB::statement('ALTER TABLE cart_items DROP FOREIGN KEY cart_items_user_id_foreign');
            } catch (\Exception $e) {
                // Constraint doesn't exist, continue
            }
            try {
                DB::statement('ALTER TABLE cart_items DROP FOREIGN KEY cart_items_product_id_foreign');
            } catch (\Exception $e) {
                // Constraint doesn't exist, continue
            }
        }
    }
};
