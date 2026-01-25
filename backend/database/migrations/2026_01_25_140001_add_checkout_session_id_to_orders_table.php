<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass MP-ORDERS-SCHEMA-01: Add checkout_session_id FK to orders
 *
 * Links child orders to parent CheckoutSession for multi-producer checkout.
 * Nullable to maintain backward compatibility with standalone orders.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // FK to parent checkout session (nullable for backward compatibility)
            $table->foreignId('checkout_session_id')
                ->nullable()
                ->after('user_id')
                ->constrained('checkout_sessions')
                ->nullOnDelete();

            // Flag to distinguish child orders from standalone orders
            $table->boolean('is_child_order')->default(false)->after('checkout_session_id');

            // Index for efficient queries by session
            $table->index(['checkout_session_id', 'is_child_order']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['checkout_session_id', 'is_child_order']);
            $table->dropConstrainedForeignId('checkout_session_id');
            $table->dropColumn('is_child_order');
        });
    }
};
