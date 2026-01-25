<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass MP-ORDERS-SCHEMA-01: Create checkout_sessions table
 *
 * Parent entity for multi-producer checkout. Links N child orders
 * to a single Stripe PaymentIntent.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Stripe payment integration
            $table->string('stripe_payment_intent_id')->nullable()->index();

            // Totals (sum of all child orders)
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('shipping_total', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);

            // Status
            $table->enum('status', [
                'pending',           // Created, waiting for payment
                'payment_processing', // Payment submitted, waiting for confirmation
                'paid',              // Payment confirmed
                'failed',            // Payment failed
                'cancelled',         // User cancelled
            ])->default('pending');

            // Metadata
            $table->string('currency', 3)->default('EUR');
            $table->unsignedTinyInteger('order_count')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_sessions');
    }
};
