<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass MP-ORDERS-SHIPPING-V1: Create order_shipping_lines table
 *
 * Stores per-producer shipping breakdown for multi-producer orders.
 * This is an ADDITIVE migration - no changes to existing tables.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_shipping_lines', function (Blueprint $table) {
            $table->id();

            // FK to orders - RESTRICT on delete to preserve order history
            $table->unsignedBigInteger('order_id');
            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('restrict');

            // Producer info - store ID and name for history preservation
            // FK to producers - SET NULL on delete (producer might be deactivated)
            $table->unsignedBigInteger('producer_id');
            $table->foreign('producer_id')
                ->references('id')
                ->on('producers')
                ->onDelete('restrict');
            $table->string('producer_name', 255);

            // Shipping calculation fields
            $table->decimal('subtotal', 10, 2)->comment('Sum of order items from this producer');
            $table->decimal('shipping_cost', 10, 2)->comment('Calculated shipping for this producer');
            $table->string('shipping_method', 50)->nullable()->comment('HOME, COURIER, etc.');
            $table->boolean('free_shipping_applied')->default(false)->comment('True if subtotal >= threshold');

            $table->timestamps();

            // Indexes for common queries
            $table->index('order_id');
            $table->index('producer_id');
            $table->index('created_at');

            // Composite index for order detail lookups
            $table->index(['order_id', 'producer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_shipping_lines');
    }
};
