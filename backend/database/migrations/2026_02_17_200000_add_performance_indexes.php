<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * T4: Add missing performance indexes for hot query paths.
 *
 * products.producer_id — every producer dashboard query
 * products.is_active   — public catalogue filter (WHERE is_active = true)
 * orders.created_at    — analytics/admin date range queries
 *
 * Note: order_items.product_id already indexed in create_order_items_table
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('producer_id');
            $table->index('is_active');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['producer_id']);
            $table->dropIndex(['is_active']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};
