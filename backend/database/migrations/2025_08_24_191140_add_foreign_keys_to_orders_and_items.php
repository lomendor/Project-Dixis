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
            // Drop constraint if exists (database-agnostic way)
            try {
                $table->dropForeign(['user_id']);
            } catch (\Exception $e) {
                // Constraint doesn't exist, continue
            }
            
            // Add FK constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add FKs to order_items table  
        Schema::table('order_items', function (Blueprint $table) {
            // Drop constraints if exist (database-agnostic way)
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
